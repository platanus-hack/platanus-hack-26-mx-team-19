import type { AxiosInstance } from "axios"
import auth from "@/data/api/server/auth"
import { normalizeAuthMeUser } from "./normalizeAuthMeUser"
import type {
  AdminListUsersQuery,
  AdminUpdateUserPayload,
  AdminUser,
  AdminUserListResult,
} from "./admin"
import type {
  AdminAgentWorker,
  AdminListSwarmsQuery,
  AdminSwarm,
  AdminSwarmListResult,
  AdminUpdateAgentWorkerPayload,
  AdminUpdateSwarmPayload,
  AgentRun,
  CreateAgentWorkerPayload,
  CreateSwarmPayload,
  DuplicateSwarmPayload,
  DuplicateSwarmResult,
  ReferencedSwarmSummary,
  RunSwarmPayload,
  RunSwarmResult,
  SwarmGraph,
  SwarmRun,
  SwarmRunApproval,
  DecideSwarmRunApprovalPayload,
  DecideSwarmRunApprovalResult,
  UpsertSwarmGraphPayload,
} from "./swarms"
import type { InferenceSetup } from "./inference"
import type {
  CreateUserApiTokenPayload,
  CreateUserApiTokenResult,
  UserApiToken,
} from "./apiTokens"
import type {
  PlatformToolDescriptor,
  ToolIntegrationsResponse,
  ToolsCatalog,
} from "./tools"

export { normalizeAuthMeUser } from "./normalizeAuthMeUser"
export type {
  PlatformToolDescriptor,
  ToolConnectionStatus,
  ToolIntegration,
  ToolIntegrationsResponse,
  ToolsCatalog,
} from "./tools"
export type {
  AdminAccountTier,
  AdminListUsersQuery,
  AdminUpdateUserPayload,
  AdminUser,
  AdminUserListResult,
  AdminUserRole,
} from "./admin"
export type {
  AdminAgentWorker,
  AdminListSwarmsQuery,
  AdminSwarm,
  AdminSwarmListResult,
  AdminUpdateAgentWorkerPayload,
  AdminUpdateSwarmPayload,
  AgentRun,
  AgentWorkerModel,
  AgentWorkerPromptMessage,
  CreateAgentWorkerPayload,
  CreateSwarmPayload,
  DuplicateSwarmPayload,
  DuplicateSwarmResult,
  ReferencedSwarmSummary,
  RunSwarmPayload,
  RunSwarmResult,
  SwarmGraph,
  SwarmGraphEdge,
  SwarmGraphNode,
  SwarmRun,
  SwarmRunApproval,
  SwarmRunModelUsage,
  SwarmRunScrapeRequestLine,
  SwarmRunScrapeUsage,
  SwarmSseEvent,
  DecideSwarmRunApprovalPayload,
  DecideSwarmRunApprovalResult,
  UpsertSwarmGraphPayload,
} from "./swarms"
export type {
  InferenceMode,
  InferenceProviderKind,
  InferenceProviderSetup,
  InferenceSetup,
} from "./inference"
export type {
  CreateUserApiTokenPayload,
  CreateUserApiTokenResult,
  UserApiToken,
} from "./apiTokens"

export interface AuthSessionPayload {
  access_token: string
  refresh_token: string
  user: Record<string, unknown>
}

type LoginPayload = { email: string; password: string }
type SignUpPayload = {
  username: string
  firstName: string
  lastName: string
  email: string
  password: string
}

export type UsernameAvailabilityResponse = {
  username: string
  valid: boolean
  available: boolean
  reason?: string
}

