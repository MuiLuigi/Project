//Name: Fahad Arif (N01729165)
//Course: Network Programming (CPAN-226)

//This is for loading the environment variables
require("dotenv").config()

//These are the Azure SDKs
const { DefaultAzureCredential } = require("@azure/identity")
const { MetricsQueryClient } = require("@azure/monitor-query")

//These help create the Azure clients
const credential = new DefaultAzureCredential()
const metricsClient = new MetricsQueryClient(credential)

//This is for getting one metric from the Azure Monitor
async function getSingleMetric(resourceId, metricName) {
  const result = await metricsClient.queryResource(
    resourceId,
    [metricName],
    {
      timespan: {
        startTime: new Date(Date.now() - 5 * 60 * 1000),
        endTime: new Date()
      },
      granularity: "PT1M",
      aggregations: ["Average"]
    }
  )

  const metric = result.metrics?.[0]
  const timeSeries = metric?.timeseries?.[0]
  const data = timeSeries?.data || []

  const latest = [...data].reverse().find(
    (item) => item.average !== undefined && item.average !== null
  )

  return latest ? Number(latest.average.toFixed(2)) : 0
}

//This is for getting the Azure telemetry
async function getAzureTelemetry() {
  const resourceId = process.env.AZURE_RESOURCE_ID

  if (!resourceId) {
    throw new Error("AZURE_RESOURCE_ID is missing in .env")
  }

  const latencyRaw = await getSingleMetric(
    resourceId,
    process.env.AZURE_LATENCY_METRIC || "Network In Total"
  )

  const bandwidthRaw = await getSingleMetric(
    resourceId,
    process.env.AZURE_BANDWIDTH_METRIC || "Network Out Total"
  )

  return {
    timestamp: new Date().toISOString(),
    provider: "Azure",
    mode: "azure",
    metrics: {
      latencyMs: latencyRaw / 1000,
      bandwidthMbps: bandwidthRaw / 125000,
      packetLossPct: 0,
      jitterMs: 0
    }
  }
}

//This is the safe version for getting the Azure telemetry
async function getAzureTelemetrySafe() {
  try {
    return await getAzureTelemetry()
  } catch (error) {
    return {
      timestamp: new Date().toISOString(),
      provider: "Azure",
      mode: "azure",
      error: error.message,
      metrics: {
        latencyMs: 0,
        bandwidthMbps: 0,
        packetLossPct: 0,
        jitterMs: 0
      }
    }
  }
}

module.exports = {
  getAzureTelemetry,
  getAzureTelemetrySafe
}