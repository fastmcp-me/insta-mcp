from fastmcp import FastMCP
import instagrapi
import json
import os
import sys
import logging
from typing import Dict, Any
import time

# Set up logging to stderr instead of stdout
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s',
    datefmt='%m/%d/%y %H:%M:%S',
    stream=sys.stderr
)

# Version information
VERSION = "1.3.5"

# Force all stdout to go to stderr
# This is to prevent any accidental print statements from breaking the MCP protocol
sys.stdout = sys.stderr

# Track startup time
startup_time = time.time()

# Initialize the MCP server
mcp = FastMCP("InstagramDM", version=VERSION, dependencies=["instagrapi"])

# Load Instagram credentials from environment variables or cookie file
cookies = {}

# First try getting credentials directly from environment variables (preferred method)
sessionid = os.environ.get("INSTAGRAM_SESSION_ID")
csrftoken = os.environ.get("INSTAGRAM_CSRF_TOKEN")
ds_user_id = os.environ.get("INSTAGRAM_DS_USER_ID")

if sessionid and csrftoken and ds_user_id:
    cookies = {
        "sessionid": sessionid,
        "csrftoken": csrftoken,
        "ds_user_id": ds_user_id
    }
    logging.info("Using Instagram credentials from environment variables")
# Otherwise, fall back to legacy format from either env or file
elif os.environ.get("INSTAGRAM_COOKIES"):
    try:
        cookies = json.loads(os.environ.get("INSTAGRAM_COOKIES", "{}"))
        logging.info("Using Instagram credentials from INSTAGRAM_COOKIES environment variable")
    except json.JSONDecodeError:
        logging.error("INSTAGRAM_COOKIES environment variable is not valid JSON")
# Last resort: try loading from file
elif os.path.exists("instagram_cookies.json"):
    try:
        with open("instagram_cookies.json", "r") as f:
            cookies = json.load(f)
        logging.info("Using Instagram credentials from cookies file")
    except json.JSONDecodeError:
        logging.error("instagram_cookies.json is not valid JSON")

# Initialize Instagram client
client = instagrapi.Client()
try:
    # Handle the cookies dict correctly
    if cookies and 'sessionid' in cookies:
        sessionid = cookies.get('sessionid')
        client.login_by_sessionid(sessionid)
        logging.info("Successfully logged in with session ID")
    else:
        logging.warning("No valid Instagram session found. You need to set cookies.")
except Exception as e:
    logging.error(f"Failed to initialize Instagram client: {e}")
    # Continue without raising to allow server to start

# Tool: Read recent DMs
@mcp.tool()
def read_dms(limit: int = 10) -> Dict[str, Any]:
    """Read recent Instagram DMs from the inbox.
    
    Args:
        limit (int): Number of threads/messages to fetch (default: 10)
    
    Returns:
        dict: List of messages with sender, text, and timestamp
    """
    try:
        inbox = client.direct_threads(amount=limit)
        messages = []
        for thread in inbox:
            thread_info = {
                "thread_id": thread.id,
                "thread_title": thread.thread_title,
                "users": [user.username for user in thread.users if hasattr(user, 'username')],
            }
            
            for msg in thread.messages:
                sender_username = None
                # Safely get username if possible
                try:
                    sender_username = next((user.username for user in thread.users if hasattr(user, 'username') and user.pk == msg.user_id), None)
                except:
                    pass
                
                messages.append({
                    "thread": thread_info,
                    "sender_id": msg.user_id,
                    "sender": sender_username,
                    "text": msg.text,
                    "timestamp": msg.timestamp.isoformat() if msg.timestamp else None
                })
        return {"status": "success", "messages": messages}
    except Exception as e:
        logging.error(f"Error reading DMs: {e}")
        return {"status": "error", "message": str(e)}

# Tool: Send a DM
@mcp.tool()
def send_dm(username: str, message: str) -> Dict[str, Any]:
    """Send a direct message to an Instagram user.
    
    Args:
        username (str): Instagram username of the recipient
        message (str): Message content to send
    
    Returns:
        dict: Status of the operation
    """
    if not username or not message:
        return {"status": "error", "message": "Username and message are required"}
    try:
        recipient_id = client.user_id_from_username(username)
        result = client.direct_send(message, [recipient_id])
        logging.info(f"Successfully sent DM to {username}")
        return {"status": "success", "message": f"Sent DM to {username}"}
    except Exception as e:
        logging.error(f"Error sending DM to {username}: {e}")
        return {"status": "error", "message": str(e)}

# Resource: Dynamic greeting (keeping your example)
@mcp.resource("greeting://{name}")
def get_greeting(name: str) -> str:
    """Get a personalized greeting.
    
    Args:
        name (str): Name to include in the greeting
    
    Returns:
        str: Personalized greeting
    """
    return f"Hello, {name}!"

# Health check tool
@mcp.tool()
def health_check() -> Dict[str, str]:
    """Check the server's health status."""
    # Simplified health check to avoid potential issues
    is_logged_in = hasattr(cl, 'user_id') and cl.user_id is not None
    
    result = {
        "status": "healthy",
        "service": "InstagramDM MCP Server",
        "version": VERSION,
        "logged_in": str(is_logged_in)
    }
    
    logging.info(f"Health check completed with status: {result['status']}")
    return result
if __name__ == "__main__":
    # Run the MCP server
    logging.info("Starting Instagram DM MCP Server...")
    mcp.run()
