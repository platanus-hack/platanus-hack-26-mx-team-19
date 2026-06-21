export type AdminUserRole = "user" | "admin"
export type AdminAccountTier = "free" | "paid"

export type AdminUser = {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  role: AdminUserRole
  isActive: boolean
  isEmailVerified: boolean
  authProvider: string
  avatar?: string
  googleId?: string
  createdAt?: string
  updatedAt?: string
  lastLogin?: string
  accountTier: AdminAccountTier
  canCreateSwarms: boolean
}

export type AdminUserListResult = {
  items: AdminUser[]
  total: number
  page: number
  limit: number
}

export type AdminListUsersQuery = {
  page?: number
  limit?: number
  search?: string
}

export type AdminUpdateUserPayload = {
  role?: AdminUserRole
  isActive?: boolean
  firstName?: string
  lastName?: string
  isEmailVerified?: boolean
  accountTier?: AdminAccountTier
  canCreateSwarms?: boolean
}
