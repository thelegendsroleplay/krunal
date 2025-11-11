// ========== Theme toggle (optional light flip for later) ==========
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
const kEff  = document.getElementById("kpi-eff");
const kPress= document.getElementById("kpi-press");

const btnToggle = document.getElementById("toggle-run");
const selInterval = document.getElementById("interval-ms");
const btnClear = document.getElementById("clear-table");

// ========== Random sample generator (realistic-ish ranges) ==========
function sample() {
  const head = +(12 + Math.random()*3).toFixed(2);          // m
  const flow = +(2.0 + Math.random()*1.6).toFixed(2);       // m³/s
  const pressure = Math.round(100000 + Math.random()*9000); // Pa
  const vel = +(3.0 + Math.random()*1.2).toFixed(2);        // m/s
  const loss = +(0.20 + Math.random()*0.20).toFixed(2);     // m
  const eff = +(85 + Math.random()*12).toFixed(2);          // %
  return { head, flow, pressure, vel, loss, eff };
}

// ========== Chart.js live moving graph ==========

const ctx = document.getElementById("liveChart").getContext("2d");
const labels = [];
const headData = [];
const flowData = [];
const effData  = [];

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels,
    datasets: [
      { label:"Head (m)",       data:headData, borderWidth:2, tension:0.45, borderColor:"#6dd6ff" },
      { label:"Flow (m³/s)",    data:flowData, borderWidth:2, tension:0.45, borderColor:"#2baaff" },
      { label:"Efficiency (%)", data:effData,  borderWidth:2, tension:0.45, borderColor:"#3ce18f" }
    ]
  },
  options: {
    responsive:true,
    maintainAspectRatio:false,
    animation:{ duration:300 },
    elements:{ point:{ radius:0 } },
    plugins:{ legend:{ labels:{ color:"#cfe2ff" } } },
    scales:{
      x:{ ticks:{ color:"#9bb0d1" }, grid:{ color:"rgba(255,255,255,.05)" } },
      y:{ ticks:{ color:"#9bb0d1" }, grid:{ color:"rgba(255,255,255,.05)" } }
    }
  }
});

// ========== Push new row + update UI ==========
function pushRow() {
  const t = new Date().toLocaleTimeString();
  const s = sample();

  // KPIs
  kHead.textContent = s.head;
  kFlow.textContent = s.flow;
  kEff.textContent  = s.eff;
  kPress.textContent= s.pressure;

  // Table
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

  // Chart
  labels.push(t);
  headData.push(s.head);
  flowData.push(s.flow);
  effData.push(s.eff);
  const maxPoints = 28;
  if (labels.length > maxPoints) {
    labels.shift(); headData.shift(); flowData.shift(); effData.shift();
  }
  chart.update();
}

// ========== Interval control (start/stop + speed) ==========
let timer = null;

function startLoop(delay=+selInterval.value) {
  stopLoop();
  timer = setInterval(pushRow, delay);
}

function stopLoop() {
  if (timer) clearInterval(timer);
  timer = null;
}

// default start
pushRow();
startLoop();

btnToggle.addEventListener("click", () => {
  if (timer) {
    stopLoop();
    btnToggle.textContent = "▶️ Resume";
  } else {
    startLoop();
    btnToggle.textContent = "⏸ Pause";
  }
});

selInterval.addEventListener("change", () => {
  if (timer) startLoop(+selInterval.value);
});

btnClear.addEventListener("click", () => {
  rows.innerHTML = "";
  labels.length = headData.length = flowData.length = effData.length = 0;
  chart.update();
});
