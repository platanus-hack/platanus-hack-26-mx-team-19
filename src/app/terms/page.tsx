import type { Metadata } from "next"
import TermsDocument from "@/components/legal/TermsDocument"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing your use of the agentatlas platform.",
}

export default function TermsPage() {
  return <TermsDocument />
}
