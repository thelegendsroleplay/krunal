// Wrap everything in IIFE to avoid global variable conflicts
(function() {
  console.log("🎬 hydraulic_parameter.js loaded");

  // Function to initialize hydraulic parameters
  function initHydraulic() {
    console.log("⏱️ hydraulic_parameter.js: Initializing...");

    const banner = (msg) => {
      console.log("🚨 Banner:", msg);
      const b = document.createElement('div');
      b.textContent = msg;
      b.style.cssText = 'position:fixed;left:0;right:0;top:0;padding:10px 14px;background:#ff3b30;color:#fff;font:600 14px/1 system-ui;z-index:9999';
      document.body.appendChild(b);
    };

    console.log("📦 Chart.js available:", typeof Chart !== 'undefined');

    if (!window.Chart) {
      banner('Chart.js NOT LOADED — check the CDN in <head>.');
      console.error("❌ Chart.js not available");
      return;
    }

    console.log("✅ Chart.js is available");

    // ========== Theme toggle ==========
    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("light");
        themeBtn.textContent = themeBtn.textContent.trim() === "🌙" ? "☀️" : "🌙";
      });
    }

    // ========== Elements ==========
    console.log("🔍 Looking for hydraulic elements...");

    const rows = document.getElementById("rows");
    const kHead = document.getElementById("kpi-head");
    const kFlow = document.getElementById("kpi-flow");
    const kEff = document.getElementById("kpi-eff");
    const kPress = document.getElementById("kpi-press");

    const btnToggle = document.getElementById("toggle-run");
    const selInterval = document.getElementById("interval-ms");
    const btnClear = document.getElementById("clear-table");
    const canvasEl = document.getElementById("liveHydraulicChart");

    console.log("📊 Hydraulic elements found:");
    console.log("  - rows:", !!rows);
    console.log("  - kHead:", !!kHead);
    console.log("  - kFlow:", !!kFlow);
    console.log("  - kEff:", !!kEff);
    console.log("  - kPress:", !!kPress);
    console.log("  - btnToggle:", !!btnToggle);
    console.log("  - selInterval:", !!selInterval);
    console.log("  - btnClear:", !!btnClear);
    console.log("  - canvasEl:", !!canvasEl);

    if (!canvasEl) {
      banner('Canvas #liveHydraulicChart NOT FOUND in HTML.');
      console.error("❌ Canvas element not found!");
      return;
    }

    console.log("✅ All required elements found");

    // ========== Random sample generator ==========
    function sample() {
      const head = +(12 + Math.random() * 3).toFixed(2);          // m
      const flow = +(2.0 + Math.random() * 1.6).toFixed(2);       // m³/s
      const pressure = Math.round(100000 + Math.random() * 9000); // Pa
      const vel = +(3.0 + Math.random() * 1.2).toFixed(2);        // m/s
      const loss = +(0.20 + Math.random() * 0.20).toFixed(2);     // m
      const eff = +(85 + Math.random() * 12).toFixed(2);          // %
      return { head, flow, pressure, vel, loss, eff };
    }

    // ========== Chart.js live moving graph ==========
    console.log("🔨 Creating hydraulic chart...");

    const ctx = canvasEl.getContext("2d");
    const labels = [];
    const headData = [];
    const flowData = [];
    const effData = [];

    console.log("📊 Creating Chart instance...");

    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "Head (m)", data: headData, borderWidth: 2, tension: 0.45, borderColor: "#6dd6ff", pointRadius: 0 },
          { label: "Flow (m³/s)", data: flowData, borderWidth: 2, tension: 0.45, borderColor: "#2baaff", pointRadius: 0 },
          { label: "Efficiency (%)", data: effData, borderWidth: 2, tension: 0.45, borderColor: "#3ce18f", pointRadius: 0 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        plugins: { legend: { labels: { color: "#cfe2ff" } } },
        scales: {
          x: { ticks: { color: "#9bb0d1" }, grid: { color: "rgba(255,255,255,.05)" } },
          y: { ticks: { color: "#9bb0d1" }, grid: { color: "rgba(255,255,255,.05)" } }
        }
      }
    });

    // ========== Push new row + update UI ==========
    function pushRow() {
      const t = new Date().toLocaleTimeString();
      const s = sample();

      // KPIs
      if (kHead) kHead.textContent = s.head;
      if (kFlow) kFlow.textContent = s.flow;
      if (kEff) kEff.textContent = s.eff;
      if (kPress) kPress.textContent = s.pressure;

      // Table
      if (rows) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${t}</td>
          <td>${s.head}</td>
          <td>${s.flow}</td>
          <td>${s.pressure}</td>
          <td>${s.vel}</td>
          <td>${s.loss}</td>
          <td>${s.eff}</td>
        `;
        rows.prepend(tr);
        while (rows.children.length > 20) rows.lastChild.remove();
      }

      // Chart
      labels.push(t);
      headData.push(s.head);
      flowData.push(s.flow);
      effData.push(s.eff);
      const maxPoints = 28;
      if (labels.length > maxPoints) {
        labels.shift();
        headData.shift();
        flowData.shift();
        effData.shift();
      }
      chart.update();
    }

    // ========== Interval control ==========
    let timer = null;

    function startLoop(delay) {
      stopLoop();
      const finalDelay = delay || (selInterval ? +selInterval.value : 1500);
      console.log(`🔄 Starting loop with delay: ${finalDelay}ms`);
      timer = setInterval(pushRow, finalDelay);
    }

    function stopLoop() {
      if (timer) {
        clearInterval(timer);
        console.log("⏸ Loop stopped");
      }
      timer = null;
    }

    console.log("✅ Hydraulic chart created successfully");

    // Default start
    console.log("🚀 Starting hydraulic data updates...");
    pushRow();
    startLoop();
    console.log("✅ hydraulic_parameter.js initialization complete");

    // Controls
    if (btnToggle) {
      console.log("✅ Adding click handler to toggle button");
      btnToggle.addEventListener("click", () => {
        console.log(`🖱️ Toggle clicked, timer active: ${!!timer}`);
        if (timer) {
          stopLoop();
          btnToggle.textContent = "▶️ Resume";
        } else {
          startLoop();
          btnToggle.textContent = "⏸ Pause";
        }
      });
    } else {
      console.warn("⚠️ Toggle button not found");
    }

    if (selInterval) {
      console.log("✅ Adding change handler to interval selector");
      selInterval.addEventListener("change", () => {
        const newDelay = +selInterval.value;
        console.log(`🖱️ Interval changed to: ${newDelay}ms`);
        if (timer) startLoop(newDelay);
      });
    } else {
      console.warn("⚠️ Interval selector not found");
    }

    if (btnClear) {
      console.log("✅ Adding click handler to clear button");
      btnClear.addEventListener("click", () => {
        console.log("🖱️ Clear button clicked");
        if (rows) rows.innerHTML = "";
        labels.length = headData.length = flowData.length = effData.length = 0;
        chart.update();
      });
    } else {
      console.warn("⚠️ Clear button not found");
    }
  }

  // Check if DOM is already ready (for dynamic loading)
  if (document.readyState === 'loading') {
    console.log("📌 DOM still loading, waiting for DOMContentLoaded...");
    document.addEventListener('DOMContentLoaded', initHydraulic);
  } else {
    console.log("📌 DOM already ready, initializing immediately...");
    // DOM is already ready, execute immediately
    initHydraulic();
  }
})();
