// Wait for DOM to be ready (handles dynamic loading)
(function() {
  // Small delay to ensure HTML is fully injected
  setTimeout(() => {
    const banner = (msg) => {
      const b = document.createElement('div');
      b.textContent = msg;
      b.style.cssText = 'position:fixed;left:0;right:0;top:0;padding:10px 14px;background:#ff3b30;color:#fff;font:600 14px/1 system-ui;z-index:9999';
      document.body.appendChild(b);
    };

    if (!window.Chart) {
      banner('Chart.js NOT LOADED — check the CDN in <head>.');
      return;
    }

    // ========== Theme toggle ==========
    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("light");
        themeBtn.textContent = themeBtn.textContent.trim() === "🌙" ? "☀️" : "🌙";
      });
    }

    // ========== Elements ==========
    const rows = document.getElementById("rows");
    const kHead = document.getElementById("kpi-head");
    const kFlow = document.getElementById("kpi-flow");
    const kEff = document.getElementById("kpi-eff");
    const kPress = document.getElementById("kpi-press");

    const btnToggle = document.getElementById("toggle-run");
    const selInterval = document.getElementById("interval-ms");
    const btnClear = document.getElementById("clear-table");
    const canvasEl = document.getElementById("liveChart");

    if (!canvasEl) {
      banner('Canvas #liveChart NOT FOUND in HTML.');
      return;
    }

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
    const ctx = canvasEl.getContext("2d");
    const labels = [];
    const headData = [];
    const flowData = [];
    const effData = [];

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

    function startLoop(delay = +selInterval.value) {
      stopLoop();
      timer = setInterval(pushRow, delay);
    }

    function stopLoop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    // Default start
    pushRow();
    startLoop();

    // Controls
    if (btnToggle) {
      btnToggle.addEventListener("click", () => {
        if (timer) {
          stopLoop();
          btnToggle.textContent = "▶️ Resume";
        } else {
          startLoop();
          btnToggle.textContent = "⏸ Pause";
        }
      });
    }

    if (selInterval) {
      selInterval.addEventListener("change", () => {
        if (timer) startLoop(+selInterval.value);
      });
    }

    if (btnClear) {
      btnClear.addEventListener("click", () => {
        if (rows) rows.innerHTML = "";
        labels.length = headData.length = flowData.length = effData.length = 0;
        chart.update();
      });
    }
  }, 100); // Small delay to ensure HTML is loaded
})();
