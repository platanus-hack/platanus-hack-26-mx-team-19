---
name: agentatlas-swarms
description: >-
  Design, edit, run, and debug multi-agent swarms on agentatlas. Use when the
  user mentions swarms, swarm graphs, agent workers, topology, test runs, SSE
  traces, sub-swarms, control nodes, or agentatlas platform/API contracts.
---

# agentatlas — Swarm skill

Platform to **design, test, and compare multi-agent swarm architectures** — not a framework wrapper. Pick a topology, wire workers on a graph, run with real models, inspect traces.

**Public skill URL:** `{APP_URL}/skill.md`

**Repos (sibling folders):**

| Repo | Role |
|------|------|
| `agentatlas-platform` | Next.js UI — landing, auth, swarm editor, test panel, admin |
| `agentatlas-services` | NestJS API — `/api/v1`, orchestrator, inference, tools |

---

## Core concepts

| Term | Meaning |
|------|---------|
| **Swarm** | Named task: `goal`, `topology` metadata, worker refs |
| **AgentWorker** | Reusable agent blueprint: model, prompts, I/O schemas — **no graph edges** |
| **SwarmGraph** | Directed graph: worker nodes + control nodes + edges |
| **SwarmRun** | One execution (user input → final output) |
| **AgentRun** | One worker invocation inside a run |
| **SwarmContext** | In-memory run state: `goal`, `runInput`, `shared`, per-worker outputs |

**Rule:** specialized workers connected by the graph beat one monolithic prompt.

---

## Architecture patterns (catalogue)

Map intent to structure before picking LangGraph / AutoGen / CrewAI / custom runtime.

| Pattern | When | Shape |
|---------|------|-------|
| **Supervisor / Router** | Clear ownership, low coupling | Hub routes to specialists, merges results |
| **Pipeline + Critic** | High traceability, quality gates | Plan → execute → verify → output |
| **Parallel fan-out** | Throughput, independent subtasks | Fan-out → workers → merge |
| **Series (pipeline)** | Sequential refinement | `A → B → C → D` |
| **Parallel + synthesizer** | Independent analyses | Router → `A1…An` (parallel) → merge |
| **Hybrid** | Mixed control flow | Parallel + conditional + sequential |

Sweet spot: **3–7 workers**. Avoid filler agents (format-only steps → use functions, not workers).

---

## Platform routes (UI)

| Route | Purpose |
|-------|---------|
| `/dashboard/swarms` | User swarm list + editor |
| `/admin/swarms` | Admin swarms |
| `/admin/users` | User management |

**Editor layout:** canvas (React Flow) + inspector (node config) + test panel (right, streaming runs).

---

## Control nodes (graph palette)

Branch edges **must** use `sourceHandle` (validated on save).

| Palette | `kind` | Handles |
|---------|--------|---------|
| Start | `start` | target → downstream |
| If / else | `ifelse` | target; sources `case-<id>`, `else` |
| While | `while` | target; sources `loop`, `done` |
| Web scrape | `scraper` | target; sources `success`, `failed` |
| Sub-swarm | `swarm` | target; sources `success`, `failed` |
| User approval | `user_approval` | target; sources `approve`, `reject` |
| End | `end` | target only |

Platform editor code: `agentatlas-platform/src/components/admin/swarms/editor/`.

---

## API essentials

**Base:** `{API_URL}/api/v1` · **Auth:** `Authorization: Bearer <access_token>`

| Action | Method | Endpoint |
|--------|--------|----------|
| Load editor | GET | `/swarms/:id/workspace` |
| Save graph | PUT | `/swarms/:id/graph` |
| Save worker | PATCH | `/agent-workers/:workerId` |
| Test one worker | POST | `/agent-workers/:workerId/run` |
| Run swarm (sync) | POST | `/swarms/:id/run` |
| Run swarm (SSE) | POST | `/swarms/:id/run/stream` |
| Run steps | GET | `/swarm-runs/:runId/agent-runs` |
| Inference catalog | GET | `/inference/setup` |

Prefer **`GET /swarms/:id/workspace`** for one-round-trip bootstrap (`swarm`, `graph`, `workers`, `referencedSwarms`).

---

## Worker tools (OpenAI Direct)

Configured in **Configure agent** panel (`AgentToolsSection`, `SwarmToolsSection`).

| UI | PATCH field | Notes |
|----|-------------|-------|
| Web search | `openaiTools.webSearch` | Hosted OpenAI Responses tool |
| Platform tools | `agentTools: string[]` | e.g. `webpage_scrape`, `run_swarm` |
| Sub-swarms | `swarmTools: string[]` | Exposes `swarm_<objectId>` per child |

**Prefer `swarmTools` over generic `run_swarm`** when child swarms are known. Generic `run_swarm` is omitted at runtime when `swarmTools` is non-empty.

Requires worker `model.provider: openai_direct` for standard agent tools panel.

---

## Inference

`INFERENCE_MODE`: `auto` (default) | `llm` | `stub`.

Worker `model.provider` routes to OpenAI, Anthropic, OpenRouter, Gemini, Grok, Ollama, etc. See `agentatlas-services/docs/INFERENCE.md`.

Test panel streams SSE events: worker logs, token usage, approval checkpoints.

---

## Prompt / context tokens

Available in Instructions via `AgentWorkerRunInput`:

- `{{goal}}` — swarm objective
- `{{runInput.*}}` — caller payload
- `{{shared.*}}` — cross-worker run state
- Upstream worker outputs via graph edges (default: isolated upstream)

Avoid infinite loops: While nodes use `maxIterations`; orchestrator has `maxNodeVisits`.

---

## Workflow for agents helping users

1. **Clarify intent** — verification needs, risk, latency, human gates.
2. **Pick pattern** — supervisor, pipeline, fan-out, or hybrid.
3. **Model graph** — Start → workers/control nodes → End; wire `sourceHandle` on branches.
4. **Configure workers** — model provider, prompts, I/O schemas, tools/sub-swarms.
5. **Test** — `POST …/run/stream`; inspect agent runs and traces.
6. **Iterate** — duplicate swarm, tweak prompts, compare traces as evidence.

---

## Deep reference (read when implementing)

| Doc | Location |
|-----|----------|
| Data model + orchestrator | `agentatlas-services/docs/SWARMS.md` |
| Editor API contract | `agentatlas-services/docs/SWARMS-WORKSPACE.md` |
| HTTP reference | `agentatlas-services/docs/SWARMS-API.md` |
| Agent I/O contracts | `agentatlas-services/docs/SWARMS-AGENT-IO.md` |
| Tools runtime | `agentatlas-services/docs/TOOLS.md` |
| Inference | `agentatlas-services/docs/INFERENCE.md` |
| Editor control nodes | `agentatlas-platform/docs/SWARMS-EDITOR.md` |
| Tools UI | `agentatlas-platform/docs/SWARMS-TOOLS.md` |

---

## Agent behavior on this codebase

- Product scope is swarms only — graph editor, test harness, and agent skill documentation.
- Verify HTTP DTOs in **agentatlas-services** before changing the client.
- API client: `agentatlas-platform/src/data/api/server/index.ts` (`createServices()`).
- Minimize scope; match existing editor patterns under `src/components/admin/swarms/`.
