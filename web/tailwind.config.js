/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#fcfbfa',
          100: '#fbf9f5',
          200: '#f5f1ea',
          300: '#e8e2d5',
          400: '#d5cbb8',
          border: '#e4dfd5',
          dark: '#141413',
          darkCard: '#1c1c1a',
          darkBorder: '#2e2e2a'
        },
        waltz: {
          rust: '#b4432c',
          rustLight: '#fbece8',
          teal: '#155e75',
          tealLight: '#e6f4f7',
          gold: '#b47b19',
          ink: '#1c1917',
          muted: '#78716c'
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'Cambria', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
