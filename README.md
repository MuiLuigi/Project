# Cloud-Native Network Monitoring Dashboard Project

## Overview
This project is a Node.js real-time monitoring dashboard that collects sample telemetry from cloud monitoring sources and visualizes latency and bandwidth of that data in a web interface.

## Features
- Real-time dashboard using Socket.IO
- Live latency and bandwidth charts that actively update
- Support for:
  - AWS CloudWatch
  - Azure Monitor
  - Mock Telemetry
- REST API endpoints for health and latest snapshot

## Technologies Used
- Node.js
- Express
- Socket.IO
- Chart.js
- AWS SDK
- Azure Monitor Query SDK

## Setup
1. Clone the repository
2. Run `npm install`
3. Configure `.env`
4. Start with `npm start`
5. Open `http://localhost:3000`

## Environment Modes
- `mock`
- `aws`
- `azure`
- `hybrid`

## API Endpoints
- `/api/health`
- `/api/latest`

## Project Purpose
This dashboard demonstrates cloud-native monitoring, real-time communication, and telemetry visualization via charts.

## Author
Fahad Arif