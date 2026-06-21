import type { MetadataRoute } from "next"
import { NEXT_PUBLIC_APP_URL } from "@/config/env"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
  const lastModified = new Date()

  return [
    { url: `${baseUrl}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/llm.txt`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/skill.md`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/sign-in`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/sign-up`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ]
}
