import { createHash } from "node:crypto"
import { existsSync, promises as fs, readFileSync } from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"

import sharp from "sharp"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, "..")
const require = createRequire(import.meta.url)
const jiti = require("jiti")(__filename)
const { createGridSliceWatermarkComposite } = jiti(
  path.join(repoRoot, "app", "utils", "grid-slice-watermark.ts"),
)
const runsDir = path.join(repoRoot, "content", "runs")
const publicDir = path.join(repoRoot, "public")
const publicPicturesDir = path.join(publicDir, "pictures")
const originalsDir = path.join(repoRoot, "assets", "photo-originals")
const derivedDir = path.join(publicDir, "derived", "runs")
const generatedManifestPath = path.join(repoRoot, "generated", "run-image-manifest.ts")
const publicManifestPath = path.join(derivedDir, "manifest.json")
const inventoryReportPath = path.join(repoRoot, "docs", "run-image-inventory.md")

const shouldMigrate = process.argv.includes("--migrate")
const runMediaPrefix = "/media/runs/"

loadEnvFile(path.join(repoRoot, ".env"))

const publicMediaBaseUrl = resolvePublicMediaBaseUrl()

const variantPresets = {
  thumb: { widths: [320, 640], watermark: true, quality: { avif: 46, webp: 62 } },
  card: { widths: [480, 768, 1080], watermark: true, quality: { avif: 48, webp: 64 } },
  detail: { widths: [768, 1280, 1680], watermark: true, quality: { avif: 50, webp: 68 } },
  social: { widths: [1200], watermark: true, quality: { avif: 52, webp: 72 } },
}

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

async function pathExists(target) {
  try {
    await fs.access(target)
    return true
  } catch {
    return false
  }
}

async function loadExistingManifest() {
  if (!(await pathExists(publicManifestPath))) {
    return {}
  }

  try {
    const raw = await fs.readFile(publicManifestPath, "utf8")
    const parsed = JSON.parse(raw)
    return parsed?.images && typeof parsed.images === "object" ? parsed.images : {}
  } catch {
    return {}
  }
}

