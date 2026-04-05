import fs from "node:fs/promises"
import path from "node:path"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const require = createRequire(import.meta.url)
const jiti = require("jiti")(__filename)
const { applyGridSliceWatermarkToImage, createGridSliceWatermark } = jiti(
  path.join(path.dirname(__filename), "..", "app", "utils", "grid-slice-watermark.ts"),
)

export { applyGridSliceWatermarkToImage, createGridSliceWatermark }

if (import.meta.url === `file://${process.argv[1]}`) {
  const sourcePath = process.argv[2]
  const outputPath =
    process.argv[3] ||
    "/Users/marvinl/Documents/DEV/macojaune-web/.tmp-watermark-tests/glitch-watermark-prototype.jpg"

  if (!sourcePath) {
    console.error("Usage: node scripts/glitch-watermark-prototype.mjs <source-image> [output-image]")
    process.exit(1)
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true })

  const result = await applyGridSliceWatermarkToImage({
    sourcePath,
    outputPath,
  })

  console.log(result)
}
