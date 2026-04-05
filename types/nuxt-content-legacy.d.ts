declare module '@nuxt/content/types' {
  export interface QueryBuilderParams {
    path?: string
    where?: Record<string, unknown> | Array<Record<string, unknown>>
    sort?: Record<string, number> | Array<Record<string, number>>
    limit?: number
    skip?: number
  }
}

declare module '@nuxt/content/dist/runtime/types' {
  export interface MarkdownParsedContent {
    [key: string]: unknown
  }
}
