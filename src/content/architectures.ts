/**
 * Homologated architecture catalogue — single source for landing cards and skill docs.
 */

export type ArchitectureTopology = "supervisor" | "pipeline" | "fanout"

export type ArchitectureLayer = "topology" | "cooperation" | "verification"

/** 1 = low, 5 = high */
export type ArchitectureScale = 1 | 2 | 3 | 4 | 5

export type ArchitectureGraphNode = {
  id: string
  role: string
  kind?: "worker" | "control"
}

export type ArchitectureGraphEdge = {
  from: string
  to: string
  label?: string
}

export type ArchitectureGraph = {
  nodes: ArchitectureGraphNode[]
  edges: ArchitectureGraphEdge[]
}

export type ArchitectureReference = {
  title: string
  url?: string
}

export type ArchitectureEntry = {
  id: string
  name: string
  layer: ArchitectureLayer
  category: string
  summary: string
  description: string
  problem: string
  when_to_use: string[]
  when_not_to_use: string[]
  forces: string[]
  verification: ArchitectureScale
  traceability: ArchitectureScale
  latency: ArchitectureScale
  cost: ArchitectureScale
  agent_count: { min: number; max: number; sweet_spot: string }
  topology: ArchitectureTopology
  graph: ArchitectureGraph
  framework_notes?: Record<string, string>
  evidence?: string
  references?: ArchitectureReference[]
  badge?: string
  /** Shown on the landing architecture grid */
  featured?: boolean
}

/** Card-facing subset derived from {@link ArchitectureEntry}. */
export type ArchitectureCardModel = Pick<
  ArchitectureEntry,
  "id" | "name" | "category" | "summary" | "topology" | "badge"
>

export const architectureCatalogSection = {
  id: "architectures",
  eyebrow: "Architecture patterns",
  intro:
    "Map intent to graph shape before picking LangGraph, AutoGen, CrewAI, or a custom runtime. Start with topology — then add cooperation and verification patterns inside workers.",
  sweetSpot: "Sweet spot: **3–7 workers**. Avoid filler agents (format-only steps → use functions, not workers).",
} as const

