// Publishes each theme as a zip on a GitHub release and points the marketplace at it. Claude Code
// downloads a theme's zip when someone installs it, so GitHub's per-file download counts show how
// often each theme is installed. Run from the repo root:
//
//   node tools/release-themes.mjs            build dist/<theme>-<version>.zip and print hashes
//   node tools/release-themes.mjs --publish  also create the release, upload any new zips, and
//                                            point .claude-plugin/marketplace.json at them
//
// --publish needs GITHUB_TOKEN (environment or a gitignored .env) with Contents read/write on the
// repo. An uploaded zip is never replaced, because that would reset its download count: to ship
// a change, bump VERSION in themes.config.mjs and rebuild.
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { crc32, deflateRawSync } from 'node:zlib'
import { REPO, VERSION } from './themes.config.mjs'

const MARKETPLACE = '.claude-plugin/marketplace.json'
const TAG = `v${VERSION}`
const publish = process.argv.includes('--publish')

// The files a theme needs at install time: its manifest, icon and hooks. Tests and generated
// types stay out of the zip.
const filesOf = (dir) => {
  const out = []
  const walk = (d) => {
    for (const name of readdirSync(d).sort()) {
      const p = join(d, name)
      if (statSync(p).isDirectory()) {
        if (name !== 'types') walk(p)
      } else out.push(relative(dir, p).split('\\').join('/'))
    }
  }
  for (const top of ['.claude-plugin', 'hooks']) walk(join(dir, top))
  return out
}

// A minimal zip writer with a fixed timestamp, so the same files always make the same zip.
const DOS_TIME = 0
const DOS_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1
const zip = (dir, names) => {
  const locals = [], centrals = []
  let offset = 0
  for (const name of names) {
    const data = readFileSync(join(dir, name))
    const packed = deflateRawSync(data, { level: 9 })
    const nameBuf = Buffer.from(name, 'utf8')
    const crc = crc32(data)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6)
    local.writeUInt16LE(8, 8); local.writeUInt16LE(DOS_TIME, 10); local.writeUInt16LE(DOS_DATE, 12)
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(packed.length, 18); local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(nameBuf.length, 26); local.writeUInt16LE(0, 28)
    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0x0800, 8); central.writeUInt16LE(8, 10); central.writeUInt16LE(DOS_TIME, 12)
    central.writeUInt16LE(DOS_DATE, 14); central.writeUInt32LE(crc, 16); central.writeUInt32LE(packed.length, 20)
    central.writeUInt32LE(data.length, 24); central.writeUInt16LE(nameBuf.length, 28)
    central.writeUInt32LE(offset, 42)
    locals.push(local, nameBuf, packed)
    centrals.push(central, nameBuf)
    offset += local.length + nameBuf.length + packed.length
  }
  const cd = Buffer.concat(centrals)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(names.length, 8); end.writeUInt16LE(names.length, 10)
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16)
  return Buffer.concat([...locals, cd, end])
}

const marketplace = JSON.parse(readFileSync(MARKETPLACE, 'utf8'))
mkdirSync('dist', { recursive: true })
const built = marketplace.plugins.map(({ name }) => {
  const dir = join('themes', name)
  const version = JSON.parse(readFileSync(join(dir, '.claude-plugin', 'plugin.json'), 'utf8')).version
  if (version !== VERSION) throw new Error(`${name} is at ${version}, not ${VERSION}: rebuild with tools/build-themes.mjs`)
  const file = `${name}-${version}.zip`
  const data = zip(dir, filesOf(dir))
  writeFileSync(join('dist', file), data)
  const sha256 = createHash('sha256').update(data).digest('hex')
  console.log(`${file}  ${data.length} bytes  ${sha256}`)
  return { name, file, data, sha256 }
})
if (!publish) process.exit(0)

const token = process.env.GITHUB_TOKEN ?? (existsSync('.env') ? readFileSync('.env', 'utf8').match(/^GITHUB_TOKEN=["']?([^"'\r\n]+)/m)?.[1] : undefined)
if (!token) throw new Error('GITHUB_TOKEN is not set (environment or .env)')
const gh = async (url, init = {}) => {
  const res = await fetch(url.startsWith('https:') ? url : `https://api.github.com${url}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'claudefolio-theme-release', ...init.headers },
  })
  if (!res.ok && res.status !== 404) throw new Error(`${init.method ?? 'GET'} ${url}: ${res.status} ${await res.text()}`)
  return res.status === 404 ? null : res.json()
}

let release = await gh(`/repos/${REPO}/releases/tags/${TAG}`)
if (!release) {
  release = await gh(`/repos/${REPO}/releases`, {
    method: 'POST',
    body: JSON.stringify({ tag_name: TAG, target_commitish: 'main', name: `Themes ${VERSION}`, body: 'The theme zips Claude Code installs from. Each zip\'s download count shows how often that theme is installed.' }),
  })
  console.log(`created release ${TAG}`)
}
const existing = new Map(release.assets.map((a) => [a.name, a]))
for (const t of built) {
  const asset = existing.get(t.file)
  if (asset) {
    const same = asset.digest ? asset.digest === `sha256:${t.sha256}` : asset.size === t.data.length
    if (!same) throw new Error(`${t.file} is already on ${TAG} with different contents: bump VERSION instead of replacing it`)
    continue
  }
  await gh(`https://uploads.github.com/repos/${REPO}/releases/${release.id}/assets?name=${encodeURIComponent(t.file)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/zip' },
    body: t.data,
  })
  console.log(`uploaded ${t.file}`)
}

for (const entry of marketplace.plugins) {
  const t = built.find((b) => b.name === entry.name)
  entry.source = { source: 'archive', url: `https://github.com/${REPO}/releases/download/${TAG}/${t.file}`, sha256: t.sha256 }
}
writeFileSync(MARKETPLACE, JSON.stringify(marketplace, null, 2) + '\n')
console.log(`${MARKETPLACE} now installs from ${TAG}`)
