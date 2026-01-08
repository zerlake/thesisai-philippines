# Excalidraw MCP Server

An MCP (Model Context Protocol) server that provides AI-powered diagram generation capabilities for Excalidraw.

## Features

- Generate Excalidraw diagrams from natural language prompts
- Create various diagram types (architecture, flowcharts, system diagrams)
- MCP protocol compliant for integration with AI assistants like Claude

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## API Endpoints

- `GET /health` - Health check
- `POST /generate` - Generate diagram from prompt
- `GET /elements` - List elements (not implemented in mock)
- `POST /elements` - Create element (not implemented in mock)
- `POST /elements/batch` - Create multiple elements (not implemented in mock)
- `GET /elements/:id` - Get element by ID (not implemented in mock)
- `PUT /elements/:id` - Update element (not implemented in mock)
- `DELETE /elements/:id` - Delete element (not implemented in mock)

## Environment Variables

- `PORT` - Server port (default: 3001)

## Integration with Claude Desktop

To use this server with Claude Desktop, add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "excalidraw": {
      "command": "node",
      "args": ["path/to/mcp_excalidraw/dist/index.js"],
      "env": {
        "PORT": "3001"
      }
    }
  }
}
```

## Example Usage

Send a POST request to `/generate` with a prompt:

```json
{
  "prompt": "Create a system architecture diagram with a frontend, backend, and database"
}
```

Response:
```json
{
  "success": true,
  "elements": [...],
  "message": "Diagram generated successfully",
  "count": 5
}
```

## License

MIT