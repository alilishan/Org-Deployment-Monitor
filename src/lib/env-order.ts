const KNOWN_ORDER = ["dev", "uat", "prod"]

export function sortEnvironments(envs: string[]): string[] {
  const unique = [...new Set(envs)]
  const known = KNOWN_ORDER.filter(e => unique.includes(e))
  const unknown = unique.filter(e => !KNOWN_ORDER.includes(e)).sort()
  return [...known, ...unknown]
}
