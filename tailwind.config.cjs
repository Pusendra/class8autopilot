/** Class8 brand tokens (from class8.com's stylesheet) exposed as Tailwind colors. */
module.exports = {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        navy: 'var(--c8-navy)',
        purple: { DEFAULT: 'var(--c8-purple)', light: 'var(--c8-purple-light)', dark: 'var(--c8-purple-dark)' },
        violet: 'var(--c8-violet-tint)',
        coral: { DEFAULT: 'var(--c8-coral)', dark: 'var(--c8-coral-dark)' },
        good: { DEFAULT: 'var(--c8-good)', bg: 'var(--c8-good-bg)' },
        warn: { DEFAULT: 'var(--c8-warn)', bg: 'var(--c8-warn-bg)' },
        bad: { DEFAULT: 'var(--c8-bad)', bg: 'var(--c8-bad-bg)' },
        ink: { DEFAULT: 'var(--c8-ink)', soft: 'var(--c8-ink-soft)' },
        line: 'var(--c8-line)',
        wash: 'var(--c8-wash)',
      },
      fontFamily: {
        display: ['Anton', 'Impact', 'sans-serif'],
        sans: ['Sora', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
