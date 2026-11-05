import test from "node:test";
import assert from "node:assert/strict";
import { createReportServer } from "./server.mjs";

const origin = "https://orbita-site.onrender.com";
const validBug = {
  type: "bug",
  summary: "The map filter does not respond",
  page: "/",
  expected: "The selected category should be hidden from the map.",
  actual: "The category remains visible after clicking the filter.",
  steps: "Open the map, click the category control, and observe the markers.",
  notes: "Happens on the map view.",
  contactEmail: "reader@example.com",
  lang: "en",
  website: ""
};

async function withServer(options, run) {
  const server = createReportServer(options);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

function postOptions(body, extraHeaders = {}) {
  return {
    method: "POST",
    headers: {
      Origin: origin,
      "Content-Type": "application/json",
      ...extraHeaders
    },
    body: JSON.stringify(body)
  };
}

test("health check reveals only that the API process is alive", async () => {
  await withServer({ env: { RESEND_API_KEY: "secret", REPORT_TO: "private@example.com" } }, async (base) => {
    const response = await fetch(`${base}/api/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
    assert.equal(response.headers.get("cache-control"), "no-store");
  });
});

test("valid bug reports are emailed via Resend and return a review reference", async () => {
  let providerCall;
  await withServer({
    env: {
      RESEND_API_KEY: "server-only-secret",
      REPORT_TO: "private-inbox@example.com",
      REPORT_ALLOWED_ORIGIN: origin,
      REPORT_FROM: "ORBITA Reports <onboarding@resend.dev>"
    },
    generateId: () => "ORB-TEST1234",
    fetchImpl: async (url, options) => {
      providerCall = { url, options, email: JSON.parse(options.body) };
      return { ok: true, status: 200 };
    }
  }, async (base) => {
    const response = await fetch(`${base}/api/report`, postOptions(validBug));
    assert.equal(response.status, 202);
    assert.deepEqual(await response.json(), { ok: true, id: "ORB-TEST1234" });
    assert.equal(response.headers.get("access-control-allow-origin"), origin);
  });

  assert.equal(providerCall.url, "https://api.resend.com/emails");
  assert.equal(providerCall.options.method, "POST");
  assert.equal(providerCall.options.headers.Authorization, "Bearer server-only-secret");
  assert.deepEqual(providerCall.email.to, ["private-inbox@example.com"]);
  assert.equal(providerCall.email.from, "ORBITA Reports <onboarding@resend.dev>");
  assert.equal(providerCall.email.subject, "[ORBITA] Bug report ORB-TEST1234");
  assert.match(providerCall.email.text, /Requires human review; no site data was changed automatically\./);
  assert.match(providerCall.email.text, /Steps to reproduce:/);
  assert.match(providerCall.email.text, /reader@example\.com/);
  assert.equal(JSON.stringify(providerCall.email).includes("server-only-secret"), false);
});

test("scientific/data reports require the disputed record, field, values, and an HTTP(S) source", async () => {
  const badData = {
    type: "data",
    summary: "Incorrect orbital inclination",
    page: "/",
    record: "Example satellite",
    field: "Inclination",
    currentValue: "51 degrees",
    suggestedValue: "53 degrees",
    sourceUrl: "javascript:alert(1)",
    lang: "en"
  };
  let providerCalls = 0;
  await withServer({
    env: { RESEND_API_KEY: "test", REPORT_TO: "private@example.com", REPORT_ALLOWED_ORIGIN: origin },
    fetchImpl: async () => { providerCalls += 1; return { ok: true, status: 200 }; }
  }, async (base) => {
    const invalid = await fetch(`${base}/api/report`, postOptions(badData));
    assert.equal(invalid.status, 400);
    assert.deepEqual(await invalid.json(), { ok: false, error: "invalid_report" });

    const noSource = { ...badData, sourceUrl: "" };
    const missing = await fetch(`${base}/api/report`, postOptions(noSource, { "X-Forwarded-For": "203.0.113.8" }));
    assert.equal(missing.status, 400);
    assert.deepEqual(await missing.json(), { ok: false, error: "invalid_report" });
  });
  assert.equal(providerCalls, 0);
});

test("a valid data report includes all required correction details and no automatic data mutation", async () => {
  let email;
  const dataReport = {
    type: "data",
    summary: "Incorrect orbital inclination",
    page: "/",
    record: "Example satellite",
    field: "Inclination",
    currentValue: "51 degrees",
    suggestedValue: "53 degrees",
    sourceUrl: "https://example.org/mission-facts",
    notes: "The record lists a different value.",
    lang: "fa"
  };
  await withServer({
    env: { RESEND_API_KEY: "test", REPORT_TO: "private@example.com", REPORT_ALLOWED_ORIGIN: origin },
    generateId: () => "ORB-DATA1234",
    fetchImpl: async (_url, options) => { email = JSON.parse(options.body); return { ok: true, status: 200 }; }
  }, async (base) => {
    const response = await fetch(`${base}/api/report`, postOptions(dataReport));
    assert.equal(response.status, 202);
    assert.deepEqual(await response.json(), { ok: true, id: "ORB-DATA1234" });
  });
  assert.match(email.text, /مقدار فعلی/);
  assert.match(email.text, /مقدار پیشنهادی/);
  assert.match(email.text, /https:\/\/example\.org\/mission-facts/);
  assert.match(email.text, /هیچ داده‌ای به‌صورت خودکار تغییر نکرده است/);
});

test("unconfigured email delivery fails closed without making a provider call", async () => {
  let providerCalls = 0;
  await withServer({
    env: { REPORT_ALLOWED_ORIGIN: origin },
    fetchImpl: async () => { providerCalls += 1; return { ok: true, status: 200 }; }
  }, async (base) => {
    const response = await fetch(`${base}/api/report`, postOptions(validBug));
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { ok: false, error: "not_configured" });
  });
  assert.equal(providerCalls, 0);
});

test("oversized bodies are rejected before parsing or email delivery", async () => {
  let providerCalls = 0;
  await withServer({
    env: { RESEND_API_KEY: "test", REPORT_TO: "private@example.com", REPORT_ALLOWED_ORIGIN: origin },
    fetchImpl: async () => { providerCalls += 1; return { ok: true, status: 200 }; }
  }, async (base) => {
    const response = await fetch(`${base}/api/report`, {
      method: "POST",
      headers: { Origin: origin, "Content-Type": "application/json" },
      body: JSON.stringify({ padding: "x".repeat(17000) })
    });
    assert.equal(response.status, 413);
    assert.deepEqual(await response.json(), { ok: false, error: "body_too_large" });
  });
  assert.equal(providerCalls, 0);
});

test("CORS rejects other origins, and the allowed origin receives a preflight response", async () => {
  await withServer({ env: { REPORT_ALLOWED_ORIGIN: origin } }, async (base) => {
    const rejected = await fetch(`${base}/api/report`, postOptions(validBug, { Origin: "https://attacker.example" }));
    assert.equal(rejected.status, 403);

    const preflight = await fetch(`${base}/api/report`, {
      method: "OPTIONS",
      headers: { Origin: origin, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type" }
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get("access-control-allow-origin"), origin);
    assert.equal(preflight.headers.get("access-control-allow-methods"), "POST, OPTIONS");
  });
});

test("honeypot submissions are quietly acknowledged and never sent", async () => {
  let providerCalls = 0;
  await withServer({
    env: { RESEND_API_KEY: "test", REPORT_TO: "private@example.com", REPORT_ALLOWED_ORIGIN: origin },
    fetchImpl: async () => { providerCalls += 1; return { ok: true, status: 200 }; }
  }, async (base) => {
    const response = await fetch(`${base}/api/report`, postOptions({ ...validBug, website: "bot filled this" }));
    assert.equal(response.status, 202);
    assert.equal((await response.json()).ok, true);
  });
  assert.equal(providerCalls, 0);
});

test("per-process throttling limits repeat submissions from the same connection", async () => {
  let providerCalls = 0;
  await withServer({
    env: { RESEND_API_KEY: "test", REPORT_TO: "private@example.com", REPORT_ALLOWED_ORIGIN: origin },
    rateLimit: 2,
    fetchImpl: async () => { providerCalls += 1; return { ok: true, status: 200 }; }
  }, async (base) => {
    const headers = { "X-Forwarded-For": "203.0.113.42" };
    const first = await fetch(`${base}/api/report`, postOptions(validBug, headers));
    const second = await fetch(`${base}/api/report`, postOptions(validBug, headers));
    const third = await fetch(`${base}/api/report`, postOptions(validBug, headers));
    assert.equal(first.status, 202);
    assert.equal(second.status, 202);
    assert.equal(third.status, 429);
    assert.deepEqual(await third.json(), { ok: false, error: "rate_limited" });
  });
  assert.equal(providerCalls, 2);
});

test("provider failures return a generic response without leaking provider details", async () => {
  await withServer({
    env: { RESEND_API_KEY: "test", REPORT_TO: "private@example.com", REPORT_ALLOWED_ORIGIN: origin },
    fetchImpl: async () => ({ ok: false, status: 422, text: async () => "sensitive provider detail" })
  }, async (base) => {
    const response = await fetch(`${base}/api/report`, postOptions(validBug));
    assert.equal(response.status, 502);
    const body = await response.text();
    assert.match(body, /delivery_failed/);
    assert.equal(body.includes("sensitive provider detail"), false);
    assert.equal(body.includes("server-only-secret"), false);
  });
});
