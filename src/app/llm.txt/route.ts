import { buildLandingLlmText } from "@/lib/landing-llm-text"

export const dynamic = "force-static"

export function GET() {
  return new Response(buildLandingLlmText(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  })
}
