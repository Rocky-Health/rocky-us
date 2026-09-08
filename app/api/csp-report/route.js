import { logger } from "@/utils/devLogger";

// TK-792: collector for CSP violation reports. The Report-Only policy in
// next.config.mjs points report-uri and report-to here; before this route
// existed the reports went nowhere, making the Report-Only CSP a no-op.
// Logs a compact summary to the server console (Vercel logs) and returns 204.

export async function POST(req) {
  try {
    // Browsers send application/csp-report (report-uri) or
    // application/reports+json (report-to); both are JSON bodies.
    const body = await req.json().catch(() => null);

    // report-uri wraps a single violation in { "csp-report": {...} };
    // report-to sends an array of { type, body } report objects.
    const reports = Array.isArray(body) ? body : [body];
    for (const report of reports.slice(0, 10)) {
      const v = report?.["csp-report"] || report?.body || report || {};
      logger.warn("[csp-report]", {
        directive: v["violated-directive"] || v.effectiveDirective || "",
        blocked: (v["blocked-uri"] || v.blockedURL || "").slice(0, 200),
        document: (v["document-uri"] || v.documentURL || "").slice(0, 200),
        source: (v["source-file"] || v.sourceFile || "").slice(0, 200),
      });
    }
  } catch (error) {
    logger.warn("[csp-report] unparseable report:", error?.message);
  }

  return new Response(null, { status: 204 });
}
