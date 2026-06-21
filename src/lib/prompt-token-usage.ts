/** Whether a mustache token (e.g. `{{runInput.message}}`) appears in prompt text. */
export function isPromptTokenUsed(text: string, token: string): boolean {
  if (!token || !text) return false
  return text.includes(token)
}

/** Tokens from `candidates` that appear in `text`. */
export function collectUsedPromptTokens(text: string, candidates: string[]): Set<string> {
  const used = new Set<string>()
  if (!text) return used
  for (const token of candidates) {
    if (isPromptTokenUsed(text, token)) used.add(token)
  }
  return used
}
