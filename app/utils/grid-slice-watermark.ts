import sharp from "sharp"

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max + 1))
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

type GridSliceWatermarkOptions = {
  text?: string
  width?: number
  height?: number
  fontFamily?: string
  fontSize?: number
  lineHeight?: number
  textOpacity?: number
  columns?: number
  minCellHeight?: number
  maxCellHeight?: number
  horizontalJitter?: number
  verticalJitter?: number
  shiftChance?: number
  minOpacity?: number
  maxOpacity?: number
}

type GridSliceCompositeOptions = {
  imageWidth: number
  imageHeight: number
  regionRatio?: number
  placeRight?: boolean
  watermarkWidth?: number
  watermarkHeightRatioRange?: [number, number]
  text?: string
  glitchOptions?: GridSliceWatermarkOptions
}

type ApplyGridSliceWatermarkOptions = {
  sourcePath: string
  outputPath: string
  regionRatio?: number
  placeRight?: boolean
  watermarkWidth?: number
  text?: string
  glitchOptions?: GridSliceWatermarkOptions
}

function buildRepeatedTextSvg({
  text = "macojaune macojaune",
  width,
  height = 512,
  fontFamily = "Anton, Arial Black, Verdana, sans-serif",
  fontSize = 16,
  lineHeight = 28,
  x = 8,
  textOpacity = 0.5,
}: {
  text?: string
  width: number
  height: number
  fontFamily?: string
  fontSize?: number
  lineHeight?: number
  x?: number
  textOpacity?: number
}) {
  const lines = []

  for (let y = fontSize; y < height + lineHeight; y += lineHeight) {
    lines.push(
      `<text x="${x}" y="${y}" fill="rgba(255,255,255,${textOpacity})" font-family="${fontFamily}" font-size="${fontSize}" letter-spacing="0.5">${text}</text>`,
    )
  }

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="transparent"/>
      ${lines.join("")}
    </svg>
  `
}

async function addOpacityToBuffer(
  inputBuffer: Buffer,
  width: number,
  height: number,
  opacity: number,
) {
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: inputBuffer, opacity }])
    .png()
    .toBuffer()
}

export async function createGridSliceWatermark({
  text = "macojaune macojaune",
  width = 256,
  height = 480,
  fontFamily = "Anton, Arial Black, Verdana, sans-serif",
  fontSize = 16,
  lineHeight = 28,
  textOpacity = 0.5,
  columns = 4,
  minCellHeight = 24,
  maxCellHeight = 52,
  horizontalJitter = 33,
  verticalJitter = 33,
  shiftChance = 0.7,
  minOpacity = 0.02,
  maxOpacity = 0.3,
}: GridSliceWatermarkOptions) {
  const baseSvg = buildRepeatedTextSvg({
    text,
    width,
    height,
    fontFamily,
    fontSize,
    lineHeight,
    textOpacity,
  })

  const baseBuffer = await sharp(Buffer.from(baseSvg)).png().toBuffer()
  const layers = []
  const columnWidth = Math.max(1, Math.floor(width / columns))

  let top = 0
  while (top < height) {
    const cellHeight = Math.min(randomInt(minCellHeight, maxCellHeight), height - top)

    for (let column = 0; column < columns; column += 1) {
      const left = column * columnWidth
      const sliceWidth =
        column === columns - 1 ? width - left : Math.min(columnWidth, width - left)

      if (sliceWidth <= 0) {
        continue
      }

      const slice = await sharp(baseBuffer)
        .extract({
          left,
          top,
          width: sliceWidth,
          height: cellHeight,
        })
        .png()
        .toBuffer()

      const opacity = randomBetween(minOpacity, maxOpacity)
      const fadedSlice = await addOpacityToBuffer(slice, sliceWidth, cellHeight, opacity)

      const shouldShift = Math.random() < shiftChance
      const dx = shouldShift ? randomInt(-horizontalJitter, horizontalJitter) : 0
      const dy = shouldShift ? randomInt(-verticalJitter, verticalJitter) : 0

      layers.push({
        input: fadedSlice,
        left: clamp(left + dx, 0, width - sliceWidth),
        top: clamp(top + dy, 0, height - cellHeight),
      })
    }

    top += cellHeight
  }

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(layers)
    .png()
    .toBuffer()
}

export async function createGridSliceWatermarkComposite({
  imageWidth,
  imageHeight,
  regionRatio = 0.8,
  placeRight,
  watermarkWidth = 136,
  watermarkHeightRatioRange = [0.35, 0.72],
  text = "macojaune",
  glitchOptions = {},
}: GridSliceCompositeOptions) {
  const innerBox = {
    width: Math.max(1, Math.round(imageWidth * regionRatio)),
    height: Math.max(1, Math.round(imageHeight * regionRatio)),
  }

  innerBox.left = Math.round((imageWidth - innerBox.width) / 2)
  innerBox.top = Math.round((imageHeight - innerBox.height) / 2)
  const resolvedWatermarkWidth = Math.max(1, Math.min(watermarkWidth, innerBox.width, imageWidth))
  const [minHeightRatio, maxHeightRatio] = watermarkHeightRatioRange
  const safeMinHeightRatio = clamp(Math.min(minHeightRatio, maxHeightRatio), 0.05, 1)
  const safeMaxHeightRatio = clamp(Math.max(minHeightRatio, maxHeightRatio), safeMinHeightRatio, 1)
  const resolvedWatermarkHeight = Math.max(
    1,
    Math.min(
      innerBox.height,
      Math.round(innerBox.height * randomBetween(safeMinHeightRatio, safeMaxHeightRatio)),
    ),
  )

  const input = await createGridSliceWatermark({
    text,
    width: resolvedWatermarkWidth,
    height: resolvedWatermarkHeight,
    ...glitchOptions,
  })

  const placementMinLeft = innerBox.left
  const placementMaxLeft =
    innerBox.left + Math.max(0, innerBox.width - resolvedWatermarkWidth)
  const placementMinTop = innerBox.top
  const placementMaxTop =
    innerBox.top + Math.max(0, innerBox.height - resolvedWatermarkHeight)
  const resolvedLeft =
    typeof placeRight === "boolean"
      ? placeRight
        ? placementMaxLeft
        : placementMinLeft
      : randomInt(placementMinLeft, placementMaxLeft)
  const resolvedTop = randomInt(placementMinTop, placementMaxTop)

  return {
    input,
    left: clamp(resolvedLeft, 0, imageWidth - resolvedWatermarkWidth),
    top: clamp(resolvedTop, 0, imageHeight - resolvedWatermarkHeight),
  }
}

export async function applyGridSliceWatermarkToImage({
  sourcePath,
  outputPath,
  regionRatio = 0.8,
  placeRight,
  watermarkWidth = 136,
  text = "macojaune",
  glitchOptions = {},
}: ApplyGridSliceWatermarkOptions) {
  const sourceMeta = await sharp(sourcePath).metadata()

  if (!sourceMeta.width || !sourceMeta.height) {
    throw new Error("Missing source dimensions.")
  }

  await sharp(sourcePath)
    .composite([
      await createGridSliceWatermarkComposite({
        imageWidth: sourceMeta.width,
        imageHeight: sourceMeta.height,
        regionRatio,
        placeRight,
        watermarkWidth,
        text,
        glitchOptions,
      }),
    ])
    .jpeg({ quality: 95 })
    .toFile(outputPath)

  return outputPath
}
