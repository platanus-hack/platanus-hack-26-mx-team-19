export type UserApiToken = {
  id: string
  name: string
  prefix: string
  lastUsedAt: string | null
  createdAt: string
}

export type CreateUserApiTokenPayload = {
  name?: string
}

export type CreateUserApiTokenResult = UserApiToken & {
  token: string
}
