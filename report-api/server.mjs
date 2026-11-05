import http from "node:http";
import { randomBytes } from "node:crypto";
import { pathToFileURL } from "node:url";

const DEFAULT_ALLOWED_ORIGIN = "https://orbita-site.onrender.com";
const DEFAULT_FROM = "ORBITA Reports <onboarding@resend.dev>";
const RESEND_ENDPOINT = "https://api.resend.com/emails";
const MAX_BODY_BYTES = 16 * 1024;
const DEFAULT_RATE_WINDOW_MS = 60 * 60 * 1000;
const DEFAULT_RATE_LIMIT = 5;

const LIMITS = Object.freeze({
  summary: 120,
  page: 256,
  expected: 1200,
  actual: 1200,
  steps: 2400,
  record: 180,
  field: 140,
  currentValue: 1600,
  suggestedValue: 1600,
  sourceUrl: 800,
  notes: 2400,
  contactEmail: 254
});

function cleanText(value, maxLength, minLength = 0) {
  if (typeof value !== "string") return null;
  const cleaned = value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
  if (cleaned.length < minLength || cleaned.length > maxLength) return null;
  return cleaned;
}

function validEmail(value) {
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(value);
}

function validHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function normalizeReport(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;

  const type = payload.type === "bug" || payload.type === "data" ? payload.type : null;
  const summary = cleanText(payload.summary, LIMITS.summary, 4);
  const page = cleanText(payload.page, LIMITS.page, 1);
  const notes = payload.notes == null || payload.notes === ""
    ? ""
    : cleanText(payload.notes, LIMITS.notes, 0);
  const contactEmail = payload.contactEmail == null || payload.contactEmail === ""
    ? ""
    : cleanText(payload.contactEmail, LIMITS.contactEmail, 3);
  const lang = ["fa", "en", "ar"].includes(payload.lang) ? payload.lang : "en";

  if (!type || !summary || !page || !page.startsWith("/") || /[?#]/.test(page)) return null;
  if (notes === null || contactEmail === null || (contactEmail && !validEmail(contactEmail))) return null;

  const base = { type, summary, page, notes, contactEmail, lang };
  if (type === "bug") {
    const expected = cleanText(payload.expected, LIMITS.expected, 3);
    const actual = cleanText(payload.actual, LIMITS.actual, 3);
    const steps = cleanText(payload.steps, LIMITS.steps, 3);
    if (!expected || !actual || !steps) return null;
    return { ...base, expected, actual, steps };
  }

  const record = cleanText(payload.record, LIMITS.record, 1);
  const field = cleanText(payload.field, LIMITS.field, 1);
  const currentValue = cleanText(payload.currentValue, LIMITS.currentValue, 1);
  const suggestedValue = cleanText(payload.suggestedValue, LIMITS.suggestedValue, 1);
  const sourceUrl = cleanText(payload.sourceUrl, LIMITS.sourceUrl, 8);
  if (!record || !field || !currentValue || !suggestedValue || !sourceUrl || !validHttpUrl(sourceUrl)) return null;
  return { ...base, record, field, currentValue, suggestedValue, sourceUrl };
}

function emailLabels(lang) {
  if (lang === "fa") return {
    bug: "گزارش ایراد فنی",
    data: "گزارش علمی/داده‌ای",
    id: "شناسهٔ پیگیری",
    manual: "نیازمند بررسی انسانی است؛ هیچ داده‌ای به‌صورت خودکار تغییر نکرده است.",
    summary: "خلاصه",
    page: "مسیر صفحه",
    expected: "رفتار مورد انتظار",
    actual: "رفتار مشاهده‌شده",
    steps: "گام‌های بازتولید",
    record: "رکورد/موجودیت",
    field: "فیلد مورد اختلاف",
    current: "مقدار فعلی",
    suggested: "مقدار پیشنهادی",
    source: "منبع",
    notes: "توضیحات بیشتر",
    contact: "نشانی تماس"
  };
  if (lang === "ar") return {
    bug: "بلاغ عن خلل تقني",
    data: "بلاغ علمي/بيانات",
    id: "رقم المتابعة",
    manual: "يتطلب مراجعة بشرية؛ لم تُغيّر أي بيانات تلقائياً.",
    summary: "الملخص",
    page: "مسار الصفحة",
    expected: "السلوك المتوقع",
    actual: "السلوك الملحوظ",
    steps: "خطوات إعادة المشكلة",
    record: "السجل/العنصر",
    field: "الحقل محل الاختلاف",
    current: "القيمة الحالية",
    suggested: "القيمة المقترحة",
    source: "المصدر",
    notes: "ملاحظات إضافية",
    contact: "وسيلة التواصل"
  };
  return {
    bug: "Technical bug report",
    data: "Scientific/data report",
    id: "Reference ID",
    manual: "Requires human review; no site data was changed automatically.",
    summary: "Summary",
    page: "Page path",
    expected: "Expected behavior",
    actual: "Observed behavior",
    steps: "Steps to reproduce",
    record: "Record/entity",
    field: "Disputed field",
    current: "Current value",
    suggested: "Suggested value",
    source: "Source",
    notes: "Additional notes",
    contact: "Contact email"
  };
}

function makeEmailText(report, id) {
  const labels = emailLabels(report.lang);
  const rows = [
    `ORBITA — ${report.type === "bug" ? labels.bug : labels.data}`,
    `${labels.id}: ${id}`,
    labels.manual,
    "",
    `${labels.summary}: ${report.summary}`,
    `${labels.page}: ${report.page}`
  ];
  if (report.type === "bug") {
    rows.push(
      "",
      `${labels.expected}:`, report.expected,
      "",
      `${labels.actual}:`, report.actual,
      "",
      `${labels.steps}:`, report.steps
    );
  } else {
    rows.push(
      "",
      `${labels.record}: ${report.record}`,
      `${labels.field}: ${report.field}`,
      `${labels.current}:`, report.currentValue,
      "",
      `${labels.suggested}:`, report.suggestedValue,
      "",
      `${labels.source}: ${report.sourceUrl}`
    );
  }
  if (report.notes) rows.push("", `${labels.notes}:`, report.notes);
  if (report.contactEmail) rows.push("", `${labels.contact}: ${report.contactEmail}`);
  return rows.join("\n");
}

function json(res, status, payload) {
  if (res.writableEnded) return;
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer"
  });
  res.end(body);
}

