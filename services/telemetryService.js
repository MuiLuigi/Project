//Name: Fahad Arif (N01729165)
//Course: Network Programming (CPAN-226)

//This loads the environment variables
require("dotenv").config()

const mockService = require("./mockService")

//This is the main function to help decide which telemetry source to use
async function getTelemetrySnapshot() {
  const mode = (process.env.TELEMETRY_MODE || "mock").toLowerCase()

  //This will load AWS only when it is needed
  if (mode === "aws") {
    const awsService = require("./awsService")
    return awsService.getAwsTelemetry()
  }

  //This will load Azure only when it is needed
  if (mode === "azure") {
    const azureService = require("./azureService")
    return azureService.getAzureTelemetry()
  }

  //This is for the Hybrid mode, which combines AWS and Azure
  if (mode === "hybrid") {
    const awsService = require("./awsService")
    const azureService = require("./azureService")

    const [awsData, azureData] = await Promise.all([
      awsService.getAwsTelemetrySafe(),
      azureService.getAzureTelemetrySafe()
    ])

    return {
      timestamp: new Date().toISOString(),
      provider: "Hybrid",
      sources: [awsData, azureData]
    }
  }

  //This uses mock data as a default
  return mockService.getMockTelemetry()
}

module.exports = {
  getTelemetrySnapshot
}