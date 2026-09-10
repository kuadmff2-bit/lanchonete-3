import { storageConfigured, storageGet } from "./storage.js";

const PUSH_TOKENS_KEY = "admin-push-tokens";

function safePushToken(value) {
  const token = String(value || "").trim();
  if (token.length < 20 || token.length > 4096) return "";
  return /^[A-Za-z0-9_:.-]+$/.test(token) ? token : "";
}

function cleanOrder(order) {
  const id = String(order?.id || "").trim().slice(0, 120);
  if (!id) return null;
  return {
    id,
    customerName: String(order?.customerName || "Cliente").trim().slice(0, 120) || "Cliente",
    total: Number(order?.total || 0)
  };
}

async function readLocalTokens(env) {
  if (!storageConfigured(env)) return [];
  const raw = await storageGet(env, PUSH_TOKENS_KEY);
  try {
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    const unique = [];
    const seen = new Set();
    for (const entry of list) {
      const token = safePushToken(typeof entry === "string" ? entry : entry?.token);
      if (!token || seen.has(token)) continue;
      seen.add(token);
      unique.push(token);
      if (unique.length >= 8) break;
    }
    return unique;
  } catch {
    return [];
  }
}

async function sendToRelay(env, token, order) {
  try {
    const response = await fetch(String(env.PUSH_RELAY_URL || ""), {
      method: "POST",
      headers: {
        "content-type": "application/json; charset=utf-8",
        "x-push-relay-token": String(env.PUSH_RELAY_TOKEN || "")
      },
      body: JSON.stringify({ token, order }),
      signal: AbortSignal.timeout(12000)
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok && Boolean(data.ok), stale: Boolean(data.stale) };
  } catch {
    return { ok: false, stale: false };
  }
}

export async function notifyNewOrderViaRelay(env, order) {
  if (env.FCM_CLIENT_EMAIL && env.FCM_PRIVATE_KEY) {
    return { sent: 0, skipped: true, reason: "direct-firebase-present" };
  }
  if (!String(env.PUSH_RELAY_URL || "").trim() || !String(env.PUSH_RELAY_TOKEN || "").trim()) {
    return { sent: 0, skipped: true, reason: "relay-not-configured" };
  }
  if (!storageConfigured(env)) return { sent: 0, skipped: true, reason: "storage-not-configured" };

  const clean = cleanOrder(order);
  if (!clean) return { sent: 0, skipped: true, reason: "invalid-order" };

  const tokens = await readLocalTokens(env);
  if (!tokens.length) return { sent: 0, skipped: true, reason: "no-devices" };

  const results = await Promise.all(tokens.map((token) => sendToRelay(env, token, clean)));
  return {
    sent: results.filter((result) => result.ok).length,
    failed: results.filter((result) => !result.ok).length,
    stale: results.filter((result) => result.stale).length,
    via: "relay"
  };
}
