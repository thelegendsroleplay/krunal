# Hydraulic Dam Digital Twin Dashboard

A real-time monitoring dashboard for hydraulic dam parameters including electrical and hydraulic data visualization.

## Quick Start

### Direct File Access (Easiest - For College Presentations)

Simply **double-click `index.html`** to open it in your browser!

All content is embedded in the single HTML file, so it works perfectly with the `file://` protocol without needing any server setup.

### Using a Local Web Server (Optional)

If you prefer to use a web server, you have several options:

#### Option 1: Using the Startup Script

```bash
./start-server.sh
```

This will prompt you to choose between Python or Node.js server and automatically start it.

#### Option 2: Using NPM

```bash
npm run dev
```

This will start the server and automatically open it in your browser at http://localhost:8080

#### Option 3: Using Python Directly

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080 in your browser.

#### Option 4: Using Node.js http-server

```bash
npx http-server -p 8080 -c-1
```

Then open http://localhost:8080 in your browser.

## Features

- **Dashboard Tab**: Overview with water level, flow rate, and turbine output
- **Hydraulic Data Tab**: Real-time monitoring of hydraulic parameters
  - Head, Flow, Pressure, Efficiency metrics
  - Live trending charts
  - Historical data table
- **Electrical Data Tab**: Real-time monitoring of generator parameters
  - Voltage, Current, Power, Power Factor, Frequency metrics
  - Live trending charts
  - Historical data table

## Controls

Each parameter tab includes:
- ⏸/▶️ **Pause/Resume**: Control data updates
- **Speed Selector**: Adjust update interval (0.5s, 1.0s, 1.5s)
- **Clear**: Clear historical data table
- 🌙/☀️ **Theme Toggle**: Switch between dark and light modes

## Technical Details

- Uses Chart.js for real-time data visualization
- Dynamic tab loading to improve initial page load performance
- Proper cleanup mechanisms to prevent memory leaks
- Unique element IDs to prevent conflicts between tabs

## Troubleshooting

### Charts not displaying
- Ensure Chart.js CDN is accessible
- Check browser console for errors

### Tab switching issues
- Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
