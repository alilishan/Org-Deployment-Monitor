type Tag = { name: string; commit: { sha: string } }

export function resolveVersion(ref: string | null, tags: Tag[]): string | null {
  if (!ref) return null

  // Exact tag name match
  if (tags.some(t => t.name === ref)) return ref

  // SHA prefix match
  const matched = tags.find(
    t => t.commit.sha.startsWith(ref) || ref.startsWith(t.commit.sha)
  )
  if (matched) return matched.name

  // Fallback: 7-char short SHA
  return ref.slice(0, 7)
}
