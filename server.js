//Name: Fahad Arif (N01729165)
//Course: Network Programming (CPAN-226)

//This is for loading the environment variables from the .env file
require("dotenv").config()

const express = require("express")
const http = require("http")
const cors = require("cors")
const { Server } = require("socket.io")
const telemetryService = require("./services/telemetryService")

const app = express()
const server = http.createServer(app)

//This is for enabling middleware
app.use(cors())
app.use(express.json())
//This serves the frontend files from the public folder
app.use(express.static("public"))

//This initializes the Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*"
  }
})

const PORT = process.env.PORT || 3000
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS || 5000)

//This is for storing the latest telemetry snapshot
let latestSnapshot = null

//This is a simple health check API
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    mode: process.env.TELEMETRY_MODE || "mock",
    interval: POLL_INTERVAL_MS
  })
})

//This is for returning the latest telemetry data
app.get("/api/latest", (req, res) => {
  if (!latestSnapshot) {
    return res.json({
      message: "No data yet. Wait for first telemetry poll."
    })
  }
  res.json(latestSnapshot)
})

//This handles the client connection via Socket.IO
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`)

  //This will send the latest data immediately if it is available
  if (latestSnapshot) {
    socket.emit("telemetry:update", latestSnapshot)
  }

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`)
  })
})

//This is a function to fetch telemetry and send it to the clients
async function pollTelemetry() {
  try {
    const snapshot = await telemetryService.getTelemetrySnapshot()
    latestSnapshot = snapshot

    //This will send data to all the connected clients
    io.emit("telemetry:update", snapshot)
    console.log(`[${snapshot.timestamp}] Telemetry pushed to clients.`)
  } catch (error) {
    console.error("Telemetry polling error:", error.message)
    io.emit("telemetry:error", {
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}

//This will start the server
server.listen(PORT, async () => {
  console.log(`The server is running on http://localhost:${PORT}`)
  await pollTelemetry()
  setInterval(pollTelemetry, POLL_INTERVAL_MS)
})