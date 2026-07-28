(() => {
  "use strict";

  const status = document.querySelector("[data-pwa-status]");
  const banner = document.querySelector("[data-update-banner]");
  const reloadButton = document.querySelector("[data-update-reload]");

  const setStatus = (message, state) => {
    if (!status) return;
    status.textContent = message;
    status.dataset.status = state;
  };

  if (!("serviceWorker" in navigator)) {
    setStatus("Offline support is unavailable in this browser.", "warning");
    return;
  }

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/galatea/sw.js", {
        scope: "/galatea/",
        updateViaCache: "none"
      });

      const showUpdate = () => {
        if (!banner) return;
        banner.hidden = false;
        reloadButton?.focus();
      };

      const setReadyStatus = () => {
        setStatus("Offline support is ready after this page has loaded once.", "ready");
      };

      if (navigator.serviceWorker.controller) setReadyStatus();
      navigator.serviceWorker.ready.then(setReadyStatus);

      if (registration.waiting) showUpdate();
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) showUpdate();
        });
      });

      let reloading = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (reloading) return;
        reloading = true;
        window.location.reload();
      });

      reloadButton?.addEventListener("click", () => {
        registration.waiting?.postMessage("activate-update");
      });
    } catch (error) {
      console.warn("Offline support could not be enabled.", error);
      setStatus("Offline support could not be enabled. Connect once and reload.", "warning");
    }
  });
})();
