import { createHash } from "node:crypto"
import { existsSync, promises as fs, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, "..")
const runsDir = path.join(repoRoot, "content", "runs")
const publicDir = path.join(repoRoot, "public")
const publicPicturesDir = path.join(publicDir, "pictures")
const originalsDir = path.join(repoRoot, "assets", "photo-originals")
const derivedDir = path.join(publicDir, "derived", "runs")
const generatedManifestPath = path.join(repoRoot, "generated", "run-image-manifest.ts")
const publicManifestPath = path.join(derivedDir, "manifest.json")
const inventoryReportPath = path.join(repoRoot, "docs", "run-image-inventory.md")

const shouldMigrate = process.argv.includes("--migrate")
const watermarkLabel = "Macojaune"
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

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function createVerticalLabelTspans(fontSize) {
  const lineHeight = Math.max(20, Math.round(fontSize * 0.86))

  return {
    lineHeight,
    labelMarkup: watermarkLabel
      .split("")
      .map((character, index) => {
        const glyph = character === " " ? "&#160;" : escapeXml(character)
        return `<tspan x="0" dy="${index === 0 ? 0 : lineHeight}">${glyph}</tspan>`
      })
      .join(""),
  }
}

function createWatermarkOverlay(width, height) {
  const fontSize = Math.max(20, Math.min(Math.round(width * 0.034), Math.round(height * 0.1)))
  const accentHeight = Math.max(8, Math.round(fontSize * 0.32))
  const accentWidth = Math.max(46, Math.round(fontSize * 2.2))
  const baseX = Math.round(width - fontSize * 2.15)
  const baseY = Math.max(Math.round(height * 0.12), fontSize)
  const { lineHeight, labelMarkup } = createVerticalLabelTspans(fontSize)

  const glitchBars = [
    { x: baseX - fontSize * 0.65, y: baseY + lineHeight * 1.4, fill: "rgba(245, 158, 11, 0.24)", width: accentWidth },
    { x: baseX - fontSize * 1.1, y: baseY + lineHeight * 3.85, fill: "rgba(12, 10, 9, 0.3)", width: accentWidth * 1.15 },
    { x: baseX - fontSize * 0.45, y: baseY + lineHeight * 6.1, fill: "rgba(255, 243, 214, 0.18)", width: accentWidth * 0.92 },
  ]

  return Buffer.from(
    `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <g>
        ${glitchBars
          .map(
            (bar) =>
              `<rect x="${Math.round(bar.x)}" y="${Math.round(bar.y)}" width="${Math.round(bar.width)}" height="${accentHeight}" fill="${bar.fill}" rx="${Math.round(accentHeight / 3)}" />`,
          )
          .join("")}
        <g transform="translate(${baseX}, ${baseY})">
          <text fill="rgba(255, 246, 222, 0.28)" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-weight="700" letter-spacing="${Math.max(1, Math.round(fontSize * 0.05))}">
            ${labelMarkup}
          </text>
        </g>
        <g transform="translate(${baseX + Math.max(2, Math.round(fontSize * 0.08))}, ${baseY - Math.max(2, Math.round(fontSize * 0.06))})">
          <text fill="rgba(245, 158, 11, 0.18)" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-weight="700" letter-spacing="${Math.max(1, Math.round(fontSize * 0.05))}">
            ${labelMarkup}
          </text>
        </g>
        <g transform="translate(${baseX - Math.max(2, Math.round(fontSize * 0.06))}, ${baseY + Math.max(3, Math.round(fontSize * 0.08))})">
          <text fill="rgba(255, 255, 255, 0.1)" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-weight="700" letter-spacing="${Math.max(1, Math.round(fontSize * 0.05))}">
            ${labelMarkup}
          </text>
        </g>
      </g>
    </svg>`,
  )
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

    for (const format of ["avif", "webp"]) {
      for (const width of widths) {
        const outputRelativePath = path.join(key, `${variantName}-${width}.${format}`)
        const outputPath = path.join(derivedDir, outputRelativePath)

        await fs.mkdir(path.dirname(outputPath), { recursive: true })

        const resizedImage = await sharp(sourcePath)
          .rotate()
          .resize({
            width,
            withoutEnlargement: true,
            fit: "inside",
          })
          .toBuffer({ resolveWithObject: true })

        let pipeline = sharp(resizedImage.data)

        if (preset.watermark) {
          pipeline = pipeline.composite([
            {
              input: createWatermarkOverlay(resizedImage.info.width, resizedImage.info.height),
              gravity: "center",
            },
          ])
        }

        await pipeline[format]({ quality: preset.quality[format] }).toFile(outputPath)

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
  const manifest = {}
  const inventory = []
  const hashGroups = new Map()
  let movedCount = 0
  let remoteCount = 0

  await fs.mkdir(derivedDir, { recursive: true })

  for (const src of refs) {
    if (src.startsWith(runMediaPrefix)) {
      manifest[src] = await fetchRemoteManifest(src)
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
  console.log(`Legacy local references: ${inventory.length}.`)
  console.log(`Manifest written to ${path.relative(repoRoot, generatedManifestPath)}.`)
  console.log(`Inventory report written to ${path.relative(repoRoot, inventoryReportPath)}.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
