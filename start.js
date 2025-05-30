#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Environment detection
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;
const FRONTEND_PORT = 5173; // Default Vite port

// Banner and startup message
console.log(`
${colors.bright}${colors.blue}╔═══════════════════════════════════════════════════════╗
║          🤖 AI Collaboration Platform                 ║
║               Starting in ${isProduction ? colors.green + 'PRODUCTION' : colors.yellow + 'DEVELOPMENT'} mode           ${colors.blue}║
╚═══════════════════════════════════════════════════════╝${colors.reset}
`);

// Check if .env file exists
if (!fs.existsSync(path.join(__dirname, '.env'))) {
  console.error(`${colors.red}[ERROR]${colors.reset} .env file not found!`);
  console.log(`
${colors.yellow}Please create a .env file in the project root with the following content:${colors.reset}

ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key
PORT=${PORT}

${colors.cyan}You can get API keys from:${colors.reset}
- Anthropic: https://console.anthropic.com/
- OpenAI: https://platform.openai.com/
`);
  process.exit(1);
}

// Load environment variables
require('dotenv').config();

// Check if API keys are configured
if (!process.env.ANTHROPIC_API_KEY) {
  console.error(`${colors.red}[ERROR]${colors.reset} Missing ANTHROPIC_API_KEY in .env file`);
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error(`${colors.red}[ERROR]${colors.reset} Missing OPENAI_API_KEY in .env file`);
  process.exit(1);
}

// Health check function for APIs
async function checkApiHealth() {
  console.log(`${colors.cyan}[Health]${colors.reset} Checking API connectivity...`);
  
  // Simple health check for OpenAI API
  try {
    const openaiRes = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      method: 'GET',
    });
    
    if (openaiRes.ok) {
      console.log(`${colors.green}[Health]${colors.reset} OpenAI API connection: ${colors.green}OK${colors.reset}`);
    } else {
      console.error(`${colors.red}[Health]${colors.reset} OpenAI API connection: ${colors.red}FAILED${colors.reset} (Status: ${openaiRes.status})`);
    }
  } catch (err) {
    console.error(`${colors.red}[Health]${colors.reset} OpenAI API connection: ${colors.red}ERROR${colors.reset} (${err.message})`);
  }
  
  // Simple health check for Anthropic API
  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1,
        messages: [{ role: "user", content: "Hello" }]
      }),
    });
    
    if (anthropicRes.ok) {
      console.log(`${colors.green}[Health]${colors.reset} Anthropic API connection: ${colors.green}OK${colors.reset}`);
    } else {
      console.error(`${colors.red}[Health]${colors.reset} Anthropic API connection: ${colors.red}FAILED${colors.reset} (Status: ${anthropicRes.status})`);
    }
  } catch (err) {
    console.error(`${colors.red}[Health]${colors.reset} Anthropic API connection: ${colors.red}ERROR${colors.reset} (${err.message})`);
  }
}

// Check if frontend build exists for production mode
if (isProduction && !fs.existsSync(path.join(__dirname, 'frontend/dist'))) {
  console.error(`${colors.red}[ERROR]${colors.reset} Frontend build not found!`);
  console.log(`
${colors.yellow}Please build the frontend before running in production mode:${colors.reset}

cd frontend
npm install
npm run build

${colors.cyan}Then try again.${colors.reset}
`);
  process.exit(1);
}

// Start server based on environment
if (isProduction) {
  // Production mode: Start Express server only (it will serve the built frontend)
  console.log(`${colors.green}[Production]${colors.reset} Starting Express server on port ${PORT}...`);
  
  const server = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  server.on('error', (err) => {
    console.error(`${colors.red}[Server Error]${colors.reset} ${err.message}`);
    process.exit(1);
  });
  
  server.on('exit', (code) => {
    if (code !== 0) {
      console.error(`${colors.red}[Server]${colors.reset} Process exited with code ${code}`);
      process.exit(code);
    }
  });
  
  // Check if server is running after a short delay
  setTimeout(() => {
    http.get(`http://localhost:${PORT}/api/health`, (res) => {
      if (res.statusCode === 200) {
        console.log(`
${colors.bright}${colors.green}╔═══════════════════════════════════════════════════════╗
║                  ✅ Ready!                            ║
║                                                       ║
║   Server running at: http://localhost:${PORT}            ║
║                                                       ║
║   Press Ctrl+C to stop the server                     ║
╚═══════════════════════════════════════════════════════╝${colors.reset}
        `);
        
        // Run API health checks
        checkApiHealth();
      }
    }).on('error', () => {
      console.error(`${colors.red}[Server]${colors.reset} Failed to connect to server on port ${PORT}`);
    });
  }, 3000);
} else {
  // Development mode: Provide instructions for running frontend and backend separately
  console.log(`${colors.yellow}[Development]${colors.reset} Starting in development mode...`);
  
  console.log(`
${colors.cyan}To run the application in development mode:${colors.reset}

${colors.bright}1. Start the backend server:${colors.reset}
   ${colors.green}npm run dev${colors.reset}
   ${colors.dim}# This will start the Express server with nodemon on port ${PORT}${colors.reset}

${colors.bright}2. In a separate terminal, start the frontend:${colors.reset}
   ${colors.green}cd frontend${colors.reset}
   ${colors.green}npm run dev${colors.reset}
   ${colors.dim}# This will start the Vite dev server on port ${FRONTEND_PORT}${colors.reset}

${colors.bright}3. Access the application:${colors.reset}
   ${colors.blue}Backend API: http://localhost:${PORT}/api/health${colors.reset}
   ${colors.blue}Frontend: http://localhost:${FRONTEND_PORT}${colors.reset}

${colors.yellow}Starting backend server with nodemon...${colors.reset}
  `);
  
  // Start backend with nodemon for development
  const backend = spawn('npx', ['nodemon', 'server.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
  backend.on('error', (err) => {
    console.error(`${colors.red}[Backend Error]${colors.reset} ${err.message}`);
    
    if (err.message.includes('nodemon')) {
      console.log(`
${colors.yellow}Nodemon not found. Install it with:${colors.reset}
npm install -g nodemon
      `);
    }
    
    process.exit(1);
  });
  
  backend.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`${colors.red}[Backend]${colors.reset} Process exited with code ${code}`);
      process.exit(code);
    }
  });
  
  // Handle process termination
  const cleanup = () => {
    console.log(`\n${colors.yellow}Shutting down services...${colors.reset}`);
    backend.kill();
    process.exit(0);
  };
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}
