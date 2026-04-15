//Name: Fahad Arif (N01729165)
//Course: Network Programming (CPAN-226)

//This is for loading the environment variables
require("dotenv").config()

//This is the AWS CloudWatch SDK
const {
  CloudWatchClient,
  GetMetricDataCommand
} = require("@aws-sdk/client-cloudwatch")

//This is for creating the CloudWatch client
const client = new CloudWatchClient({
  region: process.env.AWS_REGION
})

//This is for getting a single metric value from CloudWatch
async function getMetricValue(metricName, namespace, dimensions) {
  const endTime = new Date()
  const startTime = new Date(endTime.getTime() - 5 * 60 * 1000)

  const params = {
    StartTime: startTime,
    EndTime: endTime,
    MetricDataQueries: [
      {
        Id: "m1",
        MetricStat: {
          Metric: {
            Namespace: namespace,
            MetricName: metricName,
            Dimensions: dimensions
          },
          Period: 60,
          Stat: "Average"
        },
        ReturnData: true
      }
    ]
  }

  const command = new GetMetricDataCommand(params)
  const response = await client.send(command)

  const result = response.MetricDataResults?.[0]
  const values = result?.Values || []
  if (!values.length) return 0

  return Number(values[0].toFixed(2))
}

//This is for getting the AWS telemetry
async function getAwsTelemetry() {
  const namespace = process.env.AWS_NAMESPACE || "AWS/EC2"
  const instanceId = process.env.AWS_INSTANCE_ID

  const dimensions = instanceId
    ? [{ Name: "InstanceId", Value: instanceId }] : []

  const bandwidthRaw = await getMetricValue(
    process.env.AWS_BANDWIDTH_METRIC || "NetworkIn",
    namespace,
    dimensions
  )

  const latencyRaw = await getMetricValue(
    process.env.AWS_LATENCY_METRIC || "StatusCheckFailed",
    namespace,
    dimensions
  )

  return {
    timestamp: new Date().toISOString(),
    provider: "AWS",
    mode: "aws",
    metrics: {
      latencyMs: latencyRaw * 100,
      bandwidthMbps: bandwidthRaw / 125000,
      packetLossPct: 0,
      jitterMs: 0
    }
  }
}

//This is for preventing the program to crash and keep it safe
async function getAwsTelemetrySafe() {
  try {
    return await getAwsTelemetry()
  } catch (error) {
    return {
      timestamp: new Date().toISOString(),
      provider: "AWS",
      mode: "aws",
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
  getAwsTelemetry,
  getAwsTelemetrySafe
}