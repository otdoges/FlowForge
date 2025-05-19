import OpenAI from "openai"
import { ChatCompletionCreateParams } from "openai/resources/chat/completions"

export class GithubAiClient {
	private client: OpenAI
	private modelName: string

	constructor(token: string, modelName: string = "openai/gpt-4o") {
		this.client = new OpenAI({
			baseURL: "https://models.github.ai/inference",
			apiKey: token,
		})
		this.modelName = modelName
	}

	/**
	 * Sends a chat completion request to GitHub AI models
	 */
	async createChatCompletion(
		messages: ChatCompletionCreateParams["messages"],
		options: Partial<Omit<ChatCompletionCreateParams, "messages" | "model">> = {},
	) {
		return this.client.chat.completions.create({
			messages,
			model: this.modelName,
			...options,
		})
	}

	/**
	 * Creates a streaming chat completion
	 */
	async createStreamingChatCompletion(
		messages: ChatCompletionCreateParams["messages"],
		options: Partial<Omit<ChatCompletionCreateParams, "messages" | "model" | "stream">> = {},
	) {
		return this.client.chat.completions.create({
			messages,
			model: this.modelName,
			stream: true,
			...options,
		})
	}

	/**
	 * Creates a function-calling completion with tools
	 */
	async createToolChatCompletion(
		messages: ChatCompletionCreateParams["messages"],
		tools: ChatCompletionCreateParams["tools"],
		options: Partial<Omit<ChatCompletionCreateParams, "messages" | "model" | "tools">> = {},
	) {
		return this.client.chat.completions.create({
			messages,
			model: this.modelName,
			tools,
			...options,
		})
	}

	/**
	 * Gets the available models from GitHub AI
	 */
	async listModels() {
		// GitHub AI currently supports these models
		return [
			{ id: "openai/gpt-4o", name: "GPT-4o" },
			{ id: "openai/o4-mini", name: "GPT-4o Mini" },
			{ id: "openai/gpt-4.1", name: "GPT-4.1" },
		]
	}

	/**
	 * Sets the model to use for completions
	 */
	setModel(modelName: string) {
		this.modelName = modelName
	}
}
