import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logger } from "@/utils/devLogger";
import https from "https";
import axios from "axios";
import { mapCrmResponseToFormData } from "@/lib/questionnairePrefillConfig";

// Server read-back for the main WL questionnaire. Reads the CRM Gravity entry
// for the current session (keyed by the wl_id/wl_token cookies set by /api/wl)
// and returns the saved answers mapped to the questionnaire's formData shape so
// the client can resume without keeping PHI in localStorage.
const crmApi = axios.create({
  baseURL: "https://crm.myrocky.com/api",
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  timeout: 30000,
  headers: { "Content-Type": "application/json; charset=utf-8" },
});

// LOCALHOST-ONLY fallback. The CRM get-entry endpoint is unreliable for partial
// entries (it 500s), which is why /api/wl's POST also wraps the same call in a
// try/catch and falls back to this file. tmp/form-cache-<id>.json is written by
// that POST and only persists across requests on a single long-lived process
// (localhost). On Vercel serverless it is ephemeral and per-instance, so this
// does NOT provide resume in Preview/Production — that needs a reliable CRM
// read-by-id+token endpoint from the backend.
async function readDiskCache(id) {
  try {
    const fs = require("fs").promises;
    const path = require("path");
    const cacheFile = path.join(process.cwd(), "tmp", `form-cache-${id}.json`);
    const cached = await fs.readFile(cacheFile, "utf8");
    return JSON.parse(cached);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const now = Date.now();

    const id = cookieStore.get("wl_id")?.value;
    const token = cookieStore.get("wl_token")?.value;
    const idExpires = cookieStore.get("wl_id_expires")?.value;
    const tokenExpires = cookieStore.get("wl_token_expires")?.value;
    const entrykey = cookieStore.get("wl_entrykey")?.value || "";

    const valid =
      id &&
      token &&
      idExpires &&
      tokenExpires &&
      now < parseInt(idExpires) &&
      now < parseInt(tokenExpires);

    if (!valid) {
      return NextResponse.json({ resumable: false });
    }

    // Primary: CRM read-back. Falls back to the local disk cache when the CRM
    // endpoint fails (see note on readDiskCache) so localhost resume works.
    let raw = null;
    let source = null;
    try {
      const res = await crmApi.get(`/get-wp-gravity-forms-entry-data/${id}`, {
        params: { token, form_id: 6 },
      });
      if (res.data?.success && res.data?.data) {
        raw = res.data.data;
        source = "crm";
      }
    } catch (crmError) {
      logger.warn(
        "WL resume: CRM read failed, trying disk cache:",
        crmError.message
      );
    }

    if (!raw) {
      raw = await readDiskCache(id);
      if (raw) source = "disk-cache";
    }

    if (!raw) {
      return NextResponse.json({ resumable: false });
    }

    // dot -> underscore mapping + identity stripped (contact comes from props/cookies).
    const formData = mapCrmResponseToFormData(raw);
    const pageStep = Number(raw.page_step ?? raw["page_step"]) || 1;
    const completionState =
      raw.completion_state ?? raw["completion_state"] ?? "Partial";
    const completionPercentage =
      Number(raw.completion_percentage ?? raw["completion.percentage"]) || 0;

    return NextResponse.json({
      resumable: Object.keys(formData).length > 0 || pageStep > 1,
      source,
      formData,
      id,
      token,
      entrykey,
      page_step: pageStep,
      completion_state: completionState,
      completion_percentage: completionPercentage,
    });
  } catch (error) {
    logger.warn("WL resume fetch error:", error.message);
    // Never fall back to client storage; a failed resume just starts fresh.
    return NextResponse.json({ resumable: false });
  }
}
