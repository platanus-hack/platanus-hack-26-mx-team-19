import { NEXT_PUBLIC_APP_URL } from "@/config/env"

/** Canonical swarm skill doc on this site (no trailing slash on origin). */
export const AGENTATLAS_SWARM_SKILL_PATH = "/skill.md"

export const AGENTATLAS_SWARM_SKILL_PUBLIC_URL = `${NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}${AGENTATLAS_SWARM_SKILL_PATH}`

/** Hero / onboarding one-liner — pass to coding agents (Monid-style “set up” + doc URL). */
export const AGENTATLAS_AGENT_SETUP_COMMAND = `set up ${AGENTATLAS_SWARM_SKILL_PUBLIC_URL}`
