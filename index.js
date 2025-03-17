#!/usr/bin/env node

'use strict';

const path = require('path');
const spawn = require('cross-spawn');
const fs = require('fs');

/**
 * Main function to start the Instagram DM MCP server
 */
function startServer(options = {}) {
  const pythonPath = options.pythonPath || 'python3';
  const serverPath = path.join(__dirname, 'server.py');
  
  // Check if server.py exists
  if (!fs.existsSync(serverPath)) {
    console.error('Error: server.py not found');
    process.exit(1);
  }
  
  // Prepare environment variables
  const env = { ...process.env };
  
  if (options.sessionId) env.INSTAGRAM_SESSION_ID = options.sessionId;
  if (options.csrfToken) env.INSTAGRAM_CSRF_TOKEN = options.csrfToken;
  if (options.dsUserId) env.INSTAGRAM_DS_USER_ID = options.dsUserId;
  
  // Start the server using fastmcp
  const args = ['install', serverPath];
  
  // Add environment variables if available
  if (options.sessionId) args.push('-e', `INSTAGRAM_SESSION_ID=${options.sessionId}`);
  if (options.csrfToken) args.push('-e', `INSTAGRAM_CSRF_TOKEN=${options.csrfToken}`);
  if (options.dsUserId) args.push('-e', `INSTAGRAM_DS_USER_ID=${options.dsUserId}`);
  
  // Try to find fastmcp in multiple possible locations
  let fastmcpBin = 'fastmcp';
  const possiblePaths = [
    path.join(__dirname, 'node_modules', '.bin', 'fastmcp'),
    path.join(process.cwd(), 'node_modules', '.bin', 'fastmcp'),
    '/Library/Frameworks/Python.framework/Versions/3.13/bin/fastmcp',
    '/usr/local/bin/fastmcp',
    '/usr/bin/fastmcp'
  ];
  
  for (const binPath of possiblePaths) {
    if (fs.existsSync(binPath)) {
      fastmcpBin = binPath;
      console.error(`Using fastmcp at: ${binPath}`);
      break;
    }
  }
  
  try {
    // First try with fastmcp
    const result = spawn.sync(fastmcpBin, args, { 
      stdio: 'inherit',
      env
    });
    
    // Handle fastmcp errors
    if (result.error) {
      console.error(`fastmcp error: ${result.error.message}`);
      
      // If command not found, try running the server directly with Python
      if (result.error.code === 'ENOENT') {
        console.error('Attempting to run server directly with Python...');
        
        // Try with python3 or python
        const pythonBins = ['python3', 'python'];
        
        for (const pythonBin of pythonBins) {
          try {
            console.error(`Trying with ${pythonBin}...`);
            const pythonResult = spawn.sync(pythonBin, [serverPath], {
              stdio: 'inherit',
              env
            });
            
            if (!pythonResult.error) {
              console.log(`Server started with ${pythonBin}`);
              return pythonResult.status;
            }
          } catch (pythonError) {
            console.error(`Error with ${pythonBin}: ${pythonError.message}`);
          }
        }
        
        console.error('All attempts to start the server failed');
        return 1;
      }
      
      return result.status || 1;
    }
    
    console.log('Instagram DM MCP server started successfully!');
    return result.status;
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
    return 1;
  }
}

module.exports = {
  startServer
};

// Allow direct execution
if (require.main === module) {
  startServer();
}
