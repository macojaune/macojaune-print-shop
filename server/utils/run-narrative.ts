import { readdir, readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { parseMarkdown } from "@nuxtjs/mdc/runtime"

const RUNS_DIRECTORY = resolve(process.cwd(), "content/runs")
const GALLERY_INTERLUDE_MARKER = "<!-- gallery:interlude -->"

type MarkdownDocument = {
  body: Awaited<ReturnType<typeof parseMarkdown>>["body"]
}

type RunNarrativeDocuments = {
  intro: MarkdownDocument | null
  interlude: MarkdownDocument | null
}

let runSlugIndexPromise: Promise<Map<string, string>> | null = null
const runNarrativeCache = new Map<string, Promise<RunNarrativeDocuments>>()

const extractFrontmatterValue = (source: string, field: string) => {
  const match = source.match(new RegExp(`^${field}:\\s*(.+)$`, "m"))
  return match?.[1]?.trim().replace(/^['"]|['"]$/g, "") || ""
}

const extractMarkdownBody = (source: string) => {
  const frontmatterMatch = source.match(/^---\s*\n[\s\S]*?\n---\s*\n?/)
  if (!frontmatterMatch) {
    return source.trim()
  }

  return source.slice(frontmatterMatch[0].length).trim()
}

const splitMarkdownBody = (markdown: string) => {
  const markerIndex = markdown.indexOf(GALLERY_INTERLUDE_MARKER)

  if (markerIndex === -1) {
    return {
      intro: markdown.trim(),
      interlude: "",
    }
  }

  return {
    intro: markdown.slice(0, markerIndex).trim(),
    interlude: markdown.slice(markerIndex + GALLERY_INTERLUDE_MARKER.length).trim(),
  }
}

const toMarkdownDocument = async (markdown: string) => {
  if (!markdown.trim()) {
    return null
  }

  const parsed = await parseMarkdown(markdown)

  return {
    body: parsed.body,
  }
}

const getRunSlugIndex = async () => {
  if (!runSlugIndexPromise) {
    runSlugIndexPromise = (async () => {
      const files = await readdir(RUNS_DIRECTORY)
      const index = new Map<string, string>()

      await Promise.all(
        files
          .filter((file) => file.endsWith(".md"))
          .map(async (file) => {
            const absolutePath = resolve(RUNS_DIRECTORY, file)
            const source = await readFile(absolutePath, "utf8")
            const slug = extractFrontmatterValue(source, "slug")

            if (slug) {
              index.set(slug, absolutePath)
            }
          }),
      )

      return index
    })()
  }

  return runSlugIndexPromise
}

export const getRunNarrativeDocuments = async (slug: string): Promise<RunNarrativeDocuments> => {
  if (!slug) {
    return { intro: null, interlude: null }
  }

  if (!runNarrativeCache.has(slug)) {
    runNarrativeCache.set(
      slug,
      (async () => {
        const slugIndex = await getRunSlugIndex()
        const filePath = slugIndex.get(slug)

        if (!filePath) {
          return { intro: null, interlude: null }
        }

        const source = await readFile(filePath, "utf8")
        const markdownBody = extractMarkdownBody(source)
        const sections = splitMarkdownBody(markdownBody)

        return {
          intro: await toMarkdownDocument(sections.intro),
          interlude: await toMarkdownDocument(sections.interlude),
        }
      })(),
    )
  }

  return runNarrativeCache.get(slug)!
}

