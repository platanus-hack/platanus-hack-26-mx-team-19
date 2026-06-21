import { buildArchitectureCatalogPlainText } from "@/lib/architecture-markdown"
import { architectureCatalogSection } from "@/content/architectures"
import en from "@/messages/en.json"
import { AGENTATLAS_AGENT_SETUP_COMMAND, AGENTATLAS_SWARM_SKILL_PUBLIC_URL } from "@/lib/agentatlas-skill"
import { NEXT_PUBLIC_APP_URL } from "@/config/env"

const siteTitle = "agentatlas — swarm documentation for coding agents"
const siteDescription =
  "Canonical skill doc and patterns for multi-agent swarms — graph topologies, workers, sub-agents, tools, and test runs."

function section(title: string, body: string): string {
  return [`## ${title}`, "", body.trimEnd(), ""].join("\n")
}

/** Plain-text snapshot of the public home page for LLM consumption (`GET /llm.txt`). */
export function buildLandingLlmText(): string {
  const baseUrl = NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
  const hero = en.landing.hero
  const footer = en.landing.footer
  const archUi = en.landing.architectures
  const year = new Date().getFullYear()
  const copyright = footer.copyright.replace("{year}", String(year))

  const lines: string[] = [
    "agentatlas",
    "==========",
    "",
    `> ${siteDescription}`,
    "",
    `URL: ${baseUrl}/`,
    `Title: ${siteTitle}`,
    `Languages: en (default), es (set cookie NEXT_LOCALE=es or use /es/... legacy prefix)`,
    "",
    section("For coding agents", [
      "Primary onboarding for autonomous agents:",
      "",
      `- Setup command: ${AGENTATLAS_AGENT_SETUP_COMMAND}`,
      `- Swarm skill doc: ${AGENTATLAS_SWARM_SKILL_PUBLIC_URL}`,
      `- This LLM snapshot: ${baseUrl}/llm.txt`,
      "",
      "Use the skill doc for graph editor contracts, control nodes, tools, and test runs.",
      "Use this file for a plain-text summary of the public landing and architecture catalogue.",
    ].join("\n")),
    section("Hero", [
      `Badge: ${hero.badge}`,
      `Headline: ${hero.title}`,
      hero.lede,
      "",
      hero.skill.hint,
      hero.skill.footerHint,
    ].join("\n")),
    section(archUi.eyebrow, [
      architectureCatalogSection.intro,
      "",
      buildArchitectureCatalogPlainText(),
    ].join("\n")),
    section("Footer", [
      footer.tagline,
      "",
      "Links:",
      `- ${footer.privacy}: ${baseUrl}/privacy`,
      `- ${footer.terms}: ${baseUrl}/terms`,
      `- Sign in: ${baseUrl}/sign-in`,
      `- Sign up: ${baseUrl}/sign-up`,
      `- Dashboard (authenticated): ${baseUrl}/dashboard`,
      "",
      copyright,
    ].join("\n")),
    "---",
    `Generated from the public landing page. Last updated: ${new Date().toISOString().slice(0, 10)}.`,
  ]

  return lines.join("\n").trimEnd() + "\n"
}
