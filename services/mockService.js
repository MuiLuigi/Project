//Name: Fahad Arif (N01729165)
//Course: Network Programming (CPAN-226)

//This generates a random number between the min and max
function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

//This is for creating fake telemetry data for testing
function getMockTelemetry() {
  const latencyMs = Number(randomBetween(12, 95).toFixed(2))
  const bandwidthMbps = Number(randomBetween(50, 950).toFixed(2))
  const packetLossPct = Number(randomBetween(0, 2).toFixed(2))
  const jitterMs = Number(randomBetween(1, 10).toFixed(2))

  return {
    timestamp: new Date().toISOString(),
    provider: "Mock Cloud",
    mode: "mock",
    metrics: {
      latencyMs,
      bandwidthMbps,
      packetLossPct,
      jitterMs
    }
  }
}

module.exports = {
  getMockTelemetry
}