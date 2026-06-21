import type { Metadata } from "next"
import PublicAuditView from "@/components/audit/PublicAuditView"

type Props = {
  params: Promise<{ runId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { runId } = await params
  return {
    title: `Run audit · ${runId.slice(-8)}`,
    description: "Public audit trail for an agentatlas swarm run.",
    robots: { index: false, follow: false },
  }
}

export default async function AuditPage({ params }: Props) {
  const { runId } = await params
  return <PublicAuditView runId={runId} />
}
