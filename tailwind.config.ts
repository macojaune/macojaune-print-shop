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
      sans: ['Hind', 'sans-serif']
    },
    extend: {
      fontFamily: {
        display: ['Righteous', 'sans-serif']
      },
      aspectRatio: {
        portrait: '9 / 16'
      }
    }
  },
  plugins: []
}
