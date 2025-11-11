// =================== SAFE DOM HELPERS ===================

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// =================== THEME TOGGLE (persistent) ===================

const themeBtn = document.getElementById("theme-toggle");
const savedTheme = localStorage.getItem("site-theme"); // 'light' or 'dark'
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

// =================== TAB SYSTEM (sidebar tabs) ===================

const tabLinks = $$(".tab-link");
const tabPanels = $$(".tab-content");

function activateTab(targetId, direction = "none") {
  tabLinks.forEach(t => t.classList.toggle("active", t.dataset.tab === targetId));
  tabPanels.forEach(panel => {
    if (panel.id === targetId) {
      panel.classList.remove("from-left", "from-right");
      if (direction === "left") panel.classList.add("from-left");
      if (direction === "right") panel.classList.add("from-right");
      panel.classList.add("active");
      panel.setAttribute("aria-hidden", "false");
    } else {
      panel.classList.remove("active", "from-left", "from-right");
      panel.setAttribute("aria-hidden", "true");
    }
  });
}

// =================== DYNAMIC PAGE LOADING ===================

async function loadPage(url, targetElement, cssPath, jsPath) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    targetElement.innerHTML = html;

    // Load CSS if provided
    if (cssPath && !document.querySelector(`link[href="${cssPath}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssPath;
      document.head.appendChild(link);
    }

    // Load JS if provided
    if (jsPath) {
      const old = document.querySelector(`script[src="${jsPath}"]`);
      if (old) old.remove();
      const script = document.createElement("script");
      script.src = jsPath;
      script.defer = true;
      document.body.appendChild(script);
    }
  } catch (error) {
    console.error(`Error loading ${url}:`, error);
    targetElement.innerHTML = `<p style="color:red;">Failed to load ${url}</p>`;
  }
}

// handle tab click
tabLinks.forEach(link => {
  link.setAttribute("role", "tab");
  link.setAttribute("tabindex", "0");

  link.addEventListener("click", async () => {
    const current = tabPanels.findIndex(p => p.classList.contains("active"));
    const idxTarget = tabPanels.findIndex(p => p.id === link.dataset.tab);
    const direction = (current === -1) ? "none" : (idxTarget < current ? "left" : "right");
    const targetId = link.dataset.tab;

    activateTab(targetId, direction);

    // dynamically load external pages
    if (targetId === "hydraulic") {
      await loadPage(
        "hydraulic_parameter.html",
        document.getElementById("hydraulic"),
        "assets/css/hydraulic_parameter.css",
        "assets/js/hydraulic_parameter.js"
      );
    } else if (targetId === "electrical") {
      await loadPage(
        "electrical_parameter.html",
        document.getElementById("electrical"),
        "assets/css/electrical_parameter.css",
        "assets/js/electrical_parameter.js"
      );
    }
  });

  // keyboard navigation (Enter / Space / ArrowLeft / ArrowRight)
  link.addEventListener("keydown", (e) => {
    const KEY = { ENTER: 13, SPACE: 32, LEFT: 37, RIGHT: 39 };
    const curIndex = tabLinks.indexOf(link);
    if (e.keyCode === KEY.ENTER || e.keyCode === KEY.SPACE) {
      link.click();
      e.preventDefault();
    } else if (e.keyCode === KEY.LEFT) {
      const prev = tabLinks[(curIndex - 1 + tabLinks.length) % tabLinks.length];
      prev.focus(); prev.click(); e.preventDefault();
    } else if (e.keyCode === KEY.RIGHT) {
      const next = tabLinks[(curIndex + 1) % tabLinks.length];
      next.focus(); next.click(); e.preventDefault();
    }
  });
});

// activate first tab by default if none active
const activeTabLink = tabLinks.find(t => t.classList.contains("active")) || tabLinks[0];
if (activeTabLink) activateTab(activeTabLink.dataset.tab);

// =================== CHART.JS SETUP (robust) ===================

const canvasEl = document.getElementById("liveChart");
let liveChart = null;

function createChart() {
  if (!canvasEl) return null;
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

  return liveChart;
}

createChart();

// =================== LIVE TABLE + CARDS UPDATE ===================

const tbody = document.getElementById("data-body");
const elWaterLevel = document.getElementById("water-level");
const elFlowRate = document.getElementById("flow-rate");
const elTurbineOutput = document.getElementById("turbine-output");

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
let liveInterval = setInterval(addLiveData, INTERVAL_MS);
addLiveData();

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
