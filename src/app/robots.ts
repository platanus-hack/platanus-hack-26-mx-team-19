import type { MetadataRoute } from "next"
import { NEXT_PUBLIC_APP_URL } from "@/config/env"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = NEXT_PUBLIC_APP_URL.replace(/\/$/, "")

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
