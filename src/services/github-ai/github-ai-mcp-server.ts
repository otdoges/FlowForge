#!/usr/bin/env node

import { GithubAiMcpHandler } from "./GithubAiMcpHandler"

// Use the MCP SDK dynamically to avoid import errors
// The SDK should be available at runtime when used with Cline's MCP infrastructure
const { createServer } = require("@modelcontextprotocol/sdk/server")

// Create and start the server
const handler = new GithubAiMcpHandler()
const server = createServer(handler)
server.start()
