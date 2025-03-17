#!/usr/bin/env node

'use strict';

const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { startServer } = require('./index');
const fs = require('fs');
const path = require('path');
const packageJson = require('./package.json');

program
  .version(packageJson.version)
  .description('Instagram Direct Messages MCP server for Claude Desktop');

program
  .command('start')
  .description('Start the Instagram DM MCP server')
  .option('-s, --session-id <id>', 'Instagram session ID')
  .option('-c, --csrf-token <token>', 'Instagram CSRF token')
  .option('-d, --ds-user-id <id>', 'Instagram DS user ID')
  .option('--from-file <path>', 'Load credentials from JSON file')
  .action(async (options) => {
    let credentials = {};
    
    // Check for credentials in environment variables
    const envSessionId = process.env.INSTAGRAM_SESSION_ID;
    const envCsrfToken = process.env.INSTAGRAM_CSRF_TOKEN;
    const envDsUserId = process.env.INSTAGRAM_DS_USER_ID;
    
    if (envSessionId && envCsrfToken && envDsUserId) {
      console.error(chalk.green('Using Instagram credentials from environment variables'));
      credentials = {
        sessionId: envSessionId,
        csrfToken: envCsrfToken,
        dsUserId: envDsUserId
      };
    }
    // Check CLI options
    else if (options.sessionId && options.csrfToken && options.dsUserId) {
      console.error(chalk.green('Using Instagram credentials from command-line arguments'));
      credentials = {
        sessionId: options.sessionId,
        csrfToken: options.csrfToken,
        dsUserId: options.dsUserId
      };
    }
    // Load from file if specified
    else if (options.fromFile) {
      try {
        const filePath = path.resolve(options.fromFile);
        console.error(chalk.blue(`Loading credentials from ${filePath}`));
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const cookiesJson = JSON.parse(fileContent);
        
        credentials = {
          sessionId: cookiesJson.sessionid || cookiesJson.sessionId,
          csrfToken: cookiesJson.csrftoken || cookiesJson.csrfToken,
          dsUserId: cookiesJson.ds_user_id || cookiesJson.dsUserId
        };
      } catch (error) {
        console.error(chalk.red(`Error loading credentials from file: ${error.message}`));
        process.exit(1);
      }
    }
    // Prompt for credentials if not provided
    else {
      console.error(chalk.yellow('Instagram credentials not found, please enter them manually:'));
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'sessionId',
          message: 'Instagram Session ID:',
          validate: input => input.trim() !== ''
        },
        {
          type: 'input',
          name: 'csrfToken',
          message: 'Instagram CSRF Token:',
          validate: input => input.trim() !== ''
        },
        {
          type: 'input',
          name: 'dsUserId',
          message: 'Instagram DS User ID:',
          validate: input => input.trim() !== ''
        },
        {
          type: 'confirm',
          name: 'saveToFile',
          message: 'Save credentials to instagram_cookies.json?',
          default: false
        }
      ]);
      
      credentials = {
        sessionId: answers.sessionId,
        csrfToken: answers.csrfToken,
        dsUserId: answers.dsUserId
      };
      
      // Save to file if requested
      if (answers.saveToFile) {
        try {
          const cookiesJson = {
            sessionid: answers.sessionId,
            csrftoken: answers.csrfToken,
            ds_user_id: answers.dsUserId
          };
          
          fs.writeFileSync('instagram_cookies.json', JSON.stringify(cookiesJson, null, 2));
          console.error(chalk.green('Credentials saved to instagram_cookies.json'));
        } catch (error) {
          console.error(chalk.red(`Error saving credentials: ${error.message}`));
        }
      }
    }
    
    // Start the server with the obtained credentials
    console.error(chalk.blue('Starting Instagram DM MCP server...'));
    
    try {
      const result = startServer(credentials);
      if (result.status !== 0) {
        console.error(chalk.red(`Server exited with code ${result.status}`));
        if (result.error) {
          console.error(chalk.red(`Error: ${result.error.message}`));
        }
        process.exit(result.status);
      }
    } catch (error) {
      console.error(chalk.red(`Failed to start server: ${error.message}`));
      process.exit(1);
    }
  });

