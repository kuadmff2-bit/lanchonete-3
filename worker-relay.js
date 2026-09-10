import appWorker from "./worker-admin-app.js";
import { notifyNewOrderViaRelay } from "./push-relay.js";
export { AppStorage } from "./durable-storage.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const response = await appWorker.fetch(request, env, ctx);

    if (url.pathname === "/api/orders" && request.method === "POST" && response.ok) {
      const data = await response.clone().json().catch(() => ({}));
      if (data?.order && !data?.duplicate) {
        const task = notifyNewOrderViaRelay(env, data.order).catch(() => null);
        if (ctx?.waitUntil) ctx.waitUntil(task);
        else await task;
      }
    }

    return response;
  }
};
