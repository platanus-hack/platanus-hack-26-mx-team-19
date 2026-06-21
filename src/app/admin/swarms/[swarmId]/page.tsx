import SwarmEditor from "@/components/admin/swarms/editor"

type Props = {
  params: Promise<{ swarmId: string }>
}

export default async function AdminSwarmWorkspacePage({ params }: Props) {
  const { swarmId } = await params
  return <SwarmEditor swarmId={swarmId} />
}
