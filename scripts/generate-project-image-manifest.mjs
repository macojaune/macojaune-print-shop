#!/usr/bin/env node

import { existsSync, promises as fs, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import matter from "gray-matter"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, "..")
const projectsDir = path.join(repoRoot, "content", "projects")
const generatedManifestPath = path.join(repoRoot, "generated", "project-image-manifest.ts")
const projectMediaPrefix = "/media/projects/"

loadEnvFile(path.join(repoRoot, ".env"))

const publicMediaBaseUrl = resolvePublicMediaBaseUrl()

function loadEnvFile(target) {
  if (!existsSync(target)) {
    return
  }

  const lines = readFileSync(target, "utf8").split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }

    const separatorIndex = trimmed.indexOf("=")

    if (separatorIndex === -1) {
      continue
    }

    const key = trimmed.slice(0, separatorIndex).trim()

    if (!key || process.env[key] !== undefined) {
      continue
    }

    let value = trimmed.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    } else {
      value = value.replace(/\s+#.*$/, "")
    }

    process.env[key] = value
  }
}

function resolvePublicMediaBaseUrl() {
  return (
    process.env.NUXT_PUBLIC_MEDIA_BASE_URL ||
    process.env.R2_PUBLIC_BASE_URL ||
    process.env.NUXT_PUBLIC_ASSET_BASE_URL ||
    process.env.MEDIA_BASE_URL ||
    ""
  ).replace(/\/+$/, "")
}

function collectProjectMediaRefs(markdown) {
  const parsed = matter(markdown)
  const refs = new Set()
  const frontmatterImages = [
    ...(Array.isArray(parsed.data?.images) ? parsed.data.images : []),
    typeof parsed.data?.image === "string" ? parsed.data.image : "",
  ]

  for (const entry of frontmatterImages) {
    if (typeof entry === "string" && entry.trim().startsWith(projectMediaPrefix)) {
      refs.add(entry.trim())
    }
  }

  for (const match of parsed.content.matchAll(/\/media\/projects\/[^\s"')]+/g)) {
    refs.add(match[0].trim())
  }

  return [...refs]
}

function getProjectMediaAssetId(value) {
  if (!value?.startsWith(projectMediaPrefix)) {
    return null
  }

  return value.slice(projectMediaPrefix.length).replace(/^\/+|\/+$/g, "") || null
}

async function listProjectMediaRefs() {
  const refs = new Set()
  const files = await fs.readdir(projectsDir)

  for (const file of files) {
    if (!file.endsWith(".md")) {
      continue
    }

    const markdown = await fs.readFile(path.join(projectsDir, file), "utf8")

    for (const ref of collectProjectMediaRefs(markdown)) {
      refs.add(ref)
    }
  }

  return [...refs].sort()
}

async function fetchRemoteManifest(src) {
  if (!publicMediaBaseUrl) {
    throw new Error(
      `Missing media base URL while resolving remote project image ${src}. Set NUXT_PUBLIC_MEDIA_BASE_URL, R2_PUBLIC_BASE_URL, or NUXT_PUBLIC_ASSET_BASE_URL for /media/projects/* assets.`,
    )
  }

  const assetId = getProjectMediaAssetId(src)

  if (!assetId) {
    throw new Error(`Invalid remote project image reference: ${src}`)
  }

  const response = await fetch(`${publicMediaBaseUrl}/manifests/projects/${assetId}.json`)

  if (!response.ok) {
    throw new Error(`Unable to fetch remote project image manifest for ${src}: ${response.status} ${response.statusText}`)
  }

  const manifest = await response.json()

  return {
    preview: manifest.preview,
  }
}

async function run() {
  const refs = await listProjectMediaRefs()
  const manifest = {}

  for (const ref of refs) {
    manifest[ref] = await fetchRemoteManifest(ref)
    console.log(`synced ${ref}`)
  }

  await fs.writeFile(
    generatedManifestPath,
    `export const projectImageManifest = ${JSON.stringify(manifest, null, 2)} as const\n\nexport type ProjectImageManifest = typeof projectImageManifest\n`,
    "utf8",
  )
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