function requestIp(req) {
  const cloudflareIp = req.headers["cf-connecting-ip"];
  if (typeof cloudflareIp === "string" && cloudflareIp.length < 80) return cloudflareIp;
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    const first = forwarded.split(",")[0].trim();
    if (first && first.length < 80) return first;
  }
  return req.socket.remoteAddress || "unknown";
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let tooLarge = false;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        tooLarge = true;
        chunks.length = 0;
        return;
      }
      if (!tooLarge) chunks.push(chunk);
    });
    req.on("end", () => {
      if (tooLarge) {
        const error = new Error("body_too_large");
        error.statusCode = 413;
        reject(error);
        return;
      }
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    req.on("error", reject);
  });
}

export function createReportServer({
  env = process.env,
  fetchImpl = globalThis.fetch,
  now = Date.now,
  generateId = () => `ORB-${randomBytes(5).toString("hex").toUpperCase()}`,
  rateLimit = DEFAULT_RATE_LIMIT,
  rateWindowMs = DEFAULT_RATE_WINDOW_MS
} = {}) {
  const allowedOrigin = env.REPORT_ALLOWED_ORIGIN || DEFAULT_ALLOWED_ORIGIN;
  const from = env.REPORT_FROM || DEFAULT_FROM;
  const buckets = new Map();

  return http.createServer(async (req, res) => {
    const requestUrl = new URL(req.url || "/", "http://report-api.local");
    const path = requestUrl.pathname;
    const origin = req.headers.origin;
    const isAllowedOrigin = origin === allowedOrigin;

    if (isAllowedOrigin) {
      res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
      res.setHeader("Vary", "Origin");
    }

    if (req.method === "GET" && path === "/api/health") {
      return json(res, 200, { ok: true });
    }

    if (req.method === "OPTIONS" && path === "/api/report") {
      if (!isAllowedOrigin) return json(res, 403, { ok: false, error: "origin_not_allowed" });
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Access-Control-Max-Age", "600");
      res.writeHead(204, { "Cache-Control": "no-store", "Vary": "Origin" });
      return res.end();
    }

    if (path !== "/api/report") return json(res, 404, { ok: false, error: "not_found" });
    if (req.method !== "POST") return json(res, 405, { ok: false, error: "method_not_allowed" });
    if (!isAllowedOrigin) return json(res, 403, { ok: false, error: "origin_not_allowed" });
    if (!String(req.headers["content-type"] || "").toLowerCase().startsWith("application/json")) {
      return json(res, 415, { ok: false, error: "content_type_required" });
    }
    const contentLength = Number(req.headers["content-length"] || 0);
    if (contentLength > MAX_BODY_BYTES) return json(res, 413, { ok: false, error: "body_too_large" });

    let raw;
    try {
      raw = await readBody(req);
    } catch (error) {
      if (error.statusCode === 413) return json(res, 413, { ok: false, error: "body_too_large" });
      return json(res, 400, { ok: false, error: "invalid_request" });
    }

    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return json(res, 400, { ok: false, error: "invalid_json" });
    }

    // Quietly discard bot submissions caught by the off-screen honeypot.
    if (typeof payload?.website === "string" && payload.website.trim()) {
      return json(res, 202, { ok: true, id: generateId() });
    }

    const currentTime = now();
    for (const [key, bucket] of buckets) {
      if (currentTime - bucket.start >= rateWindowMs) buckets.delete(key);
    }
    const ip = requestIp(req);
    let bucket = buckets.get(ip);
    if (!bucket || currentTime - bucket.start >= rateWindowMs) {
      bucket = { start: currentTime, count: 0 };
      buckets.set(ip, bucket);
    }
    if (bucket.count >= rateLimit) return json(res, 429, { ok: false, error: "rate_limited" });
    bucket.count += 1;
    if (buckets.size > 10000) buckets.delete(buckets.keys().next().value);

    const report = normalizeReport(payload);
    if (!report) return json(res, 400, { ok: false, error: "invalid_report" });

    if (!env.RESEND_API_KEY || !env.REPORT_TO || typeof fetchImpl !== "function") {
      return json(res, 503, { ok: false, error: "not_configured" });
    }

    const id = generateId();
    const email = {
      from,
      to: [env.REPORT_TO],
      subject: `[ORBITA] ${report.type === "bug" ? "Bug" : "Data"} report ${id}`,
      text: makeEmailText(report, id)
    };

    let providerResponse;
    try {
      providerResponse = await fetchImpl(RESEND_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(email),
        signal: typeof globalThis.AbortSignal?.timeout === "function" ? globalThis.AbortSignal.timeout(12000) : undefined
      });
    } catch {
      console.warn("[report-api] email provider request failed");
      return json(res, 502, { ok: false, error: "delivery_failed" });
    }

    if (!providerResponse || !providerResponse.ok) {
      console.warn("[report-api] email provider rejected a report", providerResponse?.status || "no response");
      return json(res, 502, { ok: false, error: "delivery_failed" });
    }

    console.info("[report-api] report accepted", id);
    return json(res, 202, { ok: true, id });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createReportServer();
  const port = Number(process.env.PORT || 10000);
  server.requestTimeout = 20000;
  server.headersTimeout = 10000;
  server.listen(port, "0.0.0.0", () => {
    console.info(`[report-api] listening on 0.0.0.0:${port}`);
  });
}
