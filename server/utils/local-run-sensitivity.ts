import { promises as fs } from "node:fs"
import path from "node:path"

import { createError } from "h3"
import { parseDocument } from "yaml"

const runsContentDir = path.join(process.cwd(), "content", "runs")
const frontmatterPattern = /^---\n([\s\S]*?)\n---\n?/

const normalizeStorageImageSource = (value: string) => {
  let normalizedValue = value.trim()
  if (!normalizedValue) {
    return ""
  }

  for (let index = 0; index < 2; index += 1) {
    try {
      const decodedValue = decodeURIComponent(normalizedValue)
      if (decodedValue === normalizedValue) {
        break
      }

      normalizedValue = decodedValue
    } catch {
      break
    }
  }

  if (/^https?:\/\//i.test(normalizedValue)) {
    try {
      const parsedUrl = new URL(normalizedValue)
      normalizedValue = parsedUrl.pathname || normalizedValue
    } catch {
      // Keep the original value if URL parsing fails.
    }
  }

  return normalizedValue
}

const validateRunSlug = (value: string) => {
  const slug = value.trim()

  if (!slug || !/^[a-z0-9][a-z0-9._-]*$/i.test(slug)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid run slug.",
    })
  }

  return slug
}

const readRunFrontmatter = async (absolutePath: string) => {
  const fileContent = await fs.readFile(absolutePath, "utf8")
  const frontmatterMatch = fileContent.match(frontmatterPattern)

  if (!frontmatterMatch) {
    throw createError({
      statusCode: 422,
      statusMessage: "Run file has no frontmatter.",
    })
  }

  const frontmatter = frontmatterMatch[1] || ""
  const body = fileContent.slice(frontmatterMatch[0].length)

  return { body, fileContent, frontmatter }
}

const resolveRunFilePath = async (slug: string) => {
  const directFilePath = path.join(runsContentDir, `${slug}.md`)

  try {
    await fs.access(directFilePath)
    return directFilePath
  } catch {
    // Fallback to frontmatter slug lookup when filename and slug differ.
  }

  const entries = await fs.readdir(runsContentDir, { withFileTypes: true })
  const markdownFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(runsContentDir, entry.name))

  for (const filePath of markdownFiles) {
    const { frontmatter } = await readRunFrontmatter(filePath)
    const document = parseDocument(frontmatter)
    const data = document.toJS() as Record<string, unknown>
    const fileSlug = String(data.slug || "").trim()

    if (fileSlug === slug) {
      return filePath
    }
  }

  throw createError({
    statusCode: 404,
    statusMessage: "Run not found.",
  })
}

type UpdateRunSensitivityInput = {
  sensitive: boolean
  slug: string
  src: string
}

export async function updateRunSensitiveImage(input: UpdateRunSensitivityInput) {
  const slug = validateRunSlug(input.slug)
  const src = normalizeStorageImageSource(input.src)

  if (!src) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid image source.",
    })
  }

  const runFilePath = await resolveRunFilePath(slug)
  const { body, fileContent, frontmatter } = await readRunFrontmatter(runFilePath)
  const document = parseDocument(frontmatter)
  const data = document.toJS() as Record<string, unknown>

  const currentSensitiveImages = data.sensitiveImages
  const sensitiveImages = Array.isArray(currentSensitiveImages)
    ? currentSensitiveImages
        .map((entry) => normalizeStorageImageSource(String(entry || "")))
        .filter(Boolean)
    : []

  const nextSensitiveImages = input.sensitive
    ? Array.from(new Set([...sensitiveImages, src]))
    : sensitiveImages.filter((entry) => entry !== src)

  if (nextSensitiveImages.length > 0) {
    document.set("sensitiveImages", nextSensitiveImages)
  } else {
    document.delete("sensitiveImages")
  }

  const updatedFrontmatter = document.toString().trimEnd()
  const updatedFileContent = `---\n${updatedFrontmatter}\n---\n${body}`

  if (updatedFileContent !== fileContent) {
    await fs.writeFile(runFilePath, updatedFileContent, "utf8")
  }

  return {
    sensitiveImages: nextSensitiveImages,
    slug,
    src,
  }
}
