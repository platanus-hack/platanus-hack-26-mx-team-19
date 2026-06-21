/** Minimal className helper (shadcn-style) without extra dependencies. */
export function cn(...inputs: (string | false | null | undefined)[]): string {
  return inputs.filter(Boolean).join(" ")
}