function collectRunImageRefs(markdown) {
  return [
    ...markdown.matchAll(/\/pictures\/[^\s"')]+/g),
    ...markdown.matchAll(/\/media\/runs\/[^\s"')]+/g),
  ].map((match) => match[0])
}

async function listRunImageRefs() {
  const refs = new Set()
  const files = await fs.readdir(runsDir)

  for (const file of files) {
    if (!file.endsWith(".md")) {
      continue
    }

    const absolutePath = path.join(runsDir, file)
    const markdown = await fs.readFile(absolutePath, "utf8")

    for (const ref of collectRunImageRefs(markdown)) {
      refs.add(ref)
    }
  }

  return [...refs].sort()
}

function stripPicturesPrefix(src) {
  return src.replace(/^\/pictures\//, "")
}

function stripFileExtension(filePath) {
  return filePath.replace(/\.[^.]+$/, "")
}

function publicUrlFromSegments(...segments) {
  return `/${segments.map((segment) => segment.split(path.sep).join("/")).join("/")}`
}

function getTargetWidths(sourceWidth, widths) {
  const candidates = widths.filter((width) => width < sourceWidth)

  if (candidates.length === 0 || candidates[candidates.length - 1] !== sourceWidth) {
    candidates.push(sourceWidth)
  }

  return [...new Set(candidates)]
}

async function resolveSourcePath(src) {
  const relativePath = src.replace(/^\//, "")
  const privatePath = path.join(originalsDir, relativePath)
  const legacyPublicPath = path.join(publicDir, relativePath)

  if (shouldMigrate && (await pathExists(legacyPublicPath)) && !(await pathExists(privatePath))) {
    await fs.mkdir(path.dirname(privatePath), { recursive: true })
    await fs.rename(legacyPublicPath, privatePath)
  }

  if (await pathExists(privatePath)) {
    return privatePath
  }

  if (await pathExists(legacyPublicPath)) {
    return legacyPublicPath
  }

  return null
}

async function getFileHash(target) {
  const content = await fs.readFile(target)
  return createHash("sha1").update(content).digest("hex")
}

function getRunMediaAssetId(src) {
  return src.startsWith(runMediaPrefix) ? src.slice(runMediaPrefix.length).replace(/^\/+|\/+$/g, "") : null
}

async function fetchRemoteManifest(src) {
  if (!publicMediaBaseUrl) {
    throw new Error(
      `Missing media base URL while resolving remote run image ${src}. Set NUXT_PUBLIC_MEDIA_BASE_URL, R2_PUBLIC_BASE_URL, or NUXT_PUBLIC_ASSET_BASE_URL for /media/runs/* assets.`,
    )
  }

  const assetId = getRunMediaAssetId(src)

  if (!assetId) {
    throw new Error(`Invalid remote run image reference: ${src}`)
  }

  const response = await fetch(`${publicMediaBaseUrl}/manifests/runs/${assetId}.json`)

  if (!response.ok) {
    throw new Error(`Unable to fetch remote run image manifest for ${src}: ${response.status} ${response.statusText}`)
  }

  const manifest = await response.json()

  return {
    thumb: manifest.thumb,
    card: manifest.card,
    detail: manifest.detail,
    social: manifest.social,
  }
}

async function writeInventoryReport(items, duplicateGroups, movedCount, remoteCount) {
  const oversized = items
    .filter((item) => item.originalBytes >= 1_500_000)
    .sort((left, right) => right.originalBytes - left.originalBytes)

  const duplicateSection =
    duplicateGroups.length > 0
      ? duplicateGroups
          .map(
            (group) =>
              `- ${group.map((item) => `\`${item.src}\``).join(", ")} (${(group[0].originalBytes / 1_000_000).toFixed(2)} MB each)`,
          )
          .join("\n")
      : "- No byte-identical duplicates detected in the current legacy run-image set."

  const body = `# Run Image Inventory

Generated on ${new Date().toISOString()} by \`node scripts/generate-run-image-derivatives.mjs${shouldMigrate ? " --migrate" : ""}\`.

## Summary

- Total referenced run images: ${items.length + remoteCount}
- Remote R2-backed references: ${remoteCount}
- Legacy local references: ${items.length}
- Originals migrated to \`assets/photo-originals\`: ${movedCount}
- Oversized legacy originals (> 1.5 MB): ${oversized.length}
- Duplicate legacy binaries detected: ${duplicateGroups.length}

## Largest Legacy Originals

${oversized
  .slice(0, 10)
  .map(
    (item) =>
      `- \`${item.src}\` - ${(item.originalBytes / 1_000_000).toFixed(2)} MB - ${item.width}x${item.height}`,
  )
  .join("\n") || "- None"}

## Duplicate Legacy Files

${duplicateSection}

## Delivery Policy

- Legacy source masters live under \`assets/photo-originals/pictures/\`.
- Legacy public delivery uses generated derivatives under \`public/derived/runs/\`.
- R2-backed assets use canonical \`/media/runs/<asset-id>\` references in content and public manifests under \`${publicMediaBaseUrl || "<NUXT_PUBLIC_MEDIA_BASE_URL>"}/manifests/runs/\`.
- Series and product pages should consume the generated manifest helpers from \`utils/runs.ts\`, not raw \`/pictures/\` URLs.
`

  await fs.mkdir(path.dirname(inventoryReportPath), { recursive: true })
  await fs.writeFile(inventoryReportPath, body)
}

async function processLegacyRef(src, manifest, inventory, hashGroups) {
  const sourcePath = await resolveSourcePath(src)

  if (!sourcePath) {
    throw new Error(`Missing source image for ${src}`)
  }

  const metadata = await sharp(sourcePath).rotate().metadata()

  if (!metadata.width || !metadata.height) {
    throw new Error(`Unable to read dimensions for ${src}`)
  }

  const sourceHash = await getFileHash(sourcePath)
  const sourceStat = await fs.stat(sourcePath)
  const key = stripFileExtension(stripPicturesPrefix(src))
  const sourceEntry = {}

  inventory.push({
    src,
    sourcePath,
    originalBytes: sourceStat.size,
    width: metadata.width,
    height: metadata.height,
  })

  const currentHashGroup = hashGroups.get(sourceHash) || []
  currentHashGroup.push({
    src,
    originalBytes: sourceStat.size,
  })
  hashGroups.set(sourceHash, currentHashGroup)

  for (const [variantName, preset] of Object.entries(variantPresets)) {
    const widths = getTargetWidths(metadata.width, preset.widths)
    const variantEntry = {
      avif: [],
      webp: [],
    }

    for (const width of widths) {
      const resizedImage = await sharp(sourcePath)
        .rotate()
        .resize({
          width,
          withoutEnlargement: true,
          fit: "inside",
        })
        .toBuffer({ resolveWithObject: true })

      let transformedSource = resizedImage.data

      if (preset.watermark) {
        transformedSource = await sharp(resizedImage.data)
          .composite([
            await createGridSliceWatermarkComposite({
              imageWidth: resizedImage.info.width,
              imageHeight: resizedImage.info.height,
            }),
          ])
          .png()
          .toBuffer()
      }

      for (const format of ["avif", "webp"]) {
        const outputRelativePath = path.join(key, `${variantName}-${width}.${format}`)
        const outputPath = path.join(derivedDir, outputRelativePath)

        await fs.mkdir(path.dirname(outputPath), { recursive: true })

        await sharp(transformedSource)[format]({ quality: preset.quality[format] }).toFile(outputPath)

        variantEntry[format].push({
          src: publicUrlFromSegments("derived", "runs", outputRelativePath),
          width: resizedImage.info.width,
          height: resizedImage.info.height,
        })
      }
    }

    sourceEntry[variantName] = variantEntry
  }

  manifest[src] = sourceEntry
}

async function main() {
  const refs = await listRunImageRefs()
  const existingManifest = await loadExistingManifest()
  const manifest = {}
  const inventory = []
  const hashGroups = new Map()
  let movedCount = 0
  let remoteCount = 0
  let reusedRemoteCount = 0

  await fs.mkdir(derivedDir, { recursive: true })

  for (const src of refs) {
    if (src.startsWith(runMediaPrefix)) {
      if (existingManifest[src]) {
        manifest[src] = existingManifest[src]
        reusedRemoteCount += 1
      } else {
        manifest[src] = await fetchRemoteManifest(src)
      }
      remoteCount += 1
      continue
    }

    const beforePublicPath = path.join(publicPicturesDir, stripPicturesPrefix(src))
    if (shouldMigrate && (await pathExists(beforePublicPath))) {
      movedCount += 1
    }

    await processLegacyRef(src, manifest, inventory, hashGroups)
  }

  const duplicateGroups = [...hashGroups.values()].filter((group) => group.length > 1)

  await fs.writeFile(
    publicManifestPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        images: manifest,
      },
      null,
      2,
    ),
  )

  await fs.mkdir(path.dirname(generatedManifestPath), { recursive: true })
  await fs.writeFile(
    generatedManifestPath,
    `export const runImageManifest = ${JSON.stringify(manifest, null, 2)} as const\n\nexport type RunImageManifest = typeof runImageManifest\n`,
  )

  await writeInventoryReport(inventory, duplicateGroups, movedCount, remoteCount)

  console.log(`Resolved ${refs.length} run image references.`)
  console.log(`Remote R2-backed references: ${remoteCount}.`)
  console.log(`Remote R2-backed entries reused from cache: ${reusedRemoteCount}.`)
  console.log(`Legacy local references: ${inventory.length}.`)
  console.log(`Manifest written to ${path.relative(repoRoot, generatedManifestPath)}.`)
  console.log(`Inventory report written to ${path.relative(repoRoot, inventoryReportPath)}.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
