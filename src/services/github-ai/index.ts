import { GithubAiMcpHandler } from "./GithubAiMcpHandler"

/**
 * Create and start the GitHub AI MCP server
 */
export function startGithubAiMcpServer() {
	// Use dynamic require to avoid import errors
	const { createServer } = require("@modelcontextprotocol/sdk/server")
	const handler = new GithubAiMcpHandler()
	const server = createServer(handler)

	// Start server with stdin/stdout transport
	server.start()

	return server
}

// Auto-start when this module is executed directly
if (require.main === module) {
	startGithubAiMcpServer()
}

// Export all needed components
export * from "./GithubAiClient"
export * from "./GithubAiMcpServer"
export * from "./GithubAiMcpHandler"
