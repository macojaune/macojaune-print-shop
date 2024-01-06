import { MarkdownParsedContent } from '@nuxt/content/dist/runtime/types'

export interface Article extends MarkdownParsedContent {
  id: number
  title:string
  date:string
  updatedAt:string
  author: string
  layout: string
  permalink: string
  image: string
  categories: string[]
  tags: string[]
}
