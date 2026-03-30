import { defineCollection, defineContentConfig } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/**/*.{md,mdx}',
    }),
    projects: defineCollection({
      type: 'page',
      source: 'projects/**/*.md',
    }),
    mentions: defineCollection({
      type: 'page',
      source: 'mentions/**/*.md',
    }),
    runs: defineCollection({
      type: 'page',
      source: 'runs/**/*.md',
    }),
    links: defineCollection({
      type: 'data',
      source: 'links.yaml',
    }),
  },
})
