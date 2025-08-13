# Cursor MCP Configuration

This repository contains the Model Context Protocol (MCP) server configuration and custom servers for Cursor IDE.

## Servers

### Built-in Servers
- **filesystem**: Read/write access to code files
- **terminal**: Run scripts, tests, and linting commands
- **github**: Create branches, PRs, and manage labels

### Custom Servers
- **planner**: Breaks down work into tasks and returns implementation plans
- **qa-docs**: Converts task results to documentation and QA checklists

## Setup

1. Install dependencies for custom servers:
   ```bash
   cd ~/.cursor/mcp-servers/planner && npm install
   cd ~/.cursor/mcp-servers/qa-docs && npm install
   ```

2. Set up GitHub token (for github server):
   ```bash
   export GITHUB_TOKEN=your_github_token_here
   ```

3. Restart Cursor IDE to load the new MCP configuration

## Usage

### Planner Server
- Tool: `break_down_work`
- Parameters: `description`, `complexity` (simple/medium/complex)

### QA/Docs Server
- Tool: `create_documentation`
- Tool: `create_qa_checklist`

## File Structure
```
~/.cursor/
├── mcp.json
└── mcp-servers/
    ├── planner/
    │   ├── package.json
    │   └── server.js
    └── qa-docs/
        ├── package.json
        └── server.js
```

## Repository
- **GitHub**: https://github.com/griffingilreath/cursor-mcp-config
- **Local Path**: `~/.cursor/`
