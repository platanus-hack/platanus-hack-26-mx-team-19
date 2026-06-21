import { buildArchitectureCatalogPlainLines } from "@/lib/architecture-markdown"
import { landingContent } from "@/content/landing"
import { AGENTATLAS_AGENT_SETUP_COMMAND } from "@/lib/agentatlas-skill"
import { NEXT_PUBLIC_APP_URL } from "@/config/env"

const siteTitle = "agentatlas — swarm documentation for coding agents"
const siteDescription =
  "Canonical skill doc and patterns for multi-agent swarms — graph topologies, workers, sub-agents, tools, and test runs."

function section(title: string, lines: string[]): string {
  return [`## ${title}`, "", ...lines, ""].join("\n")
}

function bullet(title: string, description: string): string {
  return `- ${title}: ${description}`
}

/** Plain-text snapshot of the public home page for LLM consumption. */
export function buildLandingLlmText(): string {
  const c = landingContent
  const baseUrl = NEXT_PUBLIC_APP_URL.replace(/\/$/, "")

  const lines: string[] = [
    c.brand.name,
    "=".repeat(c.brand.name.length),
    "",
    `URL: ${baseUrl}/`,
    `Title: ${siteTitle}`,
    `Description: ${siteDescription}`,
    "",
    ...(c.header.nav.length > 0
      ? [section("Navigation", c.header.nav.map((item) => `- ${item.label}: ${baseUrl}${item.href}`))]
      : []),
    section("Hero", [
      `Badge: ${c.hero.badge}`,
      `Headline: ${c.hero.title}`,
      c.hero.lede,
      "",
      `Swarm skill setup: ${AGENTATLAS_AGENT_SETUP_COMMAND}`,
      `Skill doc: ${baseUrl}/skill.md`,
    ]),
    section("Architecture patterns", buildArchitectureCatalogPlainLines()),
    section("Network", [
      c.network.lede,
      "",
      `${c.network.directory.title} (${c.network.directory.status})`,
      ...c.network.directory.listings.map((listing) => {
        const badge = listing.badge ? ` · ${listing.badge}` : ""
        return `- ${listing.name} [${listing.category}] · ${listing.rating}★ · ${listing.stat} · ${listing.price}${badge}`
      }),
      "",
      ...c.network.pillars.map((pillar) => bullet(pillar.title, pillar.description)),
    ]),
    section("Operating layer", [
      c.solution.lede,
      "",
      ...c.solution.highlights.map((item) => `- ${item}`),
    ]),
    section("Lifecycle", [
      ...c.howItWorks.steps.map(
        (step) => `${step.step}. ${step.title}\n   ${step.description}`,
      ),
    ]),
    section("Shared services", [
      ...c.features.items.map((item) => bullet(item.title, item.description)),
    ]),
    section("Market design", [
      ...c.socialProof.stats.map((stat) => `- ${stat.value}: ${stat.label}`),
      "",
      `"${c.socialProof.quote.text}" — ${c.socialProof.quote.attribution}`,
    ]),
    section("FAQ", [
      ...c.faq.items.map(
        (item) => `Q: ${item.question}\nA: ${item.answer}`,
      ),
    ]),
    section("Get started", [
      c.finalCta.title,
      c.finalCta.lede,
      "",
      `- ${c.finalCta.primaryCta.label}: ${baseUrl}${c.finalCta.primaryCta.href}`,
      `- ${c.finalCta.secondaryCta.label}: ${baseUrl}${c.finalCta.secondaryCta.href}`,
    ]),
    section("Footer", [
      c.footer.tagline,
      "",
      "Links:",
      ...c.footer.links.map((link) => {
        const href = link.href.startsWith("#")
          ? `${baseUrl}/${link.href}`
          : `${baseUrl}${link.href}`
        return `- ${link.label}: ${href}`
      }),
    ]),
    "---",
    `Generated from the public home page. Last updated: ${new Date().toISOString().slice(0, 10)}.`,
  ]

  return lines.join("\n").trimEnd() + "\n"
}
