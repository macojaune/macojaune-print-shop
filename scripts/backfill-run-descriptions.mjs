import { promises as fs } from "node:fs"
import path from "node:path"

const runsDirectory = path.resolve(process.cwd(), "content/runs")
const shouldWrite = process.argv.includes("--write")

const titleSpecificDescription = (title) => {
  const normalizedTitle = title.trim()
  const lowerTitle = normalizedTitle.toLowerCase()

  if (lowerTitle.includes("carnaval")) {
    return `Série photo ${normalizedTitle} en Guadeloupe, entre costumes, énergie de rue et éclats de foule.`
  }

  if (
    lowerTitle.includes("concert")
    || lowerTitle.includes("vernissage")
    || lowerTitle.includes("salon")
    || lowerTitle.includes("défilé")
    || lowerTitle.includes("backstage")
  ) {
    return `Reportage photo ${normalizedTitle}, entre scène, coulisses et intensité du moment.`
  }

  if (
    lowerTitle.includes("family")
    || lowerTitle.includes("famille")
    || lowerTitle.includes("mom")
    || lowerTitle.includes("birthday")
  ) {
    return `Séance photo ${normalizedTitle}, entre liens, présence et instants partagés.`
  }

  if (
    lowerTitle.includes("jardin")
    || lowerTitle.includes("mangrove")
    || lowerTitle.includes("martinique")
    || lowerTitle.includes("home")
    || lowerTitle.includes("maison")
    || lowerTitle.includes("bathroom")
    || lowerTitle.includes("spot")
    || lowerTitle.includes("trois rivières")
    || lowerTitle.includes("bananeraie")
  ) {
    return `Série photo ${normalizedTitle}, entre lieu, lumière et présence.`
  }

  if (normalizedTitle.includes(" x ") || normalizedTitle.includes(" X ")) {
    return `Série photo ${normalizedTitle}, entre collaboration, présence et détails du moment.`
  }

  if (normalizedTitle.includes(":")) {
    return `Série photo ${normalizedTitle}, entre présence, atmosphère et détails du moment.`
  }

  return `Série photo ${normalizedTitle} par Macojaune, entre portraits, matières et fragments du réel.`
}

const insertDescription = (raw, description) => {
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatterMatch) {
    return raw
  }

  const frontmatter = frontmatterMatch[1]
  if (/^description:/m.test(frontmatter)) {
    return raw
  }

  const titleMatch = frontmatter.match(/^title:\s*(.+)$/m)
  if (!titleMatch) {
    return raw
  }

  const titleLine = titleMatch[0]
  const quotedDescription = `description: "${description.replace(/"/g, '\\"')}"`
  const nextFrontmatter = frontmatter.replace(titleLine, `${titleLine}\n${quotedDescription}`)

  return raw.replace(frontmatterMatch[0], `---\n${nextFrontmatter}\n---`)
}

const replaceAutoDescription = (raw, nextDescription) => {
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatterMatch) {
    return raw
  }

  const frontmatter = frontmatterMatch[1]
  const titleMatch = frontmatter.match(/^title:\s*(.+)$/m)
  const descriptionMatch = frontmatter.match(/^description:\s*["']?(.*?)["']?$/m)

  if (!titleMatch || !descriptionMatch) {
    return raw
  }

  const title = titleMatch[1].trim().replace(/^["']|["']$/g, "")
  const currentDescription = descriptionMatch[1]
  const previousAutoDescription = title.includes(" x ") || title.includes(" X ")
    ? `Série photo ${title}, entre collaboration, présence et détails du moment.`
    : `Série photo ${title}, entre collaboration, présence et détails du moment.`

  if (currentDescription !== previousAutoDescription) {
    return raw
  }

  const quotedDescription = `description: "${nextDescription.replace(/"/g, '\\"')}"`
  const nextFrontmatter = frontmatter.replace(descriptionMatch[0], quotedDescription)
  return raw.replace(frontmatterMatch[0], `---\n${nextFrontmatter}\n---`)
}

const files = (await fs.readdir(runsDirectory)).filter((file) => file.endsWith(".md"))
const updatedFiles = []

for (const file of files) {
  const absoluteFile = path.join(runsDirectory, file)
  const raw = await fs.readFile(absoluteFile, "utf8")
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---/)
  const frontmatter = frontmatterMatch?.[1] || ""

  if (/^description:/m.test(frontmatter)) {
    continue
  }

  const titleMatch = frontmatter.match(/^title:\s*(.+)$/m)
  if (!titleMatch) {
    continue
  }

  const title = titleMatch[1].trim().replace(/^["']|["']$/g, "")
  const description = titleSpecificDescription(title)
  const nextRaw = insertDescription(raw, description)

  if (nextRaw !== raw) {
    updatedFiles.push({ file, description })
    if (shouldWrite) {
      await fs.writeFile(absoluteFile, nextRaw)
    }
    continue
  }

  const rewrittenRaw = replaceAutoDescription(raw, description)

  if (rewrittenRaw !== raw) {
    updatedFiles.push({ file, description })
    if (shouldWrite) {
      await fs.writeFile(absoluteFile, rewrittenRaw)
    }
  }
}

if (!shouldWrite) {
  for (const entry of updatedFiles.slice(0, 20)) {
    console.log(`${entry.file}: ${entry.description}`)
  }
  console.log(`Preview count: ${updatedFiles.length}`)
} else {
  console.log(`Updated ${updatedFiles.length} run descriptions.`)
}
