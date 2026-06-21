import type { Metadata } from "next"
import PrivacyDocument from "@/components/legal/PrivacyDocument"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How agentatlas collects, uses, and protects information.",
}

export default function PrivacyPage() {
  return <PrivacyDocument />
}
