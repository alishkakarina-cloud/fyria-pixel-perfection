/**
 * Единственное место, которое умеет ЧИТАТЬ и ЗАПИСЫВАТЬ src/data/catalog.json.
 *
 * На Vercel файловая система serverless-функции только для чтения и живёт
 * ровно один запрос — писать туда бессмысленно, изменения пропадут. Поэтому
 * запись идёт через GitHub Contents API: админка коммитит новый catalog.json
 * прямо в репозиторий, а автодеплой Vercel (уже настроенный и проверенный)
 * подхватывает push и публикует свежую сборку сам, без участия человека.
 *
 * В локальной разработке `npm run dev` GitHub-токен обычно не настроен —
 * тогда пишем прямо в файл на диске, чтобы можно было проверить всю админку
 * от начала до конца без коммитов в реальный репозиторий.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Category, Product } from "@/lib/products";

export type Catalog = { categories: Category[]; products: Product[] };

const REPO_OWNER = process.env["ADMIN_GITHUB_OWNER"] || "workspace-Adilet-Alish";
const REPO_NAME = process.env["ADMIN_GITHUB_REPO"] || "fyria-pixel-perfection";
const REPO_BRANCH = process.env["ADMIN_GITHUB_BRANCH"] || "main";
const CATALOG_PATH = "src/data/catalog.json";
const GITHUB_TOKEN = process.env["ADMIN_GITHUB_TOKEN"];

const LOCAL_CATALOG_FILE = fileURLToPath(new URL("../../data/catalog.json", import.meta.url));

function isLocalDev() {
  // Vite/TanStack Start expose this in server code too; true only under `npm run dev`.
  return process.env["NODE_ENV"] !== "production";
}

type LoadResult = { catalog: Catalog; sha: string | null };

async function githubApi(pathname: string, init?: RequestInit) {
  const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `GitHub API ${init?.method || "GET"} ${pathname} -> ${res.status}: ${body.slice(0, 300)}`,
    );
  }
  return res.json();
}

/** Читает текущий каталог и (для GitHub-режима) его sha, нужный для следующей записи. */
export async function loadCatalog(): Promise<LoadResult> {
  if (!GITHUB_TOKEN) {
    if (!isLocalDev()) {
      throw new Error(
        "Админка не настроена: на сервере нет переменной ADMIN_GITHUB_TOKEN. " +
          "Без неё изменения из /admin не попадут в GitHub и не задеплоятся.",
      );
    }
    const raw = readFileSync(LOCAL_CATALOG_FILE, "utf8");
    return { catalog: JSON.parse(raw) as Catalog, sha: null };
  }
  const file = (await githubApi(`/contents/${CATALOG_PATH}?ref=${REPO_BRANCH}`)) as {
    content: string;
    sha: string;
  };
  const raw = Buffer.from(file.content, "base64").toString("utf8");
  return { catalog: JSON.parse(raw) as Catalog, sha: file.sha };
}

/**
 * Записывает каталог целиком: либо на диск (dev), либо одним коммитом в
 * GitHub (prod). `sha` — значение, полученное из последнего loadCatalog();
 * GitHub отклонит запись с 409, если файл успели изменить параллельно —
 * тогда просто перечитайте каталог и повторите правку.
 */
export async function saveCatalog(catalog: Catalog, sha: string | null, message: string) {
  const json = JSON.stringify(catalog, null, 2) + "\n";
  if (!GITHUB_TOKEN) {
    writeFileSync(LOCAL_CATALOG_FILE, json, "utf8");
    return { commitSha: null as string | null };
  }
  const body = {
    message: `admin: ${message}`,
    content: Buffer.from(json, "utf8").toString("base64"),
    branch: REPO_BRANCH,
    ...(sha ? { sha } : {}),
  };
  const result = (await githubApi(`/contents/${CATALOG_PATH}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })) as { commit: { sha: string } };
  return { commitSha: result.commit.sha };
}

/** Коммитит одно изображение (base64, уже без data:-префикса) по заданному публичному пути. */
export async function saveImage(publicPath: string, base64: string, message: string) {
  const repoPath = `public${publicPath}`;
  if (!GITHUB_TOKEN) {
    const dest = fileURLToPath(new URL(`../../../public${publicPath}`, import.meta.url));
    writeFileSync(dest, Buffer.from(base64, "base64"));
    return;
  }
  // Contents API needs the current sha only when overwriting an existing file.
  let sha: string | undefined;
  try {
    const existing = (await githubApi(`/contents/${repoPath}?ref=${REPO_BRANCH}`)) as {
      sha: string;
    };
    sha = existing.sha;
  } catch {
    // файла ещё нет — создаём новый, sha не нужен
  }
  await githubApi(`/contents/${repoPath}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `admin: ${message}`,
      content: base64,
      branch: REPO_BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
}

/** Статус последнего деплоя для конкретного коммита — чтобы админка показала "опубликовано". */
export async function getDeploymentStatus(commitSha: string): Promise<string | null> {
  if (!GITHUB_TOKEN) return "local";
  try {
    const deployments = (await githubApi(`/deployments?sha=${commitSha}&per_page=5`)) as {
      id: number;
    }[];
    const deployment = deployments[0];
    if (!deployment) return null;
    const statuses = (await githubApi(`/deployments/${deployment.id}/statuses`)) as {
      state: string;
    }[];
    return statuses[0]?.state ?? null;
  } catch {
    return null;
  }
}
