import frappeUIPreset from 'frappe-ui/tailwind'

export default {
  presets: [frappeUIPreset],
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/frappe-ui/src/**/*.{vue,js,ts,jsx,tsx}',
    '../node_modules/frappe-ui/src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/frappe-ui/frappe/**/*.{vue,js,ts,jsx,tsx}',
    '../node_modules/frappe-ui/frappe/**/*.{vue,js,ts,jsx,tsx}',
    // linked @framework/ui source (apps/frappe/ui/src) — scan so its utility and
    // arbitrary-variant classes (e.g. Notifications TabButtons overrides) are generated
    '../../frappe/ui/src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  safelist: [{ pattern: /!(text|bg)-/, variants: ['hover', 'active'] }],
  theme: {
    extend: {
      // Citron DS type voices. `sans` also drives Tailwind preflight, so the
      // whole app inherits IBM Plex Sans; `display` is Space Grotesk for
      // headings/brand moments; `mono` is IBM Plex Mono for data/eyebrows.
      fontFamily: {
        sans: 'var(--inkblot-typography-font-family-sans)',
        display: 'var(--inkblot-typography-font-family-display)',
        mono: 'var(--inkblot-typography-font-family-mono)',
      },
      // Citron DS accent scales as first-class utilities (bg-citron-500,
      // text-leaf-700, ...). Values come from the DS variables so the token
      // package stays the single source of truth.
      colors: {
        citron: Object.fromEntries(
          [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((s) => [
            s,
            `var(--inkblot-color-accent-citron-${s})`,
          ]),
        ),
        leaf: Object.fromEntries(
          [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((s) => [
            s,
            `var(--inkblot-color-accent-leaf-${s})`,
          ]),
        ),
        'warm-ink': 'var(--inkblot-color-neutral-ink)',
      },
      transitionTimingFunction: {
        citron: 'var(--inkblot-easing-signature)',
        'citron-out': 'var(--inkblot-easing-out)',
        'citron-swift': 'var(--inkblot-easing-swift)',
      },
      transitionDuration: {
        fast: '120ms',
        normal: '200ms',
        slow: '320ms',
      },
    },
  },
  plugins: [],
}
