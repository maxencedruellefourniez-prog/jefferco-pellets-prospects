import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ProspectsData } from "./types";

const DATA_FILE = "data/prospects.json";

const API = "https://api.github.com";

type GitHubConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  basePath: string;
};

function githubConfig(): GitHubConfig | null {
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY ?? "Druelle2U0I/Fjhj";
  if (!token) return null;
  const [owner, repo] = repository.split("/");
  if (!owner || !repo) return null;
  return {
    token,
    owner,
    repo,
    branch: process.env.GITHUB_BRANCH ?? "main",
    basePath: process.env.GITHUB_BASE_PATH ?? "",
  };
}

async function githubRequest(
  config: GitHubConfig,
  endpoint: string,
  init?: RequestInit,
) {
  return fetch(`${API}/repos/${config.owner}/${config.repo}${endpoint}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...init?.headers,
    },
    cache: "no-store",
  });
}

function repoPath(config: GitHubConfig) {
  return config.basePath
    ? `${config.basePath}/${DATA_FILE}`
    : DATA_FILE;
}

async function currentSha(config: GitHubConfig) {
  const filePath = repoPath(config);
  const res = await githubRequest(
    config,
    `/contents/${encodeURIComponent(filePath).replace(/%2F/g, "/")}?ref=${config.branch}`,
  );
  if (res.status === 404) return undefined;
  if (!res.ok) {
    throw new Error(`Lecture de ${filePath} impossible (${res.status})`);
  }
  const body = (await res.json()) as { sha?: string };
  return body.sha;
}

export async function readProspects(): Promise<ProspectsData> {
  const raw = await readFile(
    path.join(process.cwd(), DATA_FILE),
    "utf8",
  );
  return JSON.parse(raw) as ProspectsData;
}

/**
 * En production le contenu vit dans le dépôt : chaque enregistrement est un
 * commit. En développement local il n'y a pas de jeton, on écrit donc
 * directement le fichier.
 */
export async function writeProspects(data: ProspectsData, message: string) {
  const content = Buffer.from(JSON.stringify(data, null, 2) + "\n", "utf8");

  if (process.env.NODE_ENV !== "production") {
    await writeFile(path.join(process.cwd(), DATA_FILE), content);
    return { mode: "local" as const };
  }

  const config = githubConfig();
  if (!config) {
    throw new Error(
      "GITHUB_TOKEN absent : impossible d'enregistrer les modifications.",
    );
  }

  const sha = await currentSha(config);
  const filePath = repoPath(config);
  const res = await githubRequest(
    config,
    `/contents/${encodeURIComponent(filePath).replace(/%2F/g, "/")}`,
    {
      method: "PUT",
      body: JSON.stringify({
        message,
        content: content.toString("base64"),
        branch: config.branch,
        sha,
      }),
    },
  );

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(
      `GitHub a refusé l'enregistrement (${res.status}) ${detail.slice(0, 200)}`,
    );
  }

  return { mode: "github" as const };
}
