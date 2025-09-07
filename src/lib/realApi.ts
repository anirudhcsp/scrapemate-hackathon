// src/lib/realApi.ts
export type Bullet = { text: string };
export type Section = { title: string; bullets: Bullet[] };
export type Citation = { n: number; url: string; quote: string };
export type ExecutiveBrief = { company: string; sections: Section[]; citations: Citation[] };

// Function endpoints (already set in your env)
const CREATE_URL  = import.meta.env.VITE_CREATE_PROJECT_URL!;
const START_URL   = import.meta.env.VITE_START_CRAWL_URL!;
const BRIEF_URL   = import.meta.env.VITE_GENERATE_BRIEF_URL!;

// Supabase anon key (added in Step 1)
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

function headers() {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  // If the function requires JWT, include it. If not, this is harmless.
  if (ANON) {
    h["Authorization"] = `Bearer ${ANON}`;
    h["apikey"] = ANON; // common pattern used by Supabase clients
  }
  return h;
}

function assert(ok: boolean, msg: string, extra?: any): asserts ok {
  if (!ok) {
    const err = new Error(msg);
    (err as any).extra = extra;
    throw err;
  }
}

async function postJSON(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: headers(), body: JSON.stringify(body) });
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { ok: res.ok, status: res.status, json, text };
}

export async function createProject(seedUrl: string, name?: string): Promise<string> {
  const r = await postJSON(CREATE_URL, { seed_url: seedUrl, name });
  assert(r.ok && r.json?.ok, r.json?.msg || `create-project failed (status ${r.status})`, r);
  return r.json.project_id as string;
}

export async function startCrawl(opts: {
  projectId: string; seedUrl: string; limit?: number; mode?: "shortlist" | "wide"; paths?: string[];
}) {
  const { projectId, seedUrl, limit = 8, mode = "shortlist", paths } = opts;
  const r = await postJSON(START_URL, { project_id: projectId, seed_url: seedUrl, limit, mode, ...(paths ? { paths } : {}) });
  assert(r.ok && r.json?.ok, r.json?.msg || `start_crawl failed (status ${r.status})`, r);
  return r.json;
}

export async function generateBrief(opts: {
  projectId: string; company: string; seedUrl: string;
  cap?: number; maxTokens?: number; model?: string;
}): Promise<ExecutiveBrief> {
  const { projectId, company, seedUrl, cap = 8, maxTokens = 350, model = "gpt-4o-mini" } = opts;
  const r = await postJSON(BRIEF_URL, {
    project_id: projectId,
    company,
    seed_url: seedUrl,
    cap,
    max_tokens: maxTokens,
    model
  });
  assert(r.ok && r.json?.ok, r.json?.msg || `generate-brief failed (status ${r.status})`, r);
  return r.json.brief as ExecutiveBrief;
}
