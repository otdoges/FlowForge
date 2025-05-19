import {
	ModelContextProtocolServer,
	Server,
	CallToolResult,
	CallToolParams,
	ListResourcesResult,
	ListToolsResult,
} from "@modelcontextprotocol/sdk/server"
import { GithubAiClient } from "./GithubAiClient"
import { getGithubAiTools } from "./GithubAiMcpServer"

/**
 * Handler class for GitHub AI MCP server
 */
export class GithubAiMcpHandler implements ModelContextProtocolServer {
	private client: GithubAiClient

	constructor() {
		// Initialize with empty token - will be set from environment variable during server start
		this.client = new GithubAiClient("")
	}

	async start(server: Server): Promise<void> {
		// Get token from environment variable
		const token = process.env.GITHUB_TOKEN || ""
		const modelName = process.env.MODEL_NAME || "openai/gpt-4o"

		if (!token) {
			console.error("GitHub AI: No token provided")
			return
		}

		// Initialize client with token
		this.client = new GithubAiClient(token, modelName)
		console.log(`GitHub AI MCP server started with model: ${modelName}`)
	}

	async listTools(): Promise<ListToolsResult> {
		return {
			tools: getGithubAiTools(),
		}
	}

	async listResources(): Promise<ListResourcesResult> {
		return {
			resources: [],
			cursor: null,
		}
	}

	async callTool(params: CallToolParams): Promise<CallToolResult> {
		const { name, arguments: args } = params

		try {
			if (name === "github_ai_completion") {
				const { messages, modelName, temperature, maxTokens } = args as any

				// Set model if provided
				if (modelName) {
					this.client.setModel(modelName)
				}

				// Set up options
				const options: any = {}
				if (temperature !== undefined) options.temperature = temperature
				if (maxTokens !== undefined) options.max_tokens = maxTokens

				const completion = await this.client.createChatCompletion(messages, options)

				return {
					result: {
						content: completion.choices[0].message.content,
						finish_reason: completion.choices[0].finish_reason,
						usage: completion.usage,
					},
				}
			} else if (name === "github_ai_get_models") {
				const models = await this.client.listModels()
				return {
					result: models,
				}
			}

			throw new Error(`Unknown tool: ${name}`)
		} catch (error) {
			console.error(`Error calling tool ${name}:`, error)
			return {
				error: {
					message: error instanceof Error ? error.message : String(error),
				},
			}
		}
	}
}
