import { promises as fs } from "node:fs"
import path from "node:path"

type FrontmatterRecord = Record<string, string>

const CONTENT_ROOT = path.resolve(process.cwd(), "content")
const SITE_URL = "https://macojaune.com"

const STATIC_ROUTES = [
  { loc: "/", priority: "1.0" },
  { loc: "/galerie", priority: "0.9" },
  { loc: "/projets", priority: "0.9" },
  { loc: "/blog", priority: "0.8" },
  { loc: "/a-propos", priority: "0.7" },
  { loc: "/photozine", priority: "0.5" },
  { loc: "/shop", priority: "0.5" },
]

const readMarkdownFiles = async (directory: string) => {
  const absoluteDirectory = path.join(CONTENT_ROOT, directory)
  const entries = await fs.readdir(absoluteDirectory, { withFileTypes: true })

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(absoluteDirectory, entry.name))
}

const parseFrontmatter = (raw: string): FrontmatterRecord => {
  const match = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!match) {
    return {}
  }

  const record: FrontmatterRecord = {}

  for (const line of match[1].split("\n")) {
    const separatorIndex = line.indexOf(":")
    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "")

    if (key) {
      record[key] = value
    }
  }

  return record
}

const toAbsoluteUrl = (value: string) => new URL(value, SITE_URL).toString()

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")

const normalizeDate = (value?: string) => {
  if (!value) {
    return ""
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return date.toISOString()
}

const isTruthy = (value?: string) => value === "true"

export default defineEventHandler(async (event) => {
  const [runFiles, projectFiles, blogFiles, mentionFiles] = await Promise.all([
    readMarkdownFiles("runs"),
    readMarkdownFiles("projects"),
    readMarkdownFiles("blog"),
    readMarkdownFiles("mentions"),
  ])

  const urls = [...STATIC_ROUTES]

  for (const file of runFiles) {
    const raw = await fs.readFile(file, "utf8")
    const frontmatter = parseFrontmatter(raw)
    const slug = frontmatter.slug?.trim()

    if (!slug || frontmatter.status === "draft") {
      continue
    }

    urls.push({
      loc: `/series/${slug}`,
      lastmod: normalizeDate(frontmatter.updatedAt || frontmatter.date),
      priority: "0.8",
    })
  }

  for (const file of projectFiles) {
    const raw = await fs.readFile(file, "utf8")
    const frontmatter = parseFrontmatter(raw)
    const permalink = frontmatter.permalink?.trim()

    if (!permalink || isTruthy(frontmatter.draft)) {
      continue
    }

    urls.push({
      loc: `/projets/${permalink}`,
      lastmod: normalizeDate(frontmatter.updatedAt || frontmatter.date),
      priority: "0.7",
    })
  }

  for (const file of blogFiles) {
    const raw = await fs.readFile(file, "utf8")
    const frontmatter = parseFrontmatter(raw)
    const permalink = frontmatter.permalink?.trim()

    if (!permalink || isTruthy(frontmatter.draft)) {
      continue
    }

    urls.push({
      loc: `/blog/${permalink}`,
      lastmod: normalizeDate(frontmatter.updatedAt || frontmatter.date),
      priority: "0.6",
    })
  }

  for (const file of mentionFiles) {
    const raw = await fs.readFile(file, "utf8")
    const frontmatter = parseFrontmatter(raw)
    const slug = frontmatter.slug?.trim()

    if (!slug) {
      continue
    }

    urls.push({
      loc: `/${slug}`,
      lastmod: normalizeDate(frontmatter.updatedAt || frontmatter.date),
      priority: "0.4",
    })
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map((entry) => {
        const parts = [
          `  <url>`,
          `    <loc>${escapeXml(toAbsoluteUrl(entry.loc))}</loc>`,
        ]

        if ("lastmod" in entry && entry.lastmod) {
          parts.push(`    <lastmod>${entry.lastmod}</lastmod>`)
        }

        if ("priority" in entry && entry.priority) {
          parts.push(`    <priority>${entry.priority}</priority>`)
        }

        parts.push(`  </url>`)
        return parts.join("\n")
      })
      .join("\n") +
    `\n</urlset>`

  setHeader(event, "content-type", "application/xml; charset=UTF-8")
  return body
})
