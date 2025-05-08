#!/usr/bin/env ts-node

// Import necessary modules
import { execSync } from 'child_process';

// Function to execute shell commands
function runCommand(command: string) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error);
    process.exit(1);
  }
}

// Main setup function
function setup() {
  console.log('Starting project setup...');

  // Example command to install dependencies
  runCommand('npm install');

  // Add more setup steps as needed
  console.log('Setup complete.');
}

// Execute the setup function
setup();
