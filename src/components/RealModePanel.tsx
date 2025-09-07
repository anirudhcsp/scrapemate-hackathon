import { useState } from "react";
import { createProject, startCrawl, generateBrief, type ExecutiveBrief } from "../lib/realApi";

function normalizeUrl(input: string): string {
  let s = (input || "").trim();
  if (!s) return s;
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  try {
    // Will throw if invalid
    const u = new URL(s);
    return u.toString();
  } catch {
    return "";
  }
}

async function safeCall<T>(label: string, fn: () => Promise<T>, log: (m: string) => void): Promise<T> {
  try {
    const res = await fn();
    return res;
  } catch (e: any) {
    console.error(`[${label}] error:`, e);
    log(`${label} failed — see console for details`);
    throw e;
  }
}

export default function RealModePanel() {
  const [seedUrl, setSeedUrl] = useState("https://linear.app");
  const [status, setStatus]   = useState<string>("");
  const [busy, setBusy]       = useState(false);
  const [brief, setBrief]     = useState<ExecutiveBrief | null>(null);
  const [logs, setLogs]       = useState<string[]>([]);

  function log(msg: string) {
    setLogs(l => [...l, msg]);
    setStatus(msg);
  }

  async function run(realUrl?: string) {
    const input = realUrl ?? seedUrl;
    const url = normalizeUrl(input);
    if (!url) {
      setStatus("Please enter a valid URL (e.g., https://company.com)");
      return;
    }

    try {
      setBusy(true);
      setBrief(null);
      setLogs([]);

      // derive a friendly company name from host
      const host = new URL(url).hostname.replace(/^www\./, "");
      const company = host.split(".")[0].replace(/[-_]/g, " ");

      log("Creating project…");
      const projectId = await safeCall("create-project", () => createProject(url, company), log);

      log("Crawling site (up to 8 pages)…");
      await safeCall("start_crawl", () =>
        startCrawl({
          projectId,
          seedUrl: url,
          limit: 8,
          mode: "shortlist",
          paths: ["/", "/pricing", "/security", "/customers", "/about", "/legal", "/docs"]
        }),
        log
      );

      log("Generating executive brief…");
      const b = await safeCall("generate-brief", () =>
        generateBrief({
          projectId,
          company: company.charAt(0).toUpperCase() + company.slice(1),
          seedUrl: url,
          cap: 8,
          maxTokens: 350,
          model: "gpt-4o-mini"
        }),
        log
      );

      setBrief(b);
      log("Done ✅");
    } catch {
      // error already logged & surfaced
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 space-y-4 rounded-2xl border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="w-[520px] max-w-full px-3 py-2 border rounded-lg"
          placeholder="https://company.com"
          value={seedUrl}
          onChange={(e) => setSeedUrl(e.target.value)}
        />
        <button
          className="px-3 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60"
          onClick={() => run()}
          disabled={busy || !seedUrl}
        >
          {busy ? "Running…" : "Run Real Mode"}
        </button>
        <button
          className="px-3 py-2 rounded-lg border disabled:opacity-60"
          onClick={() => run("https://example.com")}
          disabled={busy}
          title="Quick sanity check with a simple site we know works"
        >
          Test Example.com
        </button>
        <span className="text-sm text-gray-600">{status}</span>
      </div>

      {!!logs.length && (
        <div className="text-xs text-gray-500">
          {logs.map((l, i) => <div key={i}>• {l}</div>)}
        </div>
      )}

      {brief && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{brief.company} — Executive Brief</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {brief.sections.map((s, i) => (
              <div key={i} className="rounded-xl border p-4">
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {s.bullets.map((b, j) => <li key={j}>{b.text}</li>)}
                </ul>
              </div>
            ))}
          </div>

          <div className="rounded-xl border p-4">
            <h3 className="font-semibold mb-2">References</h3>
            <ol className="list-decimal pl-5 space-y-1">
              {brief.citations.map((c, k) => (
                <li key={k}>
                  <a className="text-blue-600 underline" href={c.url} target="_blank" rel="noreferrer">
                    {c.url}
                  </a>
                  <div className="text-sm text-gray-600">{c.quote}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
