// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs"

export default withNuxt(
  {
    ignores: [
      ".data/**",
      ".nuxt/**",
      ".output/**",
      ".worktrees/**",
      "node_modules/**",
      "public/admin/**",
    ],
  },
  // Your custom configs here
  {
    rules: {
      semi: "off",
      "@typescript-eslint/semi": "off",
      "vue/multi-word-component-names": "off",
    },
  }
)