// Install command
program
  .command('install')
  .description('Install the Instagram DM MCP server in Claude Desktop')
  .option('-s, --session-id <id>', 'Instagram session ID')
  .option('-c, --csrf-token <token>', 'Instagram CSRF token')
  .option('-d, --ds-user-id <id>', 'Instagram DS user ID')
  .option('--from-file <path>', 'Load credentials from JSON file')
  .action(async (options) => {
    // Redirect all console.log to console.error to ensure we don't break the MCP JSON protocol
    const originalConsoleLog = console.log;
    console.log = console.error;
    
    console.error(chalk.blue('Installing Instagram DM MCP server in Claude Desktop...'));
    
    // Get the path to the server.py file
    const serverPath = path.resolve(__dirname, 'server.py');
    
    if (!fs.existsSync(serverPath)) {
      console.error(chalk.red(`Error: server.py not found at ${serverPath}`));
      process.exit(1);
    }
    
    // Get Instagram credentials
    let credentials = {};
    
    // Try environment variables first
    const envSessionId = process.env.INSTAGRAM_SESSION_ID;
    const envCsrfToken = process.env.INSTAGRAM_CSRF_TOKEN;
    const envDsUserId = process.env.INSTAGRAM_DS_USER_ID;
    
    if (envSessionId && envCsrfToken && envDsUserId) {
      console.error(chalk.green('Using Instagram credentials from environment variables'));
      credentials = {
        sessionId: envSessionId,
        csrfToken: envCsrfToken,
        dsUserId: envDsUserId
      };
    }
    // Check CLI options
    else if (options.sessionId && options.csrfToken && options.dsUserId) {
      console.error(chalk.green('Using Instagram credentials from command-line arguments'));
      credentials = {
        sessionId: options.sessionId,
        csrfToken: options.csrfToken,
        dsUserId: options.dsUserId
      };
    }
    // Check for credentials file
    else if (options.fromFile) {
      try {
        const filePath = path.resolve(options.fromFile);
        console.error(chalk.blue(`Loading credentials from ${filePath}`));
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const cookiesJson = JSON.parse(fileContent);
        
        credentials = {
          sessionId: cookiesJson.sessionid,
          csrfToken: cookiesJson.csrftoken,
          dsUserId: cookiesJson.ds_user_id
        };
      } catch (error) {
        console.error(chalk.red(`Error loading credentials from file: ${error.message}`));
        process.exit(1);
      }
    }
    // Try loading from default file location
    else if (fs.existsSync(path.resolve(process.cwd(), 'instagram_cookies.json'))) {
      try {
        const filePath = path.resolve(process.cwd(), 'instagram_cookies.json');
        console.error(chalk.blue(`Loading credentials from ${filePath}`));
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const cookiesJson = JSON.parse(fileContent);
        
        credentials = {
          sessionId: cookiesJson.sessionid,
          csrfToken: cookiesJson.csrftoken,
          dsUserId: cookiesJson.ds_user_id
        };
      } catch (error) {
        console.error(chalk.red(`Error loading credentials from file: ${error.message}`));
        console.error(chalk.yellow('Continuing with credential prompts...'));
      }
    } else {
      console.error(chalk.blue('No Instagram credentials found. Please enter them manually:'));
      
      // Prompt for credentials
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stderr // Use stderr to avoid interfering with JSON output
      });
      
      // Create a promise-based prompt function
      const prompt = (question) => new Promise((resolve) => {
        rl.question(question, (answer) => resolve(answer.trim()));
      });
      
      try {
        // Wait for user input
        credentials.sessionId = await prompt(chalk.cyan('Enter your Instagram Session ID: '));
        credentials.csrfToken = await prompt(chalk.cyan('Enter your Instagram CSRF Token: '));
        credentials.dsUserId = await prompt(chalk.cyan('Enter your Instagram DS User ID: '));
        
        // Close the readline interface
        rl.close();
        
        // Check if the user provided all credentials
        if (!credentials.sessionId || !credentials.csrfToken || !credentials.dsUserId) {
          console.error(chalk.yellow('\nSome credentials were not provided.'));
          console.error(chalk.yellow('You can add them later in the Claude Desktop config file.'));
        } else {
          console.error(chalk.green('\nCredentials entered successfully!'));
        }
      } catch (error) {
        rl.close();
        console.error(chalk.red(`\nError getting credentials: ${error.message}`));
        console.error(chalk.yellow('You can add them later in the Claude Desktop config file.'));
      }
    }
    
    try {
      const { spawnSync } = require('child_process');
      // Prepare arguments for fastmcp install command
      const installArgs = ['install', serverPath];
      
      // If we have credentials, add the env arguments
      const env = {};
      if (credentials.sessionId && credentials.csrfToken && credentials.dsUserId) {
        env.INSTAGRAM_SESSION_ID = credentials.sessionId;
        env.INSTAGRAM_CSRF_TOKEN = credentials.csrfToken;
        env.INSTAGRAM_DS_USER_ID = credentials.dsUserId;
      }
      
      // Try to register the server with fastmcp
      console.error(chalk.blue(`Registering ${serverPath} with fastmcp...`));
      
      // Read the Claude config file to manually add credentials if needed
      const homeDir = require('os').homedir();
      const claudeConfigPath = path.join(homeDir, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
      
      // If we have credentials and the Claude config file exists, update it directly
      // rather than using fastmcp install
      if (fs.existsSync(claudeConfigPath)) {
        try {
          // Read current config
          const configContent = fs.readFileSync(claudeConfigPath, 'utf8');
          const config = JSON.parse(configContent);
          
          // Make sure mcpServers object exists
          config.mcpServers = config.mcpServers || {};
          
          // Create/update the InstagramDM server
          config.mcpServers.InstagramDM = {
            "command": "npx",
            "args": [
              "-y",
              "instagram-dm-mcp",
              "start"
            ],
            "env": {}
          };
          
          // Add credentials if we have all three of them
          if (credentials.sessionId && credentials.csrfToken && credentials.dsUserId) {
            // Create env object if it doesn't exist
            config.mcpServers.InstagramDM.env = config.mcpServers.InstagramDM.env || {};
            
            // Add the credentials
            config.mcpServers.InstagramDM.env.INSTAGRAM_SESSION_ID = credentials.sessionId;
            config.mcpServers.InstagramDM.env.INSTAGRAM_CSRF_TOKEN = credentials.csrfToken;
            config.mcpServers.InstagramDM.env.INSTAGRAM_DS_USER_ID = credentials.dsUserId;
          } else {
            // Ensure we have an empty env object
            config.mcpServers.InstagramDM.env = {};
          }
          
          // Write the updated config
          fs.writeFileSync(claudeConfigPath, JSON.stringify(config, null, 2));
          console.error(chalk.green('Instagram DM MCP server successfully registered with Claude Desktop!'));
          
          if (credentials.sessionId && credentials.csrfToken && credentials.dsUserId) {
            console.error(chalk.green('Instagram credentials added to Claude Desktop config file.'));
          } else {
            console.error(chalk.yellow('No Instagram credentials were found. Please add them manually in Claude Desktop settings.'));
          }
        } catch (error) {
          console.error(chalk.red(`Error updating Claude config file: ${error.message}`));
          console.error(chalk.yellow('You may need to add your Instagram DM MCP server manually in Claude Desktop settings.'));
        }
      }
      
      console.error(chalk.green('Instagram DM MCP server successfully installed in Claude Desktop!'));
      console.error(chalk.blue('You can now enable it in Claude Desktop settings.'));
      
      // Restore the original console.log
      console.log = originalConsoleLog;
    } catch (error) {
      console.error(chalk.red(`Failed to install server: ${error.message}`));
      
      // Restore the original console.log even in error case
      console.log = originalConsoleLog;
      
      process.exit(1);
    }
  });

program.parse(process.argv);

// Show help if no arguments
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
