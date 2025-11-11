// =================== SAFE DOM HELPERS ===================
console.log("🎬 main.js loaded");

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// =================== THEME TOGGLE (persistent) ===================
console.log("🎨 Initializing theme toggle");

const themeBtn = document.getElementById("theme-toggle");
console.log("🔘 Theme button found:", !!themeBtn);

const savedTheme = localStorage.getItem("site-theme"); // 'light' or 'dark'
console.log("💾 Saved theme:", savedTheme);

if (savedTheme === "light") document.body.classList.add("light");

if (themeBtn) {
  const setBtnIcon = () => {
    themeBtn.textContent = document.body.classList.contains("light") ? "☀️" : "🌗";
  };
  setBtnIcon();

  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    localStorage.setItem("site-theme", isLight ? "light" : "dark");
    setBtnIcon();
  });
}

// =================== CHART.JS SETUP (robust) ===================
console.log("📊 Initializing Chart.js");
console.log("📦 Chart.js available:", typeof Chart !== 'undefined');

const canvasEl = document.getElementById("liveChart");
console.log("🎨 Canvas element found:", !!canvasEl);

let liveChart = null;

function createChart() {
  console.log("🔨 Creating chart...");
  if (!canvasEl) {
    console.warn("⚠️ No canvas element found for dashboard chart");
    return null;
  }
  const ctx = canvasEl.getContext("2d");

  if (liveChart && typeof liveChart.destroy === "function") {
    liveChart.destroy();
    liveChart = null;
  }

  liveChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Flow (m³/s)",
        data: [],
        borderColor: "#42b9ff",
        borderWidth: 3,
        tension: 0.36,
        pointRadius: 0,
        fill: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: false,
          grid: { color: "rgba(255,255,255,0.03)" },
          ticks: { maxTicksLimit: 5 }
        },
        x: {
          grid: { color: "rgba(255,255,255,0.02)" },
          ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8 }
        }
      }
    }
  });

  console.log("✅ Chart created successfully");
  return liveChart;
}

const chartResult = createChart();
console.log("📊 Chart initialization result:", !!chartResult);

// =================== LIVE TABLE + CARDS UPDATE ===================
console.log("🔄 Setting up live data updates");

const tbody = document.getElementById("data-body");
const elWaterLevel = document.getElementById("water-level");
const elFlowRate = document.getElementById("flow-rate");
const elTurbineOutput = document.getElementById("turbine-output");

console.log("📊 Dashboard elements found:");
console.log("  - Water Level:", !!elWaterLevel);
console.log("  - Flow Rate:", !!elFlowRate);
console.log("  - Turbine Output:", !!elTurbineOutput);

const formatNumber = (v, decimals = 2) => Number(v).toFixed(decimals);

function addLiveData() {
  const now = new Date();
  const label = now.toLocaleTimeString();

  const head = (12 + Math.random() * 2).toFixed(2);             // meters
  const flow = (3 + Math.random() * 1).toFixed(2);              // m3/s
  const pressure = (100000 + Math.random() * 8000).toFixed(0);  // Pa
  const eff = (85 + Math.random() * 10).toFixed(2);             // %

  if (elWaterLevel) elWaterLevel.textContent = `${formatNumber(head, 2)} m`;
  if (elFlowRate) elFlowRate.textContent = `${formatNumber(flow, 2)} m³/s`;
  if (elTurbineOutput) elTurbineOutput.textContent = `${formatNumber(eff, 2)}%`;

  if (tbody) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${label}</td>
      <td>${head}</td>
      <td>${flow}</td>
      <td>${pressure}</td>
      <td>${eff}</td>
    `;
    tbody.insertAdjacentElement("afterbegin", row);
    while (tbody.children.length > 12) tbody.removeChild(tbody.lastChild);
  }

  if (liveChart) {
    const numericFlow = parseFloat(flow);
    liveChart.data.labels.push(label);
    liveChart.data.datasets[0].data.push(numericFlow);
    if (liveChart.data.labels.length > 20) {
      liveChart.data.labels.shift();
      liveChart.data.datasets[0].data.shift();
    }
    liveChart.update();
  }
}

const INTERVAL_MS = 1500;
console.log(`⏱️ Starting live data updates every ${INTERVAL_MS}ms`);
let liveInterval = setInterval(addLiveData, INTERVAL_MS);
addLiveData();
console.log("✅ main.js initialization complete");

window._dashboard = {
  addLiveData,
  createChart,
  destroyChart: () => { if (liveChart) liveChart.destroy(); liveChart = null; },
  clearData: () => {
    if (tbody) tbody.innerHTML = "";
    if (liveChart) {
      liveChart.data.labels = [];
      liveChart.data.datasets[0].data = [];
      liveChart.update();
    }
  }
};
