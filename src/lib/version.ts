type Tag = { name: string; commit: { sha: string } }

// Matches the 7-char short-SHA fallback produced by resolveVersion
export function isShaVersion(version: string | null): boolean {
  return version != null && /^[0-9a-f]{7}$/i.test(version)
}

export function resolveVersion(ref: string | null, sha: string | null, tags: Tag[]): string | null {
  if (!ref && !sha) return null

  // Exact tag name match
  if (ref && tags.some(t => t.name === ref)) return ref

  // Deployment SHA match — covers branch refs (e.g. "main") deployed at a tagged commit
  if (sha) {
    const matched = tags.find(t => t.commit.sha === sha)
    if (matched) return matched.name
  }

  // Ref-as-SHA prefix match
  if (ref) {
    const matched = tags.find(
      t => t.commit.sha.startsWith(ref) || ref.startsWith(t.commit.sha)
    )
    if (matched) return matched.name
  }

  // Fallback: 7-char short SHA, preferring the deployment sha over branch-name refs
  return (sha ?? ref!).slice(0, 7)
}
