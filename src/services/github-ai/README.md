# GitHub AI Integration for Cline

This module adds GitHub AI language model support to Cline through a Model Context Protocol (MCP) server.

## Overview

The GitHub AI integration allows Cline to use GitHub's AI model inference endpoints without authentication within the Cline UI, as the authentication is handled via a GitHub Personal Access Token (PAT).

## Supported Models

- `openai/gpt-4o` - GPT-4o
- `openai/o4-mini` - GPT-4o Mini
- `openai/gpt-4.1` - GPT-4.1

## Setup

### 1. Create a GitHub Personal Access Token (PAT)

1. Create a personal access token in your GitHub settings
2. Give the token the `models:read` permission
3. Set the environment variable:

```bash
export GITHUB_TOKEN="your-github-token-here"
```

### 2. Using the MCP Server

To use the GitHub AI models in Cline, add the following to your MCP settings:

```json
{
  "mcpServers": {
    "github-ai": {
      "transportType": "sse",
      "url": "https://models.github.ai/inference",
      "timeout": 60
    }
  }
}
```

## Usage Examples

See the `examples` directory for sample code showing how to:

1. Use basic chat completions
2. Stream responses
3. Use function calling capabilities 

## Implementation Details

The integration consists of:

- `GithubAiClient.ts` - Client for GitHub AI models using OpenAI SDK
- `GithubAiMcpServer.ts` - MCP server configuration
- `GithubAiMcpHandler.ts` - Implementation of MCP server handler

## License

Same as the main Cline license.
