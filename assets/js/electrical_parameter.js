// Wrap everything in IIFE to avoid global variable conflicts
(function() {
  console.log("🎬 electrical_parameter.js loaded");

  // Function to initialize electrical parameters
  function initElectrical() {
    console.log("⏱️ electrical_parameter.js: Initializing...");

    const banner = (msg)=>{
      console.log("🚨 Banner:", msg);
      const b=document.createElement('div');
      b.textContent=msg;
      b.style.cssText='position:fixed;left:0;right:0;top:0;padding:10px 14px;background:#ff3b30;color:#fff;font:600 14px/1 system-ui;z-index:9999';
      document.body.appendChild(b);
    };

    console.log("📦 Chart.js available:", typeof Chart !== 'undefined');

    if (!window.Chart) {
      banner('Chart.js NOT LOADED — check the CDN in <head>.');
      console.error("❌ Chart.js not available");
      return;
    }

    console.log("✅ Chart.js is available");

    // Theme toggle
    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("light");
        themeBtn.textContent = themeBtn.textContent.trim() === "🌙" ? "☀️" : "🌙";
      });
    }

    // Elements
    console.log("🔍 Looking for electrical elements...");

    const rows  = document.getElementById("rows");
    const kV    = document.getElementById("kpi-voltage");
    const kI    = document.getElementById("kpi-current");
    const kP    = document.getElementById("kpi-power");
    const kPF   = document.getElementById("kpi-pf");
    const kF    = document.getElementById("kpi-freq");
    const btnToggle   = document.getElementById("toggle-run");
    const selInterval = document.getElementById("interval-ms");
    const btnClear    = document.getElementById("clear-table");
    const canvas = document.getElementById("liveElecChart");

    console.log("📊 Electrical elements found:");
    console.log("  - rows:", !!rows);
    console.log("  - kV:", !!kV);
    console.log("  - kI:", !!kI);
    console.log("  - kP:", !!kP);
    console.log("  - kPF:", !!kPF);
    console.log("  - kF:", !!kF);
    console.log("  - btnToggle:", !!btnToggle);
    console.log("  - selInterval:", !!selInterval);
    console.log("  - btnClear:", !!btnClear);
    console.log("  - canvas:", !!canvas);

    if (!canvas) {
      banner('Canvas #liveElecChart NOT FOUND in HTML.');
      console.error("❌ Canvas element not found!");
      return;
    }

    console.log("✅ All required elements found");

    // Random generator
    let recordId = 0;
    function sample() {
      const V  = Math.round(11000 + (Math.random()*0.10 - 0.05) * 11000); // 11kV ±5%
      const I  = +(300 + Math.random()*400).toFixed(1);                   // 300–700 A
      const PF = +(0.88 + Math.random()*0.11).toFixed(3);                 // 0.88–0.99
      const F  = +(50 + (Math.random()*0.4 - 0.2)).toFixed(2);            // 50 ±0.2 Hz
      const P  = +(1.732 * V * I * PF / 1000).toFixed(1);                 // kW
      return { record_id: ++recordId, generator_voltage_v: V, generator_current_a: I,
               power_output_kw: P, power_factor: PF, frequency_hz: F,
               timestamp: new Date().toLocaleTimeString() };
    }

    // Chart
    console.log("🔨 Creating electrical chart...");

    const ctx = canvas.getContext("2d");
    const labels = [], powerData = [], currentData = [];

    console.log("📊 Creating Chart instance...");

    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label:"Power (kW)",  data: powerData,   yAxisID:"yP", borderColor:"#3ce18f", borderWidth:2, tension:0.45, pointRadius:0 },
          { label:"Current (A)", data: currentData, yAxisID:"yI", borderColor:"#2baaff", borderWidth:2, tension:0.45, pointRadius:0 }
        ]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ labels:{ color:"#cfe2ff" } } },
        scales:{
          x:{ ticks:{ color:"#9bb0d1" }, grid:{ color:"rgba(255,255,255,.05)" } },
          yP:{ position:"left",  ticks:{ color:"#9bb0d1" }, title:{ display:true, text:"kW", color:"#9bb0d1" } },
          yI:{ position:"right", ticks:{ color:"#9bb0d1" }, grid:{ drawOnChartArea:false }, title:{ display:true, text:"A", color:"#9bb0d1" } }
        }
      }
    });

    // Push data
    function pushRow() {
      const s = sample();
      kV.textContent = s.generator_voltage_v.toLocaleString();
      kI.textContent = s.generator_current_a;
      kP.textContent = s.power_output_kw.toLocaleString();
      kPF.textContent = s.power_factor;
      kF.textContent = s.frequency_hz;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${s.record_id}</td>
        <td>${s.generator_voltage_v}</td>
        <td>${s.generator_current_a}</td>
        <td>${s.power_output_kw}</td>
        <td>${s.power_factor}</td>
        <td>${s.frequency_hz}</td>
        <td>${s.timestamp}</td>`;
      rows.prepend(tr);
      while (rows.children.length > 20) rows.lastChild.remove();

      labels.push(s.timestamp);
      powerData.push(s.power_output_kw);
      currentData.push(s.generator_current_a);
      if (labels.length > 28) { labels.shift(); powerData.shift(); currentData.shift(); }
      chart.update();
    }

    console.log("✅ Electrical chart created successfully");

    // Control
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

    console.log("🚀 Starting electrical data updates...");
    pushRow();
    startLoop();
    console.log("✅ electrical_parameter.js initialization complete");

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
        rows.innerHTML = "";
        labels.length = powerData.length = currentData.length = 0;
        chart.update();
      });
    } else {
      console.warn("⚠️ Clear button not found");
    }
  }

  // Check if DOM is already ready (for dynamic loading)
  if (document.readyState === 'loading') {
    console.log("📌 DOM still loading, waiting for DOMContentLoaded...");
    document.addEventListener('DOMContentLoaded', initElectrical);
  } else {
    console.log("📌 DOM already ready, initializing immediately...");
    // DOM is already ready, execute immediately
    initElectrical();
  }
})();
