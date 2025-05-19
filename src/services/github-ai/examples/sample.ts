import { GithubAiClient } from "../GithubAiClient"

// Create GitHub AI client with token from environment variable
const token = process.env.GITHUB_TOKEN || ""
if (!token) {
	console.error("Error: GITHUB_TOKEN environment variable not set")
	process.exit(1)
}

// Example 1: Basic Chat Completion
async function basicChatCompletion() {
	console.log("=== Basic Chat Completion ===")

	const client = new GithubAiClient(token, "openai/gpt-4o")

	const response = (await client.createChatCompletion(
		[
			{ role: "system", content: "You are a helpful assistant." },
			{ role: "user", content: "What is the capital of France?" },
		],
		{
			temperature: 1.0,
			max_tokens: 1000,
		},
	)) as any

	console.log("Response:", response.choices[0].message.content)
	console.log("Tokens Used:", response.usage)
	console.log("\n")
}

// Example 2: Streaming Chat Completion
async function streamingChatCompletion() {
	console.log("=== Streaming Chat Completion ===")

	const client = new GithubAiClient(token, "openai/gpt-4o")

	const stream = await client.createStreamingChatCompletion([
		{ role: "system", content: "You are a helpful assistant." },
		{ role: "user", content: "Give me 5 good reasons why I should exercise every day." },
	])

	console.log("Response:")
	let content = ""
	for await (const part of stream as any) {
		const text = (part as any).choices[0]?.delta?.content || ""
		content += text
		process.stdout.write(text)
	}
	console.log("\n\n")
}

// Example 3: Function Calling with Tools
async function functionCallingWithTools() {
	console.log("=== Function Calling with Tools ===")

	const client = new GithubAiClient(token, "openai/gpt-4o")

	// Define a function for flight information
	function getFlightInfo({ originCity, destinationCity }: { originCity: string; destinationCity: string }) {
		if (originCity === "Seattle" && destinationCity === "Miami") {
			return JSON.stringify({
				airline: "Delta",
				flight_number: "DL123",
				flight_date: "May 7th, 2024",
				flight_time: "10:00AM",
			})
		}
		return JSON.stringify({ error: "No flights found between the cities" })
	}

	const namesToFunctions = {
		getFlightInfo: (data: any) => getFlightInfo(data),
	}

	const tool = {
		type: "function" as const,
		function: {
			name: "getFlightInfo",
			description:
				"Returns information about the next flight between two cities. " +
				"This includes the name of the airline, flight number and the date and time " +
				"of the next flight",
			parameters: {
				type: "object",
				properties: {
					originCity: {
						type: "string",
						description: "The name of the city where the flight originates",
					},
					destinationCity: {
						type: "string",
						description: "The flight destination city",
					},
				},
				required: ["originCity", "destinationCity"],
			},
		},
	}

	let messages = [
		{ role: "system", content: "You are an assistant that helps users find flight information." },
		{ role: "user", content: "I'm interested in going to Miami. What is the next flight there from Seattle?" },
	]

	let response = await client.createToolChatCompletion(messages as any, [tool as any])

	// We expect the model to ask for a tool call
	if ((response as any).choices[0].finish_reason === "tool_calls") {
		// Append the model response to the chat history
		messages.push((response as any).choices[0].message as any)

		// We expect a single tool call
		if ((response as any).choices[0].message && (response as any).choices[0].message.tool_calls?.length === 1) {
			const toolCall = (response as any).choices[0].message.tool_calls[0]

			// We expect the tool to be a function call
			if (toolCall.type === "function") {
				// Parse the function call arguments and call the function
				const functionArgs = JSON.parse(toolCall.function.arguments)
				console.log(`Calling function \`${toolCall.function.name}\` with arguments ${toolCall.function.arguments}`)
				const callableFunc = namesToFunctions[toolCall.function.name as keyof typeof namesToFunctions]
				const functionReturn = callableFunc(functionArgs)
				console.log(`Function returned = ${functionReturn}`)

				// Append the function call result to the chat history
				messages.push({
					tool_call_id: toolCall.id,
					role: "tool",
					name: toolCall.function.name,
					content: functionReturn,
				} as any)

				response = await client.createToolChatCompletion(messages as any, [tool as any])
				console.log(`Model response = ${(response as any).choices[0].message.content}`)
			}
		}
	}
	console.log("\n")
}

// Run examples
async function runExamples() {
	try {
		await basicChatCompletion()
		await streamingChatCompletion()
		await functionCallingWithTools()
	} catch (error) {
		console.error("Error running examples:", error)
	}
}

runExamples()
