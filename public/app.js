//Name: Fahad Arif (N01729165)
//Course: Network Programming (CPAN-226)

//This is for connecting to the Socket.IO server
const socket = io()

//These are for getting the HTML elements
const providerEl = document.getElementById("provider")
const latencyEl = document.getElementById("latency")
const bandwidthEl = document.getElementById("bandwidth")
const timestampEl = document.getElementById("timestamp")
const logEl = document.getElementById("log")

//These are for storing the chart data
const maxPoints = 15
const labels = []
const latencyData = []
const bandwidthData = []

//This is for adding a message to the Log
function addLog(message) {
  const li = document.createElement("li")
  li.textContent = `${new Date().toLocaleTimeString()} - ${message}`
  logEl.prepend(li)

  while (logEl.children.length > 10) {
    logEl.removeChild(logEl.lastChild)
  }
}

//This is for creating the latency chart
const latencyChart = new Chart(document.getElementById("latencyChart"), {
  type: "line",
  data: {
    labels,
    datasets: [
      {
        label: "Latency (ms)",
        data: latencyData,
        tension: 0.25
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false
  }
})

//This is for creating the bandwidth chart
const bandwidthChart = new Chart(document.getElementById("bandwidthChart"), {
  type: "line",
  data: {
    labels,
    datasets: [
      {
        label: "Bandwidth (Mbps)",
        data: bandwidthData,
        tension: 0.25
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false
  }
})

//This is for updating the charts with new data
function pushPoint(label, latency, bandwidth) {
  labels.push(label)
  latencyData.push(latency)
  bandwidthData.push(bandwidth)

  //This is for keeping only the last N points
  if (labels.length > maxPoints) {
    labels.shift()
    latencyData.shift()
    bandwidthData.shift()
  }

  latencyChart.update()
  bandwidthChart.update()
}

//This is for when it is connected to the server
socket.on("connect", () => {
  addLog("Connected to server")
})

socket.on("disconnect", () => {
  addLog("Disconnected from server")
})

socket.on("telemetry:error", (error) => {
  addLog(`Error: ${error.message}`)
})

//This is for when the data is received
socket.on("telemetry:update", (payload) => {
  if (payload.sources) {
    const firstValid = payload.sources.find((src) => src.metrics)
    if (!firstValid) return

    providerEl.textContent = payload.provider
    latencyEl.textContent = `${firstValid.metrics.latencyMs} ms`
    bandwidthEl.textContent = `${firstValid.metrics.bandwidthMbps} Mbps`
    timestampEl.textContent = new Date(payload.timestamp).toLocaleString()

    pushPoint(
      new Date(payload.timestamp).toLocaleTimeString(),
      firstValid.metrics.latencyMs,
      firstValid.metrics.bandwidthMbps
    )

    addLog(`Hybrid update has been received`)
    return
  }

  providerEl.textContent = payload.provider
  latencyEl.textContent = `${payload.metrics.latencyMs} ms`
  bandwidthEl.textContent = `${payload.metrics.bandwidthMbps} Mbps`
  timestampEl.textContent = new Date(payload.timestamp).toLocaleString()

  pushPoint(
    new Date(payload.timestamp).toLocaleTimeString(),
    payload.metrics.latencyMs,
    payload.metrics.bandwidthMbps
  )

  addLog(`Telemetry update received from ${payload.provider}`)
})