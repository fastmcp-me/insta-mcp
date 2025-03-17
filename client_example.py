#!/usr/bin/env python3
"""
Example client for the Instagram DM MCP server.
This script demonstrates how to interact with the server using simple HTTP requests.
"""

import requests
import json
import sys

# Server URL
SERVER_URL = "http://localhost:8080"

def call_mcp_method(method, params=None):
    """Call an MCP method on the server."""
    if params is None:
        params = {}
    
    payload = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": 1
    }
    
    try:
        response = requests.post(SERVER_URL, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error communicating with the server: {e}")
        return None

def read_dms(limit=10):
    """Read recent Instagram DMs."""
    result = call_mcp_method("read_dms", {"limit": limit})
    if result and "result" in result:
        return result["result"]
    elif result and "error" in result:
        print(f"Error: {result['error']}")
    return None

def send_dm(username, message):
    """Send a DM to a user."""
    result = call_mcp_method("send_dm", {"username": username, "message": message})
    if result and "result" in result:
        return result["result"]
    elif result and "error" in result:
        print(f"Error: {result['error']}")
    return None

def get_greeting(name):
    """Get a greeting."""
    result = call_mcp_method("get_greeting", {"name": name})
    if result and "result" in result:
        return result["result"]
    elif result and "error" in result:
        print(f"Error: {result['error']}")
    return None

def health_check():
    """Check server health."""
    result = call_mcp_method("health_check")
    if result and "result" in result:
        return result["result"]
    elif result and "error" in result:
        print(f"Error: {result['error']}")
    return None

def print_help():
    """Print help information."""
    print("Instagram DM MCP Client Example")
    print("Available commands:")
    print("  read [limit]                - Read recent DMs (default limit: 10)")
    print("  send <username> <message>   - Send a DM to a user")
    print("  greet <name>                - Get a greeting for a name")
    print("  health                      - Check server health")
    print("  help                        - Show this help information")
    print("  exit                        - Exit the client")

def main():
    """Main function for the client."""
    print("Instagram DM MCP Client")
    print("Type 'help' for available commands.")
    
    if len(sys.argv) > 1:
        # Process command-line arguments
        command = sys.argv[1]
        if command == "read":
            limit = int(sys.argv[2]) if len(sys.argv) > 2 else 10
            result = read_dms(limit)
            if result:
                print(json.dumps(result, indent=2))
        elif command == "send" and len(sys.argv) > 3:
            username = sys.argv[2]
            message = " ".join(sys.argv[3:])
            result = send_dm(username, message)
            if result:
                print(json.dumps(result, indent=2))
        elif command == "greet" and len(sys.argv) > 2:
            name = sys.argv[2]
            result = get_greeting(name)
            if result:
                print(result)
        elif command == "health":
            result = health_check()
            if result:
                print(json.dumps(result, indent=2))
        elif command == "help":
            print_help()
        else:
            print("Unknown command. Type 'help' for available commands.")
    else:
        # Interactive mode
        while True:
            try:
                cmd = input("> ").strip().split()
                if not cmd:
                    continue
                
                command = cmd[0].lower()
                
                if command == "exit":
                    break
                elif command == "help":
                    print_help()
                elif command == "read":
                    limit = int(cmd[1]) if len(cmd) > 1 else 10
                    result = read_dms(limit)
                    if result:
                        print(json.dumps(result, indent=2))
                elif command == "send" and len(cmd) > 2:
                    username = cmd[1]
                    message = " ".join(cmd[2:])
                    result = send_dm(username, message)
                    if result:
                        print(json.dumps(result, indent=2))
                elif command == "greet" and len(cmd) > 1:
                    name = cmd[1]
                    result = get_greeting(name)
                    if result:
                        print(result)
                elif command == "health":
                    result = health_check()
                    if result:
                        print(json.dumps(result, indent=2))
                else:
                    print("Unknown command. Type 'help' for available commands.")
            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"Error: {e}")

if __name__ == "__main__":
    main()
