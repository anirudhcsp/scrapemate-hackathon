// src/lib/realApi.ts
export type Bullet = { text: string };
export type Section = { title: string; bullets: Bullet[] };
export type Citation = { n: number; url: string; quote: string };
export type ExecutiveBrief = { company: string; sections: Section[]; citations: Citation[] };

const CREATE_URL  = import.meta.env.VITE_CREATE_PROJECT_URL!;
const START_URL   = import.meta.env.VITE_START_CRAWL_URL!;
const BRIEF_URL   = import.meta.env.VITE_GENERATE_BRIEF_URL!;

function assert(ok: boolean, msg: string): asserts ok {
  if (!ok) throw new Error(msg);
}

export async function createProject(seedUrl: string, name?: string): Promise<string> {
  const r = await fetch(CREATE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ seed_url: seedUrl, name })
  });
  const j = await r.json();
  assert(r.ok && j.ok, j.msg || "create-project failed");
  return j.project_id as string;
}

export async function startCrawl(opts: {
  projectId: string; seedUrl: string; limit?: number; mode?: "shortlist" | "wide"; paths?: string[];
}) {
  const { projectId, seedUrl, limit = 8, mode = "shortlist", paths } = opts;
  const r = await fetch(START_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project_id: projectId, seed_url: seedUrl, limit, mode, ...(paths ? { paths } : {}) })
  });
  const text = await r.text();
  let data: any = {};
  try { data = JSON.parse(text); } catch { /* leave raw for error msg */ }
  assert((r as any).ok && data.ok, data.msg || `start_crawl failed: ${text}`);
  return data;
}

export async function generateBrief(opts: {
  projectId: string; company: string; seedUrl: string;
  cap?: number; maxTokens?: number; model?: string;
}): Promise<ExecutiveBrief> {
  const { projectId, company, seedUrl, cap = 8, maxTokens = 350, model = "gpt-4o-mini" } = opts;
  const r = await fetch(BRIEF_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project_id: projectId,
      company,
      seed_url: seedUrl,
      cap,
      max_tokens: maxTokens,
      model
    })
  });
  const j = await r.json();
  assert(r.ok && j.ok, j.msg || "generate-brief failed");
  return j.brief as ExecutiveBrief;
}
