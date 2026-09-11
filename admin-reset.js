(() => {
  const refreshButton = document.querySelector("#refreshOrders");
  if (!refreshButton) return;

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.gap = "8px";
  actions.style.flexWrap = "wrap";

  refreshButton.parentNode.insertBefore(actions, refreshButton);
  actions.appendChild(refreshButton);

  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.id = "clearOrdersButton";
  clearButton.className = "secondary-small danger-outline";
  clearButton.textContent = "Limpar pedidos e valores";
  actions.appendChild(clearButton);

  clearButton.addEventListener("click", async () => {
    const first = confirm("Isso vai zerar TODOS os pedidos, valores acumulados e o histórico de pedidos. Produtos e promoções não serão apagados. Continuar?");
    if (!first) return;

    const second = confirm("Tem certeza? Essa ação não pode ser desfeita.");
    if (!second) return;

    clearButton.disabled = true;
    setStatus("#dashboardStatus", "Limpando pedidos e valores...");

    try {
      const data = await api("/api/orders", { method: "DELETE" });
      renderDashboard(data);
      setStatus("#dashboardStatus", "Pedidos, valores e histórico foram zerados.", "ok");
    } catch (error) {
      setStatus("#dashboardStatus", error.message || "Não foi possível limpar os dados.", "error");
    } finally {
      clearButton.disabled = false;
    }
  });
})();

(() => {
  const isAdminApp = (navigator.userAgent || "").includes("LanchoneteAdminApp/");
  if (!isAdminApp) return;
  const token = typeof getAdminAppToken === "function" ? getAdminAppToken() : "";
  if (!token) return;
  adminAppToken = token;

  const loginPanel = document.querySelector("#loginPanel");
  const adminApp = document.querySelector("#adminApp");
  const logoutButton = document.querySelector("#logoutButton");

  if (loginPanel) loginPanel.hidden = true;
  if (adminApp) adminApp.hidden = false;
  if (logoutButton) logoutButton.hidden = true;

  (async () => {
    try {
      const orders = await api("/api/orders");
      if (typeof renderDashboard === "function") renderDashboard(orders);
      if (typeof loadProducts === "function" && typeof loadPromotion === "function") {
        await Promise.all([loadProducts(), loadPromotion()]);
      }
    } catch (error) {
      if (typeof setStatus === "function") {
        setStatus("#dashboardStatus", error.message || "Não foi possível abrir o painel administrativo.", "error");
      }
    }
  })();
})();

(() => {
  const loadScript = (src, dataKey) => {
    if (document.querySelector(`script[${dataKey}]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.setAttribute(dataKey, "1");
    document.body.appendChild(script);
  };

  loadScript("admin-robot.js", "data-admin-robot");
  loadScript("admin-whatsapp.js", "data-admin-whatsapp");
  loadScript("admin-new-features.js", "data-admin-new-features");
  loadScript("admin-layout-fix.js", "data-admin-layout-fix");
})();