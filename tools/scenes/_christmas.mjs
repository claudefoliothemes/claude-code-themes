// Drawing helpers shared by the Christmas scenes: Santa, a reindeer, and a sleigh, in a flat
// cartoon style. Each returns SVG markup around its own origin; callers place it with a transform.
// Animated parts switch between drawn frames with the `half` keyframes (two frames, one per half
// of the cycle), which every scene using these helpers must define.

const RED = '#d42c2c', FUR = '#f7f7f7', SKIN = '#f2c9a5', BOOT = '#1d1a22', GOLD = '#e8c062'

const halfFrame = (period, second) => `style="animation:half ${period}s steps(1,end)${second ? ` -${period / 2}s` : ''} infinite"`

// Santa standing, feet at the origin, about 235 units tall. `wave` is the waving period in
// seconds; the right arm switches between two raised positions.
export function santa({ wave = 1 } = {}) {
  const arm = (x2, y2, second) =>
    `<g ${halfFrame(wave, second)}><path d="M38 -138L${x2} ${y2}" stroke="${RED}" stroke-width="20" stroke-linecap="round"/>` +
    `<circle cx="${x2}" cy="${y2}" r="9" fill="${FUR}"/><circle cx="${x2 + 2}" cy="${y2 - 8}" r="10" fill="${BOOT}"/></g>`
  return (
    `<rect x="-34" y="-20" width="28" height="20" rx="8" fill="${BOOT}"/><rect x="6" y="-20" width="28" height="20" rx="8" fill="${BOOT}"/>` +
    `<rect x="-28" y="-64" width="56" height="48" fill="#b52424"/>` +
    `<path d="M-52 -50Q-58 -122 -30 -150H30Q58 -122 52 -50Z" fill="${RED}"/>` +
    `<rect x="-56" y="-62" width="112" height="15" rx="7" fill="${FUR}"/><rect x="-6" y="-150" width="12" height="90" fill="${FUR}"/>` +
    `<rect x="-54" y="-102" width="108" height="15" fill="${BOOT}"/><rect x="-12" y="-105" width="24" height="21" rx="3" fill="${GOLD}"/><rect x="-6" y="-99" width="12" height="9" fill="${BOOT}"/>` +
    `<path d="M-38 -138L-60 -84" stroke="${RED}" stroke-width="20" stroke-linecap="round"/><circle cx="-60" cy="-82" r="9" fill="${FUR}"/><circle cx="-62" cy="-74" r="10" fill="${BOOT}"/>` +
    arm(76, -192, false) + arm(90, -170, true) +
    `<circle cx="0" cy="-174" r="25" fill="${SKIN}"/><circle cx="-14" cy="-168" r="5" fill="#f2a3a3"/><circle cx="14" cy="-168" r="5" fill="#f2a3a3"/>` +
    `<path d="M-31 -170Q-38 -128 0 -116Q38 -128 31 -170Q16 -156 0 -158Q-16 -156 -31 -170Z" fill="${FUR}"/>` +
    `<ellipse cx="-9" cy="-162" rx="10" ry="5" fill="${FUR}"/><ellipse cx="9" cy="-162" rx="10" ry="5" fill="${FUR}"/>` +
    `<circle cx="0" cy="-167" r="4.5" fill="#e8908a"/><circle cx="-9" cy="-178" r="2.6" fill="${BOOT}"/><circle cx="9" cy="-178" r="2.6" fill="${BOOT}"/>` +
    `<path d="M-27 -190Q-20 -236 30 -238Q44 -236 46 -222Q30 -226 26 -190Z" fill="${RED}"/>` +
    `<circle cx="46" cy="-222" r="10" fill="${FUR}"/><rect x="-31" y="-198" width="62" height="14" rx="7" fill="${FUR}"/>`
  )
}

