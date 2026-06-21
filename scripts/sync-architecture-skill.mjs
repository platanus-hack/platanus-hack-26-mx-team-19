/**
 * Sync architecture catalogue from src/content/architectures.ts into skill markdown files.
 * Run: yarn sync:architectures
 */
import { execSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")

const MARKER_START = "<!-- architecture-catalog:start -->"
const MARKER_END = "<!-- architecture-catalog:end -->"

const SKILL_FILES = [
  "public/skill.md",
  "public/skills/agentatlas-swarms/SKILL.md",
  ".cursor/skills/agentatlas-swarms/SKILL.md",
]

function generateMarkdown() {
  return execSync(
    `npx tsx -e "import { buildArchitectureCatalogMarkdown } from './src/lib/architecture-markdown.ts'; process.stdout.write(buildArchitectureCatalogMarkdown())"`,
    { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
  )
}

function syncFile(relPath, markdown) {
  const path = join(root, relPath)
  const content = readFileSync(path, "utf8")
  const start = content.indexOf(MARKER_START)
  const end = content.indexOf(MARKER_END)

  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Missing sync markers in ${relPath}`)
  }

  const before = content.slice(0, start + MARKER_START.length)
  const after = content.slice(end)
  writeFileSync(path, `${before}\n\n${markdown}\n\n${after}`, "utf8")
  console.log(`Updated ${relPath}`)
}

const markdown = generateMarkdown()

for (const file of SKILL_FILES) {
  syncFile(file, markdown)
}

console.log("Architecture catalogue synced.")
