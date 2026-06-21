/**
 * Homologated architecture catalogue — single source for landing cards and skill docs.
 */

export type ArchitectureTopology = "supervisor" | "pipeline" | "fanout" | "swarm"

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
  /** Implementability: low=1-2 workers, medium=multi-worker, high=complex control flow, research=requires custom runtime or pre-training */
  complexity?: "low" | "medium" | "high" | "research"
  /** Shown on the landing architecture grid */
  featured?: boolean
}

/** Card-facing subset derived from {@link ArchitectureEntry}. */
export type ArchitectureCardModel = Pick<
  ArchitectureEntry,
  "id" | "name" | "category" | "summary" | "topology" | "badge" | "complexity"
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
  {
    id: "swarm-roles-dinamicos",
    name: "Roles Dinámicos y Bio-miméticos",
    layer: "cooperation",
    category: "Swarm",
    summary: "Agentes autónomos con roles especializados que cambian dinámicamente según el contexto.",
    description:
      "Agentes descentralizados que siguen reglas simples bio-miméticas (inspiradas en colonias de hormigas o abejas). La comunicación es local y mínima para optimizar la colaboración sin control centralizado.",
    problem:
      "La rigidez de roles en entornos cambiantes genera cuellos de botella y vulnerabilidad ante fallos de agentes clave.",
    when_to_use: [
      "El entorno es dinámico y requiere adaptabilidad de tareas.",
      "Se busca alta escalabilidad y tolerancia a fallos individuales.",
      "La comunicación global o centralizada es ineficiente.",
    ],
    when_not_to_use: [
      "Se requiere una secuencia estricta y predecible de acciones.",
      "Es crucial una supervisión o auditoría centralizada en tiempo real.",
    ],
    forces: [
      "Alta resiliencia a fallos",
      "Bajo acoplamiento y comunicación mínima",
      "Especialización dinámica",
    ],
    verification: 3,
    traceability: 2,
    latency: 4,
    cost: 2,
    agent_count: { min: 5, max: 50, sweet_spot: "10–20 agentes con roles fluidos" },
    topology: "swarm",
    graph: {
      nodes: [
        { id: "a", role: "Agente A (rol dinámico)", kind: "worker" },
        { id: "b", role: "Agente B (rol dinámico)", kind: "worker" },
        { id: "c", role: "Agente C (rol dinámico)", kind: "worker" },
        { id: "d", role: "Agente D (rol dinámico)", kind: "worker" },
        { id: "e", role: "Agente E (rol dinámico)", kind: "worker" },
        { id: "f", role: "Agente F (rol dinámico)", kind: "worker" },
      ],
      edges: [
        { from: "a", to: "b" }, { from: "b", to: "c" }, { from: "c", to: "d" },
        { from: "d", to: "e" }, { from: "e", to: "f" }, { from: "f", to: "a" },
        { from: "a", to: "d" }, { from: "b", to: "e" },
      ],
    },
    featured: true,
  },
  {
    id: "swarm-llm-embebido",
    name: "LLMs Embebidos y Auto-evolución",
    layer: "cooperation",
    category: "Cognitive",
    summary: "Cada agente integra un LLM ligero para razonamiento local y adaptación autónoma.",
    description:
      "Cada miembro del enjambre ejecuta un LLM local para interpretar su entorno y tomar decisiones. Usan protocolos P2P para compartir estados e implementar un módulo de auto-evolución que ajusta estrategias mediante feedback colectivo.",
    problem:
      "Los agentes con reglas estáticas no pueden adaptarse a objetivos globales complejos o cambios imprevistos en la semántica del entorno.",
    when_to_use: [
      "Los agentes deben interpretar lenguaje natural u objetivos globales complejos.",
      "Se requiere aprendizaje y mejora continua en el comportamiento del enjambre.",
    ],
    when_not_to_use: [
      "Dispositivos con recursos de cómputo extremadamente limitados.",
      "Se requieren garantías de comportamiento deterministas y formales.",
    ],
    forces: [
      "Razonamiento local avanzado",
      "Coordinación semántica auto-organizada",
      "Alto consumo de recursos (tokens/cómputo)",
    ],
    verification: 3,
    traceability: 3,
    latency: 2,
    cost: 5,
    agent_count: { min: 3, max: 15, sweet_spot: "5–8 agentes cognitivos" },
    topology: "swarm",
    graph: {
      nodes: [
        { id: "llm_a", role: "Agente LLM A", kind: "worker" },
        { id: "llm_b", role: "Agente LLM B", kind: "worker" },
        { id: "llm_c", role: "Agente LLM C", kind: "worker" },
        { id: "llm_d", role: "Agente LLM D", kind: "worker" },
        { id: "llm_e", role: "Agente LLM E", kind: "worker" },
      ],
      edges: [
        { from: "llm_a", to: "llm_b" }, { from: "llm_a", to: "llm_c" },
        { from: "llm_a", to: "llm_d" }, { from: "llm_a", to: "llm_e" },
        { from: "llm_b", to: "llm_c" }, { from: "llm_b", to: "llm_d" },
        { from: "llm_b", to: "llm_e" }, { from: "llm_c", to: "llm_d" },
        { from: "llm_c", to: "llm_e" }, { from: "llm_d", to: "llm_e" },
      ],
    },
    featured: true,
  },
  {
    id: "swarm-llm-centralizado",
    name: "LLM Centralizado y Agentes Distribuidos",
    layer: "topology",
    category: "Orchestration",
    summary: "Un LLM central como orquestador cognitivo para agentes ejecutores simples.",
    description:
      "A single LLM hub interprets the global state and dispatches adaptive directives to lightweight executor nodes. Unlike Supervisor/Router — where workers are full LLM agents with their own reasoning — executors here can be APIs, scripts, or physical actuators that only carry out instructions. All cognition is centralised; use this when you want cheap or zero-LLM executors.",
    problem:
      "Dotar a cada agente de un LLM es costoso e ineficiente, pero un enjambre puramente reactivo carece de dirección estratégica.",
    when_to_use: [
      "Se requiere planificación compleja y centralizada con ejecución física o local distribuida.",
      "Presupuesto limitado que impide ejecutar LLMs en cada nodo.",
    ],
    when_not_to_use: [
      "Entornos con latencia crítica o pérdida de conectividad constante con el nodo central.",
      "El punto único de fallo (el LLM central) es inaceptable.",
    ],
    forces: [
      "Planificación centralizada coherente",
      "Bajo costo en los nodos ejecutores",
      "Vulnerabilidad al punto único de fallo",
    ],
    verification: 4,
    traceability: 4,
    latency: 3,
    cost: 3,
    agent_count: { min: 4, max: 20, sweet_spot: "1 controlador + 5–10 ejecutores" },
    topology: "supervisor",
    graph: {
      nodes: [
        { id: "central_llm", role: "LLM Orquestador", kind: "worker" },
        { id: "executor_1", role: "Ejecutor A", kind: "worker" },
        { id: "executor_2", role: "Ejecutor B", kind: "worker" },
      ],
      edges: [
        { from: "central_llm", to: "executor_1" },
        { from: "central_llm", to: "executor_2" },
      ],
    },
    featured: false,
  },
  {
    id: "swarm-control-formal",
    name: "Control de Cohesión y Garantías Formales",
    layer: "verification",
    category: "Control",
    summary: "Modelos de control no lineal y algoritmos formales para garantizar estabilidad bajo ruido.",
    description:
      "Utiliza capas de control basadas en dinámicas no lineales y algoritmos matemáticos para asegurar la cohesión global y estabilidad dinámica del swarm en entornos ruidosos y con topologías cambiantes.",
    problem:
      "Los enjambres puramente heurísticos o basados en aprendizaje pueden divergir o volverse inestables ante perturbaciones del mundo real.",
    when_to_use: [
      "Sistemas físicos críticos (como UAVs o robótica móvil) donde la colisión o dispersión es catastrófica.",
      "Entornos con alto ruido de comunicación y topologías altamente dinámicas.",
    ],
    when_not_to_use: [
      "Tareas puramente de procesamiento de software o datos sin dinámicas físicas.",
      "Fases tempranas de exploración donde no se han definido las métricas de estabilidad.",
    ],
    forces: [
      "Garantías matemáticas de estabilidad",
      "Robustez frente al ruido del entorno",
      "Alta complejidad matemática y de modelado",
    ],
    verification: 5,
    traceability: 3,
    latency: 4,
    cost: 2,
    complexity: "research",
    badge: "Research",
    agent_count: { min: 5, max: 100, sweet_spot: "20–50 nodos controlados" },
    topology: "swarm",
    graph: {
      nodes: [
        { id: "n1", role: "Agente N1", kind: "worker" },
        { id: "n2", role: "Agente N2", kind: "worker" },
        { id: "n3", role: "Agente N3", kind: "worker" },
        { id: "n4", role: "Agente N4", kind: "worker" },
        { id: "n5", role: "Agente N5", kind: "worker" },
        { id: "ctrl", role: "Filtro de Cohesión / Control", kind: "control" },
      ],
      edges: [
        { from: "n1", to: "ctrl" }, { from: "n2", to: "ctrl" },
        { from: "n3", to: "ctrl" }, { from: "n4", to: "ctrl" },
        { from: "n5", to: "ctrl" },
        { from: "ctrl", to: "n1", label: "adjust" }, { from: "ctrl", to: "n3", label: "adjust" },
        { from: "n1", to: "n2" }, { from: "n2", to: "n3" }, { from: "n3", to: "n4" },
        { from: "n4", to: "n5" }, { from: "n5", to: "n1" },
      ],
    },
    featured: false,
  },
  {
    id: "swarm-mean-embeddings",
    name: "Representación Compacta y Aprendizaje (MARL)",
    layer: "cooperation",
    category: "Learning",
    summary: "Compresión de estado mediante mean embeddings o factorización tensorial para aprendizaje reforzado.",
    description:
      "Los agentes usan representaciones compactas de sus vecinos para reducir la sobrecarga de comunicación. Emplea aprendizaje por refuerzo multiagente (MARL) y separa las fases de entrenamiento (centralizado) y ejecución (distribuido/asíncrono).",
    problem:
      "El crecimiento exponencial del espacio de estados y la comunicación satura el sistema al escalar el número de agentes.",
    when_to_use: [
      "Sistemas de gran escala (cientos de agentes).",
      "Se dispone de un entorno de simulación para entrenamiento offline.",
    ],
    when_not_to_use: [
      "Sistemas con pocos agentes donde la representación compacta pierde precisión útil.",
      "No es posible realizar un entrenamiento previo o simulado.",
    ],
    forces: [
      "Escalabilidad teórica masiva",
      "Reducción drástica del ancho de banda",
      "Fase de entrenamiento costosa y compleja",
    ],
    verification: 3,
    traceability: 2,
    latency: 5,
    cost: 4,
    complexity: "research",
    badge: "Research",
    agent_count: { min: 10, max: 1000, sweet_spot: "50–100 agentes con MARL" },
    topology: "swarm",
    graph: {
      nodes: [
        { id: "tr1", role: "Entrenador Tr1 (centralizado)", kind: "worker" },
        { id: "tr2", role: "Entrenador Tr2 (centralizado)", kind: "worker" },
        { id: "tr3", role: "Entrenador Tr3 (centralizado)", kind: "worker" },
        { id: "ex1", role: "Ejecutor Ex1", kind: "worker" },
        { id: "ex2", role: "Ejecutor Ex2", kind: "worker" },
        { id: "ex3", role: "Ejecutor Ex3", kind: "worker" },
        { id: "ex4", role: "Ejecutor Ex4", kind: "worker" },
      ],
      edges: [
        { from: "tr1", to: "tr2" }, { from: "tr2", to: "tr3" },
        { from: "tr1", to: "ex1", label: "policy" }, { from: "tr1", to: "ex2", label: "policy" },
        { from: "tr2", to: "ex2", label: "policy" }, { from: "tr2", to: "ex3", label: "policy" },
        { from: "tr3", to: "ex3", label: "policy" }, { from: "tr3", to: "ex4", label: "policy" },
      ],
    },
    featured: false,
  },
  {
    id: "swarm-homogeneo-minimalista",
    name: "Enjambre Homogéneo Minimalista",
    layer: "cooperation",
    category: "Bio-inspired",
    summary: "Agentes idénticos con comunicación binaria simple o de un solo bit.",
    description:
      "Agentes simples y homogéneos que interactúan de forma local mediante protocolos de comunicación minimalistas (como WOSP). Basado en la emergencia de comportamiento colectivo sin requerir sincronización global ni mensajes complejos.",
    problem:
      "Protocolos de comunicación pesados causan colisiones de red y alto consumo energético en hardware limitado.",
    when_to_use: [
      "Hardware extremadamente simple o barato.",
      "Tareas de cobertura de área, patrullaje o dispersión simple.",
    ],
    when_not_to_use: [
      "Se requiere coordinación de planes complejos o razonamiento simbólico.",
    ],
    forces: [
      "Costo de hardware mínimo",
      "Protocolo ultra ligero sin colisiones",
      "Comportamiento individual extremadamente simple",
    ],
    verification: 2,
    traceability: 2,
    latency: 5,
    cost: 1,
    complexity: "research",
    badge: "Research",
    agent_count: { min: 10, max: 10000, sweet_spot: "100+ agentes homogéneos" },
    topology: "swarm",
    graph: {
      nodes: [
        { id: "h1", role: "Agente H1", kind: "worker" },
        { id: "h2", role: "Agente H2", kind: "worker" },
        { id: "h3", role: "Agente H3", kind: "worker" },
        { id: "h4", role: "Agente H4", kind: "worker" },
        { id: "h5", role: "Agente H5", kind: "worker" },
        { id: "h6", role: "Agente H6", kind: "worker" },
      ],
      edges: [
        { from: "h1", to: "h2" }, { from: "h2", to: "h3" },
        { from: "h4", to: "h5" }, { from: "h5", to: "h6" },
        { from: "h1", to: "h4" }, { from: "h2", to: "h5" }, { from: "h3", to: "h6" },
      ],
    },
    featured: false,
  },
  {
    id: "swarm-jerarquico-metaheuristico",
    name: "Enjambre Jerárquico con Metaheurísticas",
    layer: "cooperation",
    category: "Optimization",
    summary: "Jerarquías dinámicas y optimización híbrida mediante PSO y algoritmos genéticos.",
    description:
      "Forma jerarquías temporales asignando líderes según el contexto. Combina el comportamiento de enjambre con metaheurísticas de optimización (como Particle Swarm Optimization y algoritmos genéticos) para resolver tareas complejas en espacios 3D.",
    problem:
      "La falta de estructura temporal dificulta la resolución de subtareas complejas que requieren secuenciación.",
    when_to_use: [
      "Optimización de rutas en espacios 3D (ej. enjambres de UAVs).",
      "Tareas que se benefician de división jerárquica temporal.",
    ],
    when_not_to_use: [
      "Entornos planos bidimensionales o de procesamiento de texto simple.",
    ],
    forces: [
      "Optimización global eficiente",
      "Liderazgo adaptable sin rigidez",
      "Complejidad en la sincronización de líderes",
    ],
    verification: 4,
    traceability: 3,
    latency: 3,
    cost: 3,
    complexity: "research",
    badge: "Research",
    agent_count: { min: 6, max: 40, sweet_spot: "12–24 agentes con sub-líderes" },
    topology: "swarm",
    graph: {
      nodes: [
        { id: "l0", role: "Líder Raíz L0", kind: "worker" },
        { id: "l1", role: "Sub-líder L1", kind: "worker" },
        { id: "l2", role: "Sub-líder L2", kind: "worker" },
        { id: "f1", role: "Seguidor F1", kind: "worker" },
        { id: "f2", role: "Seguidor F2", kind: "worker" },
        { id: "f3", role: "Seguidor F3", kind: "worker" },
        { id: "f4", role: "Seguidor F4", kind: "worker" },
      ],
      edges: [
        { from: "l0", to: "l1" }, { from: "l0", to: "l2" },
        { from: "l1", to: "l2", label: "peer" },
        { from: "l1", to: "f1" }, { from: "l1", to: "f2" },
        { from: "l2", to: "f3" }, { from: "l2", to: "f4" },
      ],
    },
    featured: false,
  },
  {
    id: "swarm-modular-asincrono",
    name: "Swarm Modular Asíncrono",
    layer: "cooperation",
    category: "Modular",
    summary: "Roles modulares (exploradores, recolectores, coordinadores) con mensajes asíncronos.",
    description:
      "Basado en SwarmSys, los agentes se dividen en módulos especializados para roles específicos. Operan en fases iterativas para adaptación continua y se comunican mediante mensajes asíncronos para flexibilidad y escalabilidad.",
    problem:
      "La comunicación síncrona bloquea a los agentes y reduce la velocidad de exploración y recolección.",
    when_to_use: [
      "Tareas de búsqueda, exploración o recolección de recursos distribuidos.",
      "Sistemas donde el desacoplamiento temporal de tareas es beneficioso.",
    ],
    when_not_to_use: [
      "Sistemas que requieren consenso síncrono inmediato para cada paso.",
    ],
    forces: [
      "Especialización de tareas clara",
      "Desacoplamiento temporal completo",
      "Monitoreo global más complejo",
    ],
    verification: 3,
    traceability: 4,
    latency: 4,
    cost: 3,
    agent_count: { min: 6, max: 30, sweet_spot: "3 roles x 4 agentes cada uno" },
    topology: "swarm",
    graph: {
      nodes: [
        { id: "sc1", role: "Explorador Sc1", kind: "worker" },
        { id: "sc2", role: "Explorador Sc2", kind: "worker" },
        { id: "coord", role: "Coordinador", kind: "worker" },
        { id: "ga1", role: "Recolector Ga1", kind: "worker" },
        { id: "ga2", role: "Recolector Ga2", kind: "worker" },
      ],
      edges: [
        { from: "sc1", to: "coord", label: "async" },
        { from: "sc2", to: "coord", label: "async" },
        { from: "coord", to: "ga1", label: "task" },
        { from: "coord", to: "ga2", label: "task" },
        { from: "coord", to: "sc1", label: "feedback" },
        { from: "sc1", to: "sc2" },
        { from: "ga1", to: "ga2" },
      ],
    },
    featured: false,
  },
  {
    id: "react-tool-loop",
    name: "ReAct / Agentic Tool Loop",
    layer: "topology",
    category: "Agentic",
    summary: "Single agent iterates through Reason → Act (tool call) → Observe until goal is reached — the building block of most real agents.",
    description:
      "One capable agent loops through a think-then-act cycle. At each step it chooses a tool (web search, code exec, scrape, etc.), observes the result, and reasons again. No parallel workers — all complexity lives in the tool selection and prompt. The agent decides when the goal is met.",
    problem:
      "Multi-worker graphs add coordination overhead when a single goal only requires iterative tool use, not parallel specialization or distinct roles.",
    when_to_use: [
      "A goal is achievable by one capable agent with the right tools (search, code exec, scrape).",
      "The number of steps is unknown upfront — the agent decides when done.",
      "Adding a second worker would only fan out the same tool set, not add real specialization.",
    ],
    when_not_to_use: [
      "Tasks decompose into genuinely different roles needing different models or prompts.",
      "You need guaranteed parallel throughput — the loop is serial by nature.",
      "The loop could iterate infinitely — add a While node with maxIterations.",
    ],
    forces: [
      "Simplest possible graph: one worker node",
      "All intelligence lives in the agent prompt and tool selection",
      "Hard to parallelise; add fan-out if throughput matters",
    ],
    verification: 3,
    traceability: 4,
    latency: 3,
    cost: 3,
    complexity: "low",
    agent_count: { min: 1, max: 1, sweet_spot: "1 agent + 2–5 tools" },
    topology: "pipeline",
    graph: {
      nodes: [
        { id: "agent", role: "ReAct Agent", kind: "worker" },
        { id: "tool_web", role: "Tool: Web Search", kind: "worker" },
        { id: "tool_code", role: "Tool: Code Exec", kind: "worker" },
        { id: "tool_scrape", role: "Tool: Scrape", kind: "worker" },
      ],
      edges: [
        { from: "agent", to: "tool_web" },
        { from: "agent", to: "tool_code" },
        { from: "agent", to: "tool_scrape" },
        { from: "tool_web", to: "agent", label: "observe" },
        { from: "tool_code", to: "agent", label: "observe" },
        { from: "tool_scrape", to: "agent", label: "observe" },
      ],
    },
    framework_notes: {
      LangGraph: "Single StateGraph node with tools list; conditional edge loops back until agent emits final answer.",
      AutoGen: "ConversableAgent with function_map; loops via reply until termination condition.",
      CrewAI: "Single-agent task with tool list; Process.sequential with self-reflection enabled.",
      agentatlas: "One worker node with agentTools configured. Add a While control node with maxIterations cap if infinite loops are a risk.",
    },
    evidence: "Foundation of OpenAI function calling, Claude tool use, and most single-agent production deployments.",
    references: [
      { title: "ReAct: Synergizing Reasoning and Acting in LLMs (Yao et al. 2022)", url: "https://arxiv.org/abs/2210.11610" },
    ],
    badge: "Foundation",
    featured: true,
  },
  {
    id: "debate-judge",
    name: "Debate / Multi-perspective Judge",
    layer: "cooperation",
    category: "Verification",
    summary: "Two agents argue opposing positions; an independent judge synthesizes and decides — surfaces blindspots systematically.",
    description:
      "A router sends the same task to two agents with deliberately different framings (Pro vs Con, Method A vs Method B, or Red Team vs Blue Team). An independent Judge agent reads both arguments and renders a structured verdict. The adversarial framing forces surface of counterarguments before committing to an answer.",
    problem:
      "Single-agent responses can be confidently wrong. Parallel analysts with the same framing produce correlated errors. A structured adversarial setup surfaces counterarguments and edge cases that single-perspective evaluation misses.",
    when_to_use: [
      "High-stakes decisions with two valid framings (policy, fact-check, legal review).",
      "You want to explicitly surface counterarguments before committing to an answer.",
      "The judge can be prompted with a structured rubric for evaluation.",
    ],
    when_not_to_use: [
      "The task has no meaningful opposing perspective — debate adds cost without benefit.",
      "Latency is the primary constraint — minimum 3 serial LLM calls.",
      "Both agents will hit the same retrieval source and produce correlated outputs.",
    ],
    forces: [
      "Surfaces blindspots and counterarguments systematically",
      "Judge prompt quality determines final output quality",
      "3× minimum LLM cost vs. single-agent approach",
    ],
    verification: 5,
    traceability: 4,
    latency: 2,
    cost: 4,
    complexity: "medium",
    agent_count: { min: 3, max: 5, sweet_spot: "2 debaters + 1 judge" },
    topology: "fanout",
    graph: {
      nodes: [
        { id: "router", role: "Task Router", kind: "worker" },
        { id: "agent_pro", role: "Proponent (For)", kind: "worker" },
        { id: "agent_con", role: "Opponent (Against)", kind: "worker" },
        { id: "judge", role: "Judge / Synthesizer", kind: "worker" },
        { id: "output", role: "Final Verdict", kind: "worker" },
      ],
      edges: [
        { from: "router", to: "agent_pro" },
        { from: "router", to: "agent_con" },
        { from: "agent_pro", to: "judge" },
        { from: "agent_con", to: "judge" },
        { from: "judge", to: "output" },
      ],
    },
    framework_notes: {
      LangGraph: "Fan-out from router node to two parallel agent nodes, reduce into judge node.",
      AutoGen: "Two-agent debate chat; third judging agent reads the conversation history.",
      agentatlas: "Parallel fan-out to two worker nodes with opposing system prompts, converge on judge worker.",
    },
    evidence: "Used in constitutional AI evaluation, red-teaming, and high-stakes document review workflows.",
    references: [
      { title: "Society of Mind and multi-agent debate (Du et al. 2023)", url: "https://arxiv.org/abs/2305.14325" },
    ],
    featured: true,
  },
  {
    id: "human-in-loop",
    name: "Human-in-the-loop Gate",
    layer: "verification",
    category: "Safety",
    summary: "A human approval checkpoint pauses the swarm until a person approves, rejects, or redirects — essential for irreversible actions.",
    description:
      "An approval gate node interrupts execution flow and waits for human input before continuing. On approval the graph proceeds to the action node; on rejection it loops back to a revision worker. Adds an explicit human control point without changing the rest of the graph structure.",
    problem:
      "Fully autonomous swarms can confidently take irreversible actions (send emails, deploy code, charge cards) with no checkpoint. Adding explicit gates makes risk visible, auditable, and controllable.",
    when_to_use: [
      "Actions are irreversible: send, publish, deploy, charge, delete.",
      "Regulatory or compliance requirements mandate human sign-off.",
      "Output quality variance is high enough that human review adds reliable value.",
    ],
    when_not_to_use: [
      "Humans are unavailable in the time window required by the task.",
      "The action is fully reversible and cost of error is low.",
      "Full automation is the explicit product requirement.",
    ],
    forces: [
      "Makes irreversible risk explicit and auditable",
      "Blocks throughput — latency is bounded by human response time",
      "Adds compliance-grade accountability trail",
    ],
    verification: 5,
    traceability: 5,
    latency: 1,
    cost: 2,
    complexity: "low",
    agent_count: { min: 2, max: 6, sweet_spot: "1–2 workers + 1 approval gate + human" },
    topology: "pipeline",
    graph: {
      nodes: [
        { id: "worker", role: "Execute / Draft", kind: "worker" },
        { id: "gate", role: "Human Approval Gate", kind: "control" },
        { id: "continue", role: "Publish / Act", kind: "worker" },
        { id: "revise", role: "Revise / Rework", kind: "worker" },
      ],
      edges: [
        { from: "worker", to: "gate" },
        { from: "gate", to: "continue", label: "approve" },
        { from: "gate", to: "revise", label: "reject" },
        { from: "revise", to: "worker" },
      ],
    },
    framework_notes: {
      LangGraph: "langgraph.interrupt() blocks execution and waits for external resume signal.",
      AutoGen: "Human proxy agent in the chat loop with reply=human_input.",
      agentatlas: "Use the built-in user_approval control node — sources: approve → continue, reject → revise loop.",
    },
    evidence: "Standard safety pattern in production agentic workflows handling financial, legal, or irreversible operations.",
    featured: false,
  },
  {
    id: "nested-swarm",
    name: "Nested Swarm Delegation",
    layer: "topology",
    category: "Composition",
    summary: "An orchestrator delegates complex subtasks to specialized child swarms as callable black boxes — enables reusable modular composition.",
    description:
      "A top-level orchestrator agent decomposes work and invokes child swarms as tools (run_swarm). Each child swarm encapsulates a full multi-step workflow; the parent only sees inputs and outputs. Enables modular composition of complex systems without exposing internal graph structure across boundaries. Child swarms can be developed and tested independently.",
    problem:
      "A single flat graph becomes unmanageable as task complexity grows. Nesting swarms as black-box tools enables reuse, independent testing, and team ownership of sub-workflows without coupling internal state.",
    when_to_use: [
      "A subtask is complex enough to warrant its own multi-worker graph.",
      "The same child workflow is reused across multiple parent swarms.",
      "Teams own different swarms independently — loose coupling is required.",
    ],
    when_not_to_use: [
      "The subtask is simple enough for one worker with tools.",
      "Cross-swarm real-time state sharing is required — nesting hides internal state.",
      "Latency budget is tight — each nested run adds call overhead.",
    ],
    forces: [
      "Maximum composability — child swarms are reusable, independently testable",
      "Clean boundary: parent only sees swarm input/output",
      "Debugging requires tracing into child run history separately",
    ],
    verification: 4,
    traceability: 3,
    latency: 2,
    cost: 5,
    complexity: "medium",
    agent_count: { min: 4, max: 20, sweet_spot: "1 orchestrator + 2–3 child swarms (3–5 workers each)" },
    topology: "supervisor",
    graph: {
      nodes: [
        { id: "orchestrator", role: "Top-level Orchestrator", kind: "worker" },
        { id: "sub_a", role: "Child Swarm A", kind: "worker" },
        { id: "sub_b", role: "Child Swarm B", kind: "worker" },
        { id: "merge", role: "Merge / Synthesize", kind: "worker" },
        { id: "output", role: "Final Output", kind: "worker" },
      ],
      edges: [
        { from: "orchestrator", to: "sub_a" },
        { from: "orchestrator", to: "sub_b" },
        { from: "sub_a", to: "merge" },
        { from: "sub_b", to: "merge" },
        { from: "merge", to: "output" },
      ],
    },
    framework_notes: {
      LangGraph: "Subgraph nodes compiled separately; parent graph invokes them as nodes with their own state schemas.",
      AutoGen: "Nested GroupChat or ConversableAgent wrapping an inner chat manager.",
      agentatlas: "Add swarm control node to parent graph; configure swarmTools on the orchestrator worker to expose child swarms as callable tools.",
    },
    evidence: "Common in production agentic systems: a research swarm feeds a drafting swarm, each independently versioned.",
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
    complexity: entry.complexity,
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
