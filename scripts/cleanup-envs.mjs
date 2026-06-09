#!/usr/bin/env node
/**
 * Deletes GitHub deployments for environments outside dev/uat/prod.
 *
 * Requires a Personal Access Token (not the OAuth app secret) with `repo` scope.
 * GitHub requires a deployment to be marked inactive before it can be deleted.
 *
 * Usage:
 *   GITHUB_TOKEN=ghp_xxx node scripts/cleanup-envs.mjs --dry-run   # preview
 *   GITHUB_TOKEN=ghp_xxx node scripts/cleanup-envs.mjs             # delete
 */

const ORG = "BUCC-Ounch"
const KEEP_ENVS = new Set(["dev", "uat", "prod"])
const DRY_RUN = process.argv.includes("--dry-run")
const TOKEN = process.env.GITHUB_TOKEN

if (!TOKEN) {
  console.error("Error: GITHUB_TOKEN env var is required.")
  console.error("Generate one at https://github.com/settings/tokens with repo scope.")
  process.exit(1)
}

const BASE_HEADERS = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "Content-Type": "application/json",
}

async function ghFetch(path, options = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: BASE_HEADERS,
    ...options,
  })
  if (res.status === 204) return null
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`GitHub ${res.status} on ${path}: ${body}`)
  }
  return res.json()
}

async function getAllPages(path) {
  const results = []
  let next = `${path}${path.includes("?") ? "&" : "?"}per_page=100`
  while (next) {
    const res = await fetch(`https://api.github.com${next}`, { headers: BASE_HEADERS })
    if (!res.ok) throw new Error(`GitHub ${res.status} on ${next}`)
    results.push(...await res.json())
    const link = res.headers.get("link") ?? ""
    const match = link.match(/<https:\/\/api\.github\.com([^>]+)>;\s*rel="next"/)
    next = match ? match[1] : null
  }
  return results
}

async function deactivateAndDelete(repoFullName, deployment) {
  // GitHub requires a deployment to be inactive before deletion.
  // Posting an "inactive" status is a no-op if it already has one.
  await ghFetch(`/repos/${repoFullName}/deployments/${deployment.id}/statuses`, {
    method: "POST",
    body: JSON.stringify({ state: "inactive" }),
  })
  await ghFetch(`/repos/${repoFullName}/deployments/${deployment.id}`, {
    method: "DELETE",
  })
}

async function main() {
  if (DRY_RUN) console.log("DRY RUN — no changes will be made.\n")

  const repos = await getAllPages(`/orgs/${ORG}/repos`)
  console.log(`${ORG}: ${repos.length} repo(s) found\n`)

  let deleted = 0
  let errors = 0

  for (const repo of repos) {
    const deployments = await getAllPages(`/repos/${repo.full_name}/deployments`)
    const stale = deployments.filter(d => !KEEP_ENVS.has(d.environment))
    if (stale.length === 0) continue

    const byEnv = Object.groupBy(stale, d => d.environment)
    const summary = Object.entries(byEnv)
      .map(([env, deps]) => `${env}(${deps.length})`)
      .join(", ")
    console.log(`${repo.name}: ${stale.length} stale deployment(s) — ${summary}`)

    for (const dep of stale) {
      if (DRY_RUN) {
        console.log(`  would delete  [${dep.environment}] id=${dep.id} ref=${dep.ref}`)
        deleted++
        continue
      }

      try {
        await deactivateAndDelete(repo.full_name, dep)
        console.log(`  deleted  [${dep.environment}] id=${dep.id} ref=${dep.ref}`)
        deleted++
      } catch (err) {
        console.error(`  FAILED   [${dep.environment}] id=${dep.id}: ${err.message}`)
        errors++
      }
    }
  }

  console.log(`\n${DRY_RUN ? "Would delete" : "Deleted"}: ${deleted} deployment(s)`)
  if (errors > 0) {
    console.error(`Errors: ${errors}`)
    process.exit(1)
  }
}

main().catch(err => {
  console.error(err.message)
  process.exit(1)
})
