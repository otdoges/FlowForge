import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js"
import * as path from "path"
import { McpServerConfig } from "@services/mcp/McpHub"
import { DEFAULT_MCP_TIMEOUT_SECONDS, McpTool } from "@shared/mcp"

/**
 * GitHub AI MCP Server configuration
 */
export interface GithubAiConfig {
	transportType: "sse"
	url: string
	token: string
	modelName: string
	disabled?: boolean
	autoApprove?: string[]
	timeout?: number
}

/**
 * Creates a GitHub AI MCP server config
 */
export function createGithubAiMcpConfig(
	token: string,
	modelName: string = "openai/gpt-4o",
	disabled: boolean = false,
): McpServerConfig {
	return {
		transportType: "sse",
		url: "https://models.github.ai/inference",
		disabled,
		timeout: DEFAULT_MCP_TIMEOUT_SECONDS,
		// Token and model name will be passed via environment variables when starting the server
		// The actual env variables are handled during server initialization
	}
}

/**
 * Returns the list of tools supported by the GitHub AI MCP server
 */
export function getGithubAiTools(): McpTool[] {
	return [
		{
			name: "github_ai_completion",
			description: "Call the GitHub AI model to generate a completion response",
			inputSchema: {
				type: "object",
				properties: {
					messages: {
						type: "array",
						description: "The messages to send to the model",
						items: {
							type: "object",
							properties: {
								role: {
									type: "string",
									description: "The role of the message sender (system, user, assistant)",
								},
								content: {
									type: "string",
									description: "The content of the message",
								},
							},
							required: ["role", "content"],
						},
					},
					modelName: {
						type: "string",
						description: "The model name to use (e.g., openai/gpt-4o, openai/o4-mini)",
					},
					temperature: {
						type: "number",
						description:
							"Controls randomness. Higher values like 0.8 produce more random outputs, lower values like 0.2 make them more focused and deterministic.",
					},
					maxTokens: {
						type: "number",
						description: "The maximum number of tokens to generate",
					},
				},
				required: ["messages"],
			},
		},
		{
			name: "github_ai_get_models",
			description: "Get a list of available models from GitHub AI",
			inputSchema: {
				type: "object",
				properties: {},
				required: [],
			},
		},
	]
}