// A reindeer facing right, body centered on the origin, about 140 units nose to tail. The legs
// gallop between two frames every `gallop` seconds. `glow` gives it the glowing red nose.
export function reindeer({ gallop = 0.4, glow = false } = {}) {
  const BODY = '#8b5a3c', LIGHT = '#b9845a', LEG = '#6e4630', HOOF = '#2a1a14'
  const legs = (paths, second) =>
    `<g ${halfFrame(gallop, second)} fill="none" stroke="${LEG}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="${paths}"/></g>`
  const nose = glow
    ? `<circle cx="80" cy="-43" r="48" fill="url(#noseGlow)" style="animation:glow 1.2s steps(1,end) infinite"/><circle cx="80" cy="-43" r="6" fill="#ff3434"/><circle cx="78" cy="-45" r="2" fill="#ffb3b3"/>`
    : `<circle cx="80" cy="-43" r="4.5" fill="${HOOF}"/>`
  return (
    legs('M28 12L58 26M22 14L50 34M-30 12L-62 20M-24 14L-54 30', false) +
    legs('M28 12L40 32L52 30M22 14L30 34L42 36M-30 12L-40 32L-28 36M-24 14L-30 34L-18 38', true) +
    `<path d="M-46 -10Q-58 -20 -50 -26Q-42 -18 -40 -12Z" fill="#efe6d8"/>` +
    `<ellipse rx="46" ry="22" fill="${BODY}"/><ellipse cy="9" rx="32" ry="11" fill="${LIGHT}"/>` +
    `<path d="M22 -14L44 -46L60 -38L40 0Z" fill="${BODY}"/>` +
    `<rect x="22" y="-18" width="22" height="9" rx="4" transform="rotate(-50 33 -14)" fill="#c8323c"/><circle cx="40" cy="-8" r="4.5" fill="${GOLD}"/>` +
    `<g fill="none" stroke="#dcc49c" stroke-width="3.5" stroke-linecap="round"><path d="M54 -56L46 -82M46 -82L38 -92M46 -82L56 -94M50 -70L60 -76"/><path d="M60 -56L64 -84M64 -84L58 -96M64 -84L74 -92"/></g>` +
    `<ellipse cx="50" cy="-56" rx="7" ry="4" transform="rotate(-30 50 -56)" fill="${BODY}"/>` +
    `<ellipse cx="62" cy="-46" rx="17" ry="11" transform="rotate(-12 62 -46)" fill="${BODY}"/><ellipse cx="74" cy="-42" rx="8" ry="6.5" fill="${LIGHT}"/>` +
    `<circle cx="61" cy="-51" r="2.2" fill="${HOOF}"/>` + nose
  )
}

// A sleigh facing right, runners resting on y = 18. The sack of gifts rides at the back.
export function sleigh() {
  return (
    `<path d="M-118 -42Q-130 -96 -94 -100Q-60 -104 -66 -62Z" fill="#7b3f2a"/>` +
    `<rect x="-112" y="-92" width="22" height="18" fill="#3ccf7e"/><rect x="-92" y="-104" width="18" height="22" fill="#f0b84a"/><rect x="-84" y="-84" width="6" height="2" fill="#fff"/>` +
    `<path d="M-100 -8Q-108 -66 -80 -68H34Q70 -68 76 -40Q82 -6 48 -2H-86Z" fill="#c8323c"/>` +
    `<path d="M-100 -8Q-108 -66 -80 -68H34Q70 -68 76 -40Q82 -6 48 -2H-86Z" fill="none" stroke="${GOLD}" stroke-width="4"/>` +
    `<path d="M-60 -2V18M30 -2V18" stroke="${GOLD}" stroke-width="5"/>` +
    `<path d="M-104 18H64Q96 18 100 -6" fill="none" stroke="${GOLD}" stroke-width="6" stroke-linecap="round"/>`
  )
}

// Gradient the glowing nose uses; scenes add it to their defs.
export const NOSE_GLOW = `<radialGradient id="noseGlow"><stop offset="0" stop-color="#ff3b3b" stop-opacity=".95"/><stop offset=".35" stop-color="#ff3b3b" stop-opacity=".4"/><stop offset="1" stop-color="#ff3b3b" stop-opacity="0"/></radialGradient>`

// Keyframes the helpers rely on: two-frame switching and the nose glow pulse.
export const CHRISTMAS_CSS = `@keyframes half{0%{opacity:1}50%{opacity:0}}@keyframes glow{0%{opacity:1}50%{opacity:.5}}`