export const architectureCatalog: ArchitectureEntry[] = [
  {
    id: "supervisor-router",
    name: "Supervisor / Router",
    layer: "topology",
    category: "Orchestration",
    summary: "One coordinator routes work to specialists and merges results.",
    description:
      "A hub worker classifies or decomposes incoming work, delegates to specialist workers, and synthesizes their outputs. Edges fan out from the supervisor and converge on a merge or final responder.",
    problem:
      "Monolithic prompts hide routing logic and make it hard to swap specialists without rewriting the whole system.",
    when_to_use: [
      "Tasks decompose into distinct specialist roles (research, code, review).",
      "You need a single owner for routing, retries, and final packaging.",
      "Specialists can run with different models or tool sets.",
    ],
    when_not_to_use: [
      "Every step must run in strict order with no branching.",
      "Routing is trivial enough for one worker with tools.",
      "Latency-sensitive paths where parallel fan-out is mandatory from the start.",
    ],
    forces: [
      "Clear ownership at the hub",
      "Low coupling between specialists",
      "Easy to add or replace a specialist node",
    ],
    verification: 3,
    traceability: 4,
    latency: 3,
    cost: 3,
    agent_count: { min: 3, max: 8, sweet_spot: "1 supervisor + 2–4 specialists" },
    topology: "supervisor",
    graph: {
      nodes: [
        { id: "supervisor", role: "Router / coordinator", kind: "worker" },
        { id: "specialist_a", role: "Specialist A", kind: "worker" },
        { id: "specialist_b", role: "Specialist B", kind: "worker" },
        { id: "merge", role: "Merge / respond", kind: "worker" },
      ],
      edges: [
        { from: "supervisor", to: "specialist_a" },
        { from: "supervisor", to: "specialist_b" },
        { from: "specialist_a", to: "merge" },
        { from: "specialist_b", to: "merge" },
      ],
    },
    framework_notes: {
      LangGraph: "Supervisor node with conditional edges to worker subgraphs; merge via reduce or final LLM node.",
      AutoGen: "Group chat with a manager agent delegating to nested chats or registered agents.",
      "LangChain τ-bench": "Maps to the supervisor / swarm routing benchmark topology.",
    },
    evidence: "Common default in LangGraph tutorials and τ-bench swarm comparisons.",
    references: [
      { title: "LangGraph multi-agent supervisor", url: "https://langchain-ai.github.io/langgraph/" },
      { title: "τ-bench agent architectures", url: "https://arxiv.org/abs/2406.08625" },
    ],
    badge: "Popular",
    featured: true,
  },
  {
    id: "pipeline-critic",
    name: "Pipeline + Critic",
    layer: "topology",
    category: "Quality",
    summary: "Plan, execute, then verify — each stage owns a narrow job.",
    description:
      "Workers run in series: plan or spec, execute the main task, then a critic or verifier gates output before release. Control flow is mostly linear with an optional loop back on failure.",
    problem:
      "Single-pass generation skips explicit quality gates and makes regressions hard to catch before users see output.",
    when_to_use: [
      "High traceability — each stage has a named artifact.",
      "Outputs must pass checks (policy, tests, rubric) before shipping.",
      "Errors should loop back to an earlier stage with structured feedback.",
    ],
    when_not_to_use: [
      "Subtasks are fully independent and can run in parallel.",
      "Verification is cheap enough to embed in one worker prompt.",
      "End-to-end latency dominates and serial stages are too slow.",
    ],
    forces: [
      "Strong stage boundaries and audit trail",
      "Explicit verify / retry loop",
      "Higher latency than parallel fan-out",
    ],
    verification: 5,
    traceability: 5,
    latency: 2,
    cost: 4,
    agent_count: { min: 3, max: 6, sweet_spot: "planner + executor + critic" },
    topology: "pipeline",
    graph: {
      nodes: [
        { id: "plan", role: "Plan / spec", kind: "worker" },
        { id: "execute", role: "Execute", kind: "worker" },
        { id: "critic", role: "Critic / verify", kind: "worker" },
        { id: "output", role: "Publish", kind: "worker" },
      ],
      edges: [
        { from: "plan", to: "execute" },
        { from: "execute", to: "critic" },
        { from: "critic", to: "output", label: "pass" },
        { from: "critic", to: "execute", label: "revise" },
      ],
    },
    framework_notes: {
      LangGraph: "Linear StateGraph with conditional edge from critic back to execute.",
      AutoGen: "Sequential chat or nested critic agent after primary completion.",
      CrewAI: "Task chain with explicit review task and output guardrails.",
    },
    evidence: "Aligns with plan–execute–verify loops in production coding agents.",
    references: [
      { title: "CSIRO agentic workflow patterns (2405.10467)", url: "https://arxiv.org/abs/2405.10467" },
    ],
    featured: true,
  },
  {
    id: "parallel-fanout",
    name: "Parallel fan-out",
    layer: "topology",
    category: "Throughput",
    summary: "Fan work out to parallel workers, then merge downstream.",
    description:
      "A router or splitter sends independent subtasks to parallel workers. A synthesizer or reducer merges partial results into one response. Maximizes throughput when subtasks do not depend on each other mid-flight.",
    problem:
      "Serial pipelines waste wall-clock time when subtasks could run concurrently with separate context windows.",
    when_to_use: [
      "Subtasks are independent (multi-source research, parallel tool calls).",
      "Wall-clock latency matters more than minimum token spend.",
      "Merge logic is well defined (concat, vote, LLM synthesize).",
    ],
    when_not_to_use: [
      "Later steps need intermediate results from earlier parallel branches in real time.",
      "Merge quality is fragile and needs heavy sequential refinement.",
      "Cost budget is tight — parallel LLM calls multiply spend.",
    ],
    forces: [
      "Best wall-clock latency for divisible work",
      "Higher aggregate cost than a single worker",
      "Merge step is a common failure point",
    ],
    verification: 3,
    traceability: 3,
    latency: 5,
    cost: 4,
    agent_count: { min: 3, max: 10, sweet_spot: "router + 2–5 workers + merge" },
    topology: "fanout",
    graph: {
      nodes: [
        { id: "router", role: "Split / route", kind: "worker" },
        { id: "worker_a", role: "Worker A", kind: "worker" },
        { id: "worker_b", role: "Worker B", kind: "worker" },
        { id: "worker_c", role: "Worker C", kind: "worker" },
        { id: "merge", role: "Merge / synthesize", kind: "worker" },
      ],
      edges: [
        { from: "router", to: "worker_a" },
        { from: "router", to: "worker_b" },
        { from: "router", to: "worker_c" },
        { from: "worker_a", to: "merge" },
        { from: "worker_b", to: "merge" },
        { from: "worker_c", to: "merge" },
      ],
    },
    framework_notes: {
      LangGraph: "Send API or parallel branches from a fan-out node into a reduce node.",
      AutoGen: "Concurrent agent replies collected by a synthesizer.",
      CrewAI: "Parallel task execution with a final aggregation task.",
    },
    evidence: "Standard pattern for map-reduce style agent workflows.",
    references: [
      { title: "Map-reduce agents (LangGraph)", url: "https://langchain-ai.github.io/langgraph/" },
    ],
    featured: true,
  },
  {
    id: "series-pipeline",
    name: "Series (pipeline)",
    layer: "topology",
    category: "Refinement",
    summary: "Sequential refinement — each worker passes output to the next (`A → B → C → D`).",
    description:
      "Workers run in a strict chain with no parallel branches. Each stage transforms or enriches the artifact from the previous step. Simpler than Pipeline + Critic when you do not need an explicit verify loop.",
    problem:
      "One-shot generation cannot iteratively refine context — later steps lack structured handoffs from earlier specialists.",
    when_to_use: [
      "Work naturally decomposes into ordered phases (draft → expand → polish).",
      "Each stage needs the full prior artifact, not partial parallel results.",
      "Branching and merge logic would add complexity without benefit.",
    ],
    when_not_to_use: [
      "Subtasks are independent and could run concurrently.",
      "You need explicit quality gates or revision loops between stages.",
      "A single worker with tools can cover the whole chain cheaply.",
    ],
    forces: [
      "Maximum traceability per stage",
      "Wall-clock time sums across stages",
      "Easy to reason about and debug",
    ],
    verification: 3,
    traceability: 4,
    latency: 2,
    cost: 3,
    agent_count: { min: 2, max: 6, sweet_spot: "3–4 chained specialists" },
    topology: "pipeline",
    graph: {
      nodes: [
        { id: "a", role: "Stage A", kind: "worker" },
        { id: "b", role: "Stage B", kind: "worker" },
        { id: "c", role: "Stage C", kind: "worker" },
        { id: "d", role: "Stage D", kind: "worker" },
      ],
      edges: [
        { from: "a", to: "b" },
        { from: "b", to: "c" },
        { from: "c", to: "d" },
      ],
    },
    framework_notes: {
      LangGraph: "Linear StateGraph — each node reads prior state and writes the next field.",
      AutoGen: "Sequential chat or chained agent handoffs.",
      CrewAI: "Tasks with explicit `context` from prior task outputs.",
    },
    evidence: "Baseline pattern in CSIRO sequential workflow catalogue.",
    references: [
      { title: "CSIRO agentic workflow patterns (2405.10467)", url: "https://arxiv.org/abs/2405.10467" },
    ],
    featured: false,
  },
  {
    id: "parallel-synthesizer",
    name: "Parallel + synthesizer",
    layer: "topology",
    category: "Analysis",
    summary: "Independent analyses in parallel, then one synthesizer merges perspectives.",
    description:
      "A router fans out to parallel analyst workers (research, code review, risk, etc.). A dedicated synthesizer worker merges divergent outputs into one coherent answer — stronger emphasis on merge quality than raw throughput fan-out.",
    problem:
      "Single-perspective analysis misses contradictions; concatenating parallel outputs produces incoherent bundles.",
    when_to_use: [
      "You need multiple independent lenses on the same input.",
      "Merge quality matters — synthesis is a first-class step, not an afterthought.",
      "Analysts can disagree; the synthesizer resolves or ranks findings.",
    ],
    when_not_to_use: [
      "Parallel branches produce identical artifact types that only need concatenation.",
      "Synthesis is trivial enough for the router to handle inline.",
      "Cost of N analysts plus a synthesizer exceeds budget.",
    ],
    forces: [
      "Richer coverage than one monolithic analyst",
      "Synthesizer is the quality bottleneck",
      "Higher cost than parallel fan-out without dedicated merge",
    ],
    verification: 4,
    traceability: 4,
    latency: 4,
    cost: 5,
    agent_count: { min: 4, max: 10, sweet_spot: "router + 2–4 analysts + synthesizer" },
    topology: "fanout",
    graph: {
      nodes: [
        { id: "router", role: "Route / brief", kind: "worker" },
        { id: "analyst_a", role: "Analyst A", kind: "worker" },
        { id: "analyst_b", role: "Analyst B", kind: "worker" },
        { id: "analyst_c", role: "Analyst C", kind: "worker" },
        { id: "synthesizer", role: "Synthesize / reconcile", kind: "worker" },
      ],
      edges: [
        { from: "router", to: "analyst_a" },
        { from: "router", to: "analyst_b" },
        { from: "router", to: "analyst_c" },
        { from: "analyst_a", to: "synthesizer" },
        { from: "analyst_b", to: "synthesizer" },
        { from: "analyst_c", to: "synthesizer" },
      ],
    },
    framework_notes: {
      LangGraph: "Map-reduce with a dedicated reduce/s synthesizer node and structured analyst outputs.",
      AutoGen: "Parallel nested chats feeding a summarizer agent.",
      CrewAI: "Parallel tasks converging on a final aggregation task with rubric.",
    },
    evidence: "Common in multi-source research and due-diligence agent demos.",
    featured: false,
  },
  {
    id: "hybrid-mixed-flow",
    name: "Hybrid",
    layer: "topology",
    category: "Complex workflows",
    summary: "Mixed control flow — parallel branches, conditionals, and sequential stages in one graph.",
    description:
      "Combines routing, parallel fan-out, if/else control nodes, and serial refinement in a single swarm. Use when real tasks need different shapes in different phases — not one pure topology end to end.",
    problem:
      "Forcing a pure supervisor, pipeline, or fan-out pattern onto heterogeneous workflows creates awkward workarounds and hidden state.",
    when_to_use: [
      "Phases differ: e.g. parallel research → sequential draft → conditional deploy path.",
      "Control nodes (if/else, while) belong between worker stages.",
      "You have test traces proving which branches fire in production.",
    ],
    when_not_to_use: [
      "A simpler topology covers 90% of runs — start there first.",
      "Team cannot maintain or debug multi-shape graphs yet.",
      "No observability — hybrid flows fail silently in unexpected branches.",
    ],
    forces: [
      "Highest expressiveness for real-world tasks",
      "Hardest to test and document",
      "Requires strong trace inspection in agentatlas test panel",
    ],
    verification: 4,
    traceability: 4,
    latency: 3,
    cost: 4,
    agent_count: { min: 5, max: 12, sweet_spot: "router + parallel block + serial tail + controls" },
    topology: "supervisor",
    graph: {
      nodes: [
        { id: "router", role: "Orchestrator", kind: "worker" },
        { id: "parallel_block", role: "Parallel sub-swarm", kind: "worker" },
        { id: "ifelse", role: "If / else gate", kind: "control" },
        { id: "serial_tail", role: "Serial refinement", kind: "worker" },
        { id: "output", role: "Respond", kind: "worker" },
      ],
      edges: [
        { from: "router", to: "parallel_block" },
        { from: "parallel_block", to: "ifelse" },
        { from: "ifelse", to: "serial_tail", label: "pass" },
        { from: "ifelse", to: "router", label: "retry" },
        { from: "serial_tail", to: "output" },
      ],
    },
    framework_notes: {
      LangGraph: "Compose subgraphs — parallel Send blocks, conditional edges, nested StateGraphs.",
      AutoGen: "Mix group chat routing with nested sequential teams.",
      agentatlas: "Use control nodes (if/else, while) between worker nodes; validate `sourceHandle` on branch edges.",
    },
    evidence: "Production swarms often evolve into hybrid graphs after v1 linear or supervisor designs.",
    references: [
      { title: "AutoGen conversation patterns", url: "https://microsoft.github.io/autogen/docs/tutorial/conversation-patterns" },
    ],
    featured: false,
  },
]

export function toArchitectureCard(entry: ArchitectureEntry): ArchitectureCardModel {
  return {
    id: entry.id,
    name: entry.name,
    category: entry.category,
    summary: entry.summary,
    topology: entry.topology,
    badge: entry.badge,
  }
}

export function getFeaturedArchitectureEntries(): ArchitectureEntry[] {
  return architectureCatalog.filter((entry) => entry.featured)
}

export function getExtendedArchitectureEntries(): ArchitectureEntry[] {
  return architectureCatalog.filter((entry) => !entry.featured)
}

export function getFeaturedArchitectures(): ArchitectureCardModel[] {
  return getFeaturedArchitectureEntries().map(toArchitectureCard)
}

export function getArchitectureById(id: string): ArchitectureEntry | undefined {
  return architectureCatalog.find((entry) => entry.id === id)
}