export type ServicesApi = {
  signUp: (data: SignUpPayload) => Promise<AuthSessionPayload>
  login: (data: LoginPayload) => Promise<AuthSessionPayload>
  getUser: () => Promise<Record<string, unknown> | null>
  logout: () => Promise<unknown>
  checkUsernameAvailability: (username: string) => Promise<UsernameAvailabilityResponse>
  createAgentWorker: (data: CreateAgentWorkerPayload) => Promise<AdminAgentWorker>
  createSwarm: (data: CreateSwarmPayload) => Promise<AdminSwarm>
  listSwarms: () => Promise<AdminSwarm[]>
  getSwarm: (id: string) => Promise<AdminSwarm>
  getSwarmWorkspace: (id: string) => Promise<{
    swarm: AdminSwarm
    graph: SwarmGraph | null
    workers: AdminAgentWorker[]
    referencedSwarms?: ReferencedSwarmSummary[]
  }>
  updateSwarm: (id: string, data: AdminUpdateSwarmPayload) => Promise<AdminSwarm>
  deleteSwarm: (id: string) => Promise<void>
  duplicateSwarm: (id: string, data?: DuplicateSwarmPayload) => Promise<DuplicateSwarmResult>
  upsertSwarmGraph: (swarmId: string, data: UpsertSwarmGraphPayload) => Promise<SwarmGraph>
  getAgentWorker: (id: string) => Promise<AdminAgentWorker>
  updateAgentWorker: (
    id: string,
    data: AdminUpdateAgentWorkerPayload,
  ) => Promise<AdminAgentWorker>
  listSwarmRuns: (swarmId: string) => Promise<SwarmRun[]>
  getSwarmRun: (runId: string) => Promise<SwarmRun>
  listSwarmRunAgentRuns: (runId: string) => Promise<AgentRun[]>
  adminListUsers: (query?: AdminListUsersQuery) => Promise<AdminUserListResult>
  adminGetUser: (id: string) => Promise<AdminUser>
  adminUpdateUser: (id: string, data: AdminUpdateUserPayload) => Promise<AdminUser>
  adminListSwarms: (query?: AdminListSwarmsQuery) => Promise<AdminSwarmListResult>
  adminGetSwarm: (id: string) => Promise<AdminSwarm>
  adminUpdateSwarm: (id: string, data: AdminUpdateSwarmPayload) => Promise<AdminSwarm>
  adminDeleteSwarm: (id: string) => Promise<void>
  adminGetSwarmGraph: (swarmId: string) => Promise<SwarmGraph>
  adminUpsertSwarmGraph: (swarmId: string, data: UpsertSwarmGraphPayload) => Promise<SwarmGraph>
  adminRunSwarm: (swarmId: string, data?: RunSwarmPayload) => Promise<RunSwarmResult>
  adminListSwarmRuns: (swarmId: string) => Promise<SwarmRun[]>
  adminGetSwarmRun: (runId: string) => Promise<SwarmRun>
  adminListSwarmRunAgentRuns: (runId: string) => Promise<AgentRun[]>
  getSwarmRunPendingApproval: (runId: string) => Promise<SwarmRunApproval | null>
  decideSwarmRunApproval: (
    approvalId: string,
    data: DecideSwarmRunApprovalPayload,
  ) => Promise<DecideSwarmRunApprovalResult>
  adminDecideSwarmRunApproval: (
    approvalId: string,
    data: DecideSwarmRunApprovalPayload,
  ) => Promise<DecideSwarmRunApprovalResult>
  adminGetAgentWorker: (id: string) => Promise<AdminAgentWorker>
  adminUpdateAgentWorker: (
    id: string,
    data: AdminUpdateAgentWorkerPayload,
  ) => Promise<AdminAgentWorker>
  getInferenceSetup: () => Promise<InferenceSetup>
  listApiTokens: () => Promise<UserApiToken[]>
  createApiToken: (data: CreateUserApiTokenPayload) => Promise<CreateUserApiTokenResult>
  revokeApiToken: (id: string) => Promise<void>
  listToolsCatalog: () => Promise<ToolsCatalog>
  listToolIntegrations: () => Promise<ToolIntegrationsResponse>
}

