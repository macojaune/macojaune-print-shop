import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './App.{js,ts,vue}',
    './app.{js,ts,vue}',
    './Error.{js,ts,vue}',
    './error.{js,ts,vue}'
  ],
  theme: {
    fontFamily: {
      sans: ['Hind', 'sans-serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
    },
    extend: {
      fontFamily: {
        display: ['Righteous', 'sans-serif']
      },
      aspectRatio: {
        portrait: '9 / 16'
      },
      colors: {
        'crt-green': '#00ff41',
        'crt-magenta': '#ff00ff',
        'crt-cyan': '#00ffff',
        'crt-yellow': '#ffff00'
      }
    }
  },
  plugins: []
}
