// The theme catalog: palette, glass and copy for each scene in tools/scenes/<name>.mjs.

export const VERSION = '0.1.0'

// Written into every theme's plugin.json.
export const PUBLISHER = {
  author: { name: 'ClaudeFolio', url: 'https://claudefolio.com' },
  homepage: 'https://claudefolio.com/themes',
  license: 'MIT',
  keywords: ['theme', 'backdrop'],
}

export const THEMES = [
  {
    name: 'digital-rain',
    label: 'Digital Rain',
    description: 'Columns of green glyphs falling behind the conversation, on near-black green.',
    alt: 'Columns of green glyphs falling like rain',
    tint: '#030805',
    opacity: 0.55,
    roles: { accent: '#39e58c', danger: '#ff5f6d', success: '#7be37b', warning: '#e6c84f', pro: '#9b8cff' },
    anchors: { 'surface-0': '#030805', 'surface-1': '#07100a', 'surface-2': '#0a150d', 'surface-3': '#0d1a10', 'text-primary': '#dcffe4', 'text-secondary': '#a9e6b6', 'text-muted': '#78b886' },
  },
  {
    name: 'braille-stars',
    label: 'Braille Stars',
    description: 'A night sky of twinkling braille-dot stars, with a constellation that spells "stars".',
    alt: 'A night sky of twinkling braille dots, with a constellation that spells stars',
    tint: '#0a0e1d',
    opacity: 0.45,
    roles: { accent: '#8ea2ff', danger: '#ff6b7a', success: '#6fd39a', warning: '#f2c45a', pro: '#b48cff' },
    anchors: { 'surface-0': '#0a0e1d', 'surface-1': '#10152a', 'surface-2': '#151b33', 'surface-3': '#181e39', 'text-primary': '#e9edfb', 'text-secondary': '#c0c8e2', 'text-muted': '#949fc2' },
  },
  {
    name: 'neon-horizon',
    label: 'Neon Horizon',
    description: 'A retro sunset with a striped sun, neon mountains, and a grid rolling toward you.',
    alt: 'A neon sunset over a glowing grid that rolls toward the viewer',
    tint: '#0e0618',
    opacity: 0.55,
    roles: { accent: '#c86bff', danger: '#ff4f6d', success: '#5ff2c3', warning: '#ffcc4d', pro: '#7aa8ff' },
    anchors: { 'surface-0': '#0e0618', 'surface-1': '#150a22', 'surface-2': '#1b0e2b', 'surface-3': '#201233', 'text-primary': '#f6e9ff', 'text-secondary': '#d6bdf0', 'text-muted': '#a98cc8' },
  },
  {
    name: 'firefly-night',
    label: 'Firefly Night',
    description: 'Fireflies blinking and drifting at the edge of a dark pine forest.',
    alt: 'Fireflies blinking above the grass at the edge of a dark forest',
    tint: '#060d09',
    opacity: 0.5,
    roles: { accent: '#b8e04a', danger: '#ff6b5e', success: '#5fd38a', warning: '#f5c84c', pro: '#9f8cff' },
    anchors: { 'surface-0': '#060d09', 'surface-1': '#0a140e', 'surface-2': '#0e1a13', 'surface-3': '#111f17', 'text-primary': '#eef7e6', 'text-secondary': '#c9dcc0', 'text-muted': '#93ab8b' },
  },
  {
    name: 'amber-terminal',
    label: 'Amber Terminal',
    description: 'An old amber CRT: scrolling log lines, scanlines, and a blinking cursor.',
    alt: 'Amber log lines scrolling up an old CRT screen',
    tint: '#0b0600',
    opacity: 0.6,
    roles: { accent: '#ffb000', danger: '#ff5b4a', success: '#9fd36b', warning: '#ffd34d', pro: '#c39bff' },
    anchors: { 'surface-0': '#0c0700', 'surface-1': '#140c02', 'surface-2': '#1a1004', 'surface-3': '#1f1406', 'text-primary': '#ffe7c2', 'text-secondary': '#f2c98d', 'text-muted': '#c79a5c' },
  },
  {
    name: 'night-sakura',
    label: 'Night Sakura',
    description: 'A moonlit branch of cherry blossoms, with petals tumbling down.',
    alt: 'Cherry blossom petals falling past a moonlit branch',
    tint: '#0d0b16',
    opacity: 0.5,
    roles: { accent: '#ff8fc0', danger: '#ff5c6c', success: '#7fd8a4', warning: '#ffcf66', pro: '#a99bff' },
    anchors: { 'surface-0': '#0d0b16', 'surface-1': '#13101f', 'surface-2': '#191427', 'surface-3': '#1d172e', 'text-primary': '#fbeef5', 'text-secondary': '#e4c9d8', 'text-muted': '#b494a8' },
  },
  {
    name: 'holiday-lights',
    label: 'Holiday Lights',
    description: 'String lights blinking over a snowy night, with a lit pine and falling snow.',
    alt: 'Holiday string lights blinking over a snowy night with a lit pine tree',
    tint: '#08121a',
    opacity: 0.5,
    roles: { accent: '#e8b84a', danger: '#ff5a5f', success: '#3ccf7e', warning: '#ffb347', pro: '#7fb2ff' },
    anchors: { 'surface-0': '#08121a', 'surface-1': '#0c1821', 'surface-2': '#101e29', 'surface-3': '#132230', 'text-primary': '#eef4f8', 'text-secondary': '#c6d3dc', 'text-muted': '#90a3b1' },
  },
  {
    // A still, light theme: no scene file, the app draws the ground itself. tint and opacity
    // only shape the preview's mock window.
    name: 'clean-slate',
    label: 'Clean Slate',
    mode: 'light',
    description: 'A quiet light theme in white and soft gray, with a still backdrop and nothing moving.',
    ground: { gradient: { stops: ['#fbfbfc', '#e9ecef'], angle: 180 } },
    tint: '#f4f5f7',
    opacity: 0.7,
    roles: { accent: '#4a5568', danger: '#c53030', success: '#2f855a', warning: '#b7791f', pro: '#6b46c1' },
    anchors: { 'surface-0': '#eceef1', 'surface-1': '#f4f5f7', 'surface-2': '#fbfbfc', 'text-primary': '#1d2127', 'text-secondary': '#454b55', 'text-muted': '#5f6672' },
  },
]