function createServices(api: AxiosInstance): ServicesApi {
  return {
    signUp: (data) =>
      api.post("/auth/register", data).then((r) => r.data as AuthSessionPayload),
    checkUsernameAvailability: (username) =>
      api
        .get<UsernameAvailabilityResponse>("/auth/username/availability", {
          params: { username },
        })
        .then((r) => r.data),
    login: (data) =>
      api.post("/auth/login", data).then((r) => r.data as AuthSessionPayload),
    getUser: () =>
      api.get("/users/me").then((r) => {
        const normalized = normalizeAuthMeUser(r.data ?? null)
        if (normalized == null || typeof normalized !== "object" || Array.isArray(normalized)) {
          return null
        }
        return normalized as Record<string, unknown>
      }),
    logout: () => {
      const refreshToken = auth.getRefreshToken()
      if (!refreshToken) return Promise.resolve()
      return api.post("/auth/logout", { refresh_token: refreshToken })
    },
    createAgentWorker: (data) =>
      api.post("/agent-workers", data).then((r) => r.data as AdminAgentWorker),
    createSwarm: (data) => api.post("/swarms", data).then((r) => r.data as AdminSwarm),
    listSwarms: () => api.get("/swarms").then((r) => r.data as AdminSwarm[]),
    getSwarm: (id) => api.get(`/swarms/${id}`).then((r) => r.data as AdminSwarm),
    getSwarmWorkspace: (id) =>
      api
        .get(`/swarms/${id}/workspace`)
        .then(
          (r) =>
            r.data as {
              swarm: AdminSwarm
              graph: SwarmGraph | null
              workers: AdminAgentWorker[]
              referencedSwarms?: ReferencedSwarmSummary[]
            },
        ),
    updateSwarm: (id, data) =>
      api.patch(`/swarms/${id}`, data).then((r) => r.data as AdminSwarm),
    deleteSwarm: (id) => api.delete(`/swarms/${id}`).then(() => undefined),
    duplicateSwarm: (id, data) =>
      api
        .post(`/swarms/${id}/duplicate`, data ?? {})
        .then((r) => r.data as DuplicateSwarmResult),
    upsertSwarmGraph: (swarmId, data) =>
      api.put(`/swarms/${swarmId}/graph`, data).then((r) => r.data as SwarmGraph),
    getAgentWorker: (id) =>
      api.get(`/agent-workers/${id}`).then((r) => r.data as AdminAgentWorker),
    updateAgentWorker: (id, data) =>
      api.patch(`/agent-workers/${id}`, data).then((r) => r.data as AdminAgentWorker),
    listSwarmRuns: (swarmId) =>
      api.get(`/swarms/${swarmId}/runs`).then((r) => r.data as SwarmRun[]),
    getSwarmRun: (runId) =>
      api.get(`/swarm-runs/${runId}`).then((r) => r.data as SwarmRun),
    listSwarmRunAgentRuns: (runId) =>
      api.get(`/swarm-runs/${runId}/agent-runs`).then((r) => r.data as AgentRun[]),
    adminListUsers: (query) =>
      api.get("/users", { params: query }).then((r) => r.data as AdminUserListResult),
    adminGetUser: (id) => api.get(`/users/${id}`).then((r) => r.data as AdminUser),
    adminUpdateUser: (id, data) =>
      api.patch(`/users/${id}`, data).then((r) => r.data as AdminUser),
    adminListSwarms: (query) =>
      api.get("/admin/swarms", { params: query }).then((r) => r.data as AdminSwarmListResult),
    adminGetSwarm: (id) => api.get(`/admin/swarms/${id}`).then((r) => r.data as AdminSwarm),
    adminUpdateSwarm: (id, data) =>
      api.patch(`/admin/swarms/${id}`, data).then((r) => r.data as AdminSwarm),
    adminDeleteSwarm: (id) => api.delete(`/admin/swarms/${id}`).then(() => undefined),
    adminGetSwarmGraph: (swarmId) =>
      api.get(`/admin/swarms/${swarmId}/graph`).then((r) => r.data as SwarmGraph),
    adminUpsertSwarmGraph: (swarmId, data) =>
      api.put(`/admin/swarms/${swarmId}/graph`, data).then((r) => r.data as SwarmGraph),
    adminRunSwarm: (swarmId, data) =>
      api.post(`/admin/swarms/${swarmId}/run`, data ?? {}).then((r) => r.data as RunSwarmResult),
    adminListSwarmRuns: (swarmId) =>
      api.get(`/admin/swarms/${swarmId}/runs`).then((r) => r.data as SwarmRun[]),
    adminGetSwarmRun: (runId) =>
      api.get(`/admin/swarm-runs/${runId}`).then((r) => r.data as SwarmRun),
    adminListSwarmRunAgentRuns: (runId) =>
      api.get(`/admin/swarm-runs/${runId}/agent-runs`).then((r) => r.data as AgentRun[]),
    getSwarmRunPendingApproval: (runId) =>
      api.get(`/swarm-runs/${runId}/pending-approval`).then((r) => r.data as SwarmRunApproval | null),
    decideSwarmRunApproval: (approvalId, data) =>
      api
        .post(`/swarm-run-approvals/${approvalId}/decide`, data)
        .then((r) => r.data as DecideSwarmRunApprovalResult),
    adminDecideSwarmRunApproval: (approvalId, data) =>
      api
        .post(`/admin/swarms/swarm-run-approvals/${approvalId}/decide`, data)
        .then((r) => r.data as DecideSwarmRunApprovalResult),
    adminGetAgentWorker: (id) =>
      api.get(`/admin/agent-workers/${id}`).then((r) => r.data as AdminAgentWorker),
    adminUpdateAgentWorker: (id, data) =>
      api.patch(`/admin/agent-workers/${id}`, data).then((r) => r.data as AdminAgentWorker),
    getInferenceSetup: () =>
      api.get("/inference/setup").then((r) => r.data as InferenceSetup),
    listApiTokens: () =>
      api.get("/auth/api-tokens").then((r) => r.data as UserApiToken[]),
    createApiToken: (data) =>
      api.post("/auth/api-tokens", data).then((r) => r.data as CreateUserApiTokenResult),
    revokeApiToken: (id) =>
      api.delete(`/auth/api-tokens/${id}`).then(() => undefined),
    listToolsCatalog: () =>
      api.get("/tools/catalog").then((r) => r.data as ToolsCatalog),
    listToolIntegrations: () =>
      api.get("/tools/integrations").then((r) => r.data as ToolIntegrationsResponse),
  }
}

export default createServices
