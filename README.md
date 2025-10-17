[![Add to Cursor](https://fastmcp.me/badges/cursor_dark.svg)](https://fastmcp.me/MCP/Details/549/instagram-direct-messages)
[![Add to VS Code](https://fastmcp.me/badges/vscode_dark.svg)](https://fastmcp.me/MCP/Details/549/instagram-direct-messages)
[![Add to Claude](https://fastmcp.me/badges/claude_dark.svg)](https://fastmcp.me/MCP/Details/549/instagram-direct-messages)
[![Add to ChatGPT](https://fastmcp.me/badges/chatgpt_dark.svg)](https://fastmcp.me/MCP/Details/549/instagram-direct-messages)
[![Add to Codex](https://fastmcp.me/badges/codex_dark.svg)](https://fastmcp.me/MCP/Details/549/instagram-direct-messages)
[![Add to Gemini](https://fastmcp.me/badges/gemini_dark.svg)](https://fastmcp.me/MCP/Details/549/instagram-direct-messages)

# Instagram DM MCP Server

An MCP (Model-Consumer Protocol) server for Instagram direct messaging functionality, built with `fastmcp` and `instagrapi`. This server enables AI assistants to read and send Instagram direct messages.

**Current Version: 1.3.5**

## Features

- Read recent direct messages from your Instagram inbox with comprehensive thread information
- Send direct messages to Instagram users
- Simple greeting resource (example functionality)
- Health check endpoint with status information
- Proper logging to stderr to avoid JSON parsing issues
- Support for various authentication methods, including environment variables

## Installation

### As an npm package (recommended)

1. Install the package globally:

```bash
npm install -g instagram-dm-mcp
```

2. Run the setup script to install Python dependencies:

```bash
instagram-dm-mcp-setup
```

3. Register the server with Claude Desktop and configure credentials:

```bash
instagram-dm-mcp install
```

You will be prompted to paste in your Instagram cookies information. If you arne't sure how to get this, log into Instagram on Chrome, right-click on the page, and select "Inspect". Go to the "Application" tab, then click on "Cookies" in the left sidebar. You should see a list of cookies. Copy the values for `sessionid`, `csrftoken`, and `ds_user_id`.

The `install` command will automatically register the Instagram DM MCP server with Claude Desktop and add it to your Claude Desktop configuration file. The command will configure the server to use the `npx` approach, which makes it easier to maintain. You can also copy-paste the same setup to Claude or any other MCP client.

You can provide Instagram credentials in several ways:

- Using command-line arguments:
  ```bash
  instagram-dm-mcp install --session-id YOUR_SESSION_ID --csrf-token YOUR_CSRF_TOKEN --ds-user-id YOUR_DS_USER_ID
  ```

- Using a credentials file:
  ```bash
  instagram-dm-mcp install --from-file /path/to/instagram_cookies.json
  ```

- Using environment variables (INSTAGRAM_SESSION_ID, INSTAGRAM_CSRF_TOKEN, and INSTAGRAM_DS_USER_ID)

The installer will add these credentials as environment variables in the Claude Desktop configuration file, creating a configuration like this:

```json
"mcpServers": {
  // other servers...
  "InstagramDM": {
    "command": "npx",
    "args": [
      "-y",
      "instagram-dm-mcp",
      "start"
    ],
    "env": {
      "INSTAGRAM_SESSION_ID": "your-session-id",
      "INSTAGRAM_CSRF_TOKEN": "your-csrf-token",
      "INSTAGRAM_DS_USER_ID": "your-ds-user-id"
    }
  }
}
```
