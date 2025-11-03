# AI Gateway API Documentation

**Version**: 1.0.0
**Status**: Active

## Overview

The AI Gateway provides a centralized, server-side interface for interacting with third-party Large Language Models (LLMs). It is designed to abstract away the complexity of specific LLM providers, improve security by managing API keys on the server, and provide a single point for caching and cost management.

All frontend components that require AI-powered text generation should use this gateway instead of calling LLM providers directly.

## Endpoint

- **URL**: `/api/ai/generate`
- **Method**: `POST`

## Request Body

The request body must be a JSON object with the following structure:

```json
{
  "task": "<task_name>",
  "prompt": "<user_prompt>",
  "context": "<optional_context>"
}
```

- **`task`** (string, required): The specific task to be performed. This helps in categorizing requests and can be used for differentiated prompt engineering on the backend. Valid tasks are:
  - `generate_title`
  - `generate_outline`
  - `paraphrase_text`
  - `check_grammar`

- **`prompt`** (string, required): The main input or question from the user.

- **`context`** (string, optional): Any additional context, such as existing text, that the LLM should consider.

## Success Response (200 OK)

The response for a successful generation is a JSON object containing the result.

```json
{
  "result": "<The AI-generated text>"
}
```

## Error Responses

- **400 Bad Request**: Returned if the request body is not valid JSON or if it fails schema validation (e.g., missing `prompt` or invalid `task`).
- **500 Internal Server Error**: Returned if an unexpected error occurs on the server or if the upstream LLM provider returns an error.

## Example Usage (Client-side fetch)

```javascript
async function getAIGeneratedTitle(topic) {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      task: 'generate_title', 
      prompt: topic 
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate title');
  }

  const data = await response.json();
  return data.result;
}
```
