/**
 * Site-wide configuration for the Curator's Index.
 *
 * Each note declares which GitHub repo its source notes live in (`repo`, e.g.
 * "kiquetal/domain-modeling-made-functional") and, optionally, the exact file
 * within that repo (`sourcePath`, e.g. "notes/bounded-context.md"). This turns
 * the "View Source" links into working links to your actual study repos.
 */
export const site = {
  githubUser: "kiquetal",
  defaultBranch: "main",
};

/** Full repo home URL from an "owner/name" slug. */
export function repoUrl(repo: string): string {
  // Accept either "owner/name" or a bare "name" (assumes default user).
  const slug = repo.includes("/") ? repo : `${site.githubUser}/${repo}`;
  return `https://github.com/${slug}`;
}

/**
 * A working link to a note's source file inside its repo.
 * Falls back to the repo home if no path is given.
 */
export function sourceUrl(
  repo: string,
  sourcePath?: string,
  branch = site.defaultBranch,
): string {
  const home = repoUrl(repo);
  if (!sourcePath) return home;
  const clean = sourcePath.replace(/^\/+/, "");
  return `${home}/blob/${branch}/${clean}`;
}
