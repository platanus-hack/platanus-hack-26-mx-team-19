/** Who may approve a paused run — mirrors backend `UserApprovalAssignee`. */
export type UserApprovalAssignee = "runner" | "owner" | string

export type UserApprovalNodeData = {
  /** Inbox / canvas label (default: User approval). */
  name?: string
  /** Prompt shown to the assignee in Test Swarm and approval inbox. */
  message?: string
  /** Defaults to `runner` (user who triggered the run). */
  assignee?: UserApprovalAssignee
}

export const USER_APPROVAL_APPROVE_HANDLE = "approve"
export const USER_APPROVAL_REJECT_HANDLE = "reject"

export function buildUserApprovalNodeData(): UserApprovalNodeData {
  return {
    name: "User approval",
    message: "",
    assignee: "runner",
  }
}
