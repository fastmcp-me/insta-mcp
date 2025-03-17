#!/usr/bin/env node

'use strict';

const spawn = require('cross-spawn');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

console.log(chalk.blue('Setting up Instagram DM MCP server...'));

// Check if Python is installed
function checkPythonInstallation() {
  try {
    const result = spawn.sync('python3', ['--version'], { stdio: 'pipe' });
    if (result.status === 0) {
      const version = result.stdout.toString().trim();
      console.log(chalk.green(`Python detected: ${version}`));
      return true;
    }
  } catch (error) {
    // Python3 not found, try python
    try {
      const result = spawn.sync('python', ['--version'], { stdio: 'pipe' });
      if (result.status === 0) {
        const version = result.stdout.toString().trim();
        console.log(chalk.green(`Python detected: ${version}`));
        return true;
      }
    } catch (error) {
      console.error(chalk.red('Python not found. Please install Python 3.x'));
      return false;
    }
  }
  
  console.error(chalk.red('Python not found. Please install Python 3.x'));
  return false;
}

// Install Python dependencies
function installPythonDependencies() {
  const requirementsPath = path.join(__dirname, 'requirements.txt');
  
  if (!fs.existsSync(requirementsPath)) {
    console.error(chalk.red('requirements.txt not found'));
    return false;
  }
  
  console.log(chalk.blue('Installing Python dependencies...'));
  
  try {
    const result = spawn.sync('pip3', ['install', '-r', requirementsPath], { 
      stdio: 'inherit'
    });
    
    if (result.status === 0) {
      console.log(chalk.green('Python dependencies installed successfully'));
      return true;
    } else {
      // Try with pip if pip3 fails
      const pipResult = spawn.sync('pip', ['install', '-r', requirementsPath], { 
        stdio: 'inherit'
      });
      
      if (pipResult.status === 0) {
        console.log(chalk.green('Python dependencies installed successfully'));
        return true;
      } else {
        console.error(chalk.red('Failed to install Python dependencies'));
        return false;
      }
    }
  } catch (error) {
    console.error(chalk.red(`Error installing Python dependencies: ${error.message}`));
    return false;
  }
}

// Make CLI script executable
function setupCLIScript() {
  const cliScript = path.join(__dirname, 'cli.js');
  
  try {
    // Make CLI script executable
    fs.chmodSync(cliScript, '755');
    
    console.log(chalk.green('CLI script setup completed'));
    return true;
  } catch (error) {
    console.error(chalk.red(`Error setting up CLI script: ${error.message}`));
    return false;
  }
}

// Run all setup steps
function runSetup() {
  const pythonAvailable = checkPythonInstallation();
  
  if (pythonAvailable) {
    const dependenciesInstalled = installPythonDependencies();
    
    if (dependenciesInstalled) {
      const scriptSetup = setupCLIScript();
      
      if (scriptSetup) {
        console.log(chalk.green.bold('Instagram DM MCP server setup completed successfully!'));
        console.log(chalk.blue('Run `npx instagram-dm-mcp start` to start the server'));
      }
    }
  }
}

// Run the setup
runSetup();
