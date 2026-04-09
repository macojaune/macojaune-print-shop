import sharp from "sharp"
import { toAssetUrl } from "../../lib/asset-url"

const WIDTH = 1200
const HEIGHT = 630

type SocialCardOptions = {
  title: string
  eyebrow?: string
  description?: string
  imageUrl?: string
}

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")

const hashString = (value: string) => {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }

  return hash
}

const wrapText = (value: string, lineLength: number, maxLines: number) => {
  const words = value.trim().split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let currentLine = ""

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word

    if (nextLine.length > lineLength && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = nextLine
    }

    if (lines.length === maxLines) {
      break
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine)
  }

  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[.,;:!?-]?\s*$/, "")}…`
  }

  return lines
}

const normalizeImageUrl = (value?: string) => {
  if (!value) {
    return ""
  }

  return toAssetUrl(value)
}

const fetchImageBuffer = async (url?: string) => {
  const normalizedUrl = normalizeImageUrl(url)
  if (!normalizedUrl) {
    return null
  }

  try {
    const response = await fetch(normalizedUrl)
    if (!response.ok) {
      return null
    }

    return Buffer.from(await response.arrayBuffer())
  } catch {
    return null
  }
}

const createFallbackBackground = async (seed: string) => {
  const hash = hashString(seed)
  const amberHue = 32 + (hash % 10)
  const accentHue = 18 + (hash % 20)
  const overlay = Buffer.from(
    `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="hsl(${amberHue} 78% 34%)"/>
          <stop offset="58%" stop-color="#18120f"/>
          <stop offset="100%" stop-color="#090909"/>
        </linearGradient>
        <radialGradient id="glow" cx="70%" cy="18%" r="65%">
          <stop offset="0%" stop-color="rgba(251,191,36,0.28)"/>
          <stop offset="100%" stop-color="rgba(251,191,36,0)"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <rect width="100%" height="100%" fill="url(#glow)"/>
      <rect x="36" y="36" width="${WIDTH - 72}" height="${HEIGHT - 72}" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2"/>
      <circle cx="${WIDTH - 120}" cy="120" r="64" fill="hsla(${accentHue} 84% 44% / 0.22)"/>
    </svg>`,
  )

  return sharp(overlay).png().toBuffer()
}

const createBackground = async (seed: string, imageUrl?: string) => {
  const imageBuffer = await fetchImageBuffer(imageUrl)

  if (!imageBuffer) {
    return createFallbackBackground(seed)
  }

  return sharp(imageBuffer)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.8, saturation: 1.02 })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="rgba(12,10,9,0.15)"/>
                <stop offset="55%" stop-color="rgba(12,10,9,0.38)"/>
                <stop offset="100%" stop-color="rgba(12,10,9,0.92)"/>
              </linearGradient>
              <radialGradient id="glow" cx="74%" cy="18%" r="62%">
                <stop offset="0%" stop-color="rgba(251,191,36,0.20)"/>
                <stop offset="100%" stop-color="rgba(251,191,36,0)"/>
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#shade)"/>
            <rect width="100%" height="100%" fill="url(#glow)"/>
          </svg>`,
        ),
      },
    ])
    .png()
    .toBuffer()
}

export async function createSocialCard(options: SocialCardOptions) {
  const titleLines = wrapText(options.title, 18, 3)
  const descriptionLines = options.description ? wrapText(options.description, 42, 3) : []
  const background = await createBackground(options.title, options.imageUrl)

  const titleSvg = titleLines
    .map(
      (line, index) =>
        `<text x="84" y="${350 + index * 98}" fill="#ffffff" font-size="84" font-weight="800" font-family="Arial, Helvetica, sans-serif">${escapeXml(line)}</text>`,
    )
    .join("")

  const descriptionSvg = descriptionLines
    .map(
      (line, index) =>
        `<text x="88" y="${520 + index * 34}" fill="rgba(245,245,244,0.9)" font-size="28" font-weight="500" font-family="Arial, Helvetica, sans-serif">${escapeXml(line)}</text>`,
    )
    .join("")

  const overlay = Buffer.from(
    `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect x="44" y="44" width="${WIDTH - 88}" height="${HEIGHT - 88}" fill="none" stroke="rgba(255,255,255,0.20)" stroke-width="2"/>
      <rect x="84" y="86" width="196" height="50" fill="rgba(0,0,0,0.48)" stroke="rgba(255,255,255,0.22)" stroke-width="2"/>
      <text x="112" y="120" fill="#fde68a" font-size="24" letter-spacing="5" font-weight="700" font-family="Arial, Helvetica, sans-serif">${escapeXml((options.eyebrow || "MACOJAUNE").toUpperCase())}</text>
      ${titleSvg}
      ${descriptionSvg}
      <text x="${WIDTH - 270}" y="${HEIGHT - 84}" fill="rgba(251,191,36,0.86)" font-size="24" letter-spacing="3" font-weight="700" font-family="Arial, Helvetica, sans-serif">MACOJAUNE.COM</text>
    </svg>`,
  )

  return sharp(background)
    .composite([{ input: overlay }])
    .png()
    .toBuffer()
}

export const pickStableItem = <T,>(items: T[], seed: string) => {
  if (!items.length) {
    return undefined
  }

  return items[hashString(seed) % items.length]
}
