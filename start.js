#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`
${colors.bright}${colors.blue}╔═══════════════════════════════════════════════════════╗
║          🤖 AI Collaboration Platform                 ║
║               Starting Services...                    ║
╚═══════════════════════════════════════════════════════╝${colors.reset}
`);

// Start Backend
console.log(`${colors.cyan}[Backend]${colors.reset} Starting Express server on port 3000...`);
const backend = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  shell: true,
  stdio: ['inherit', 'pipe', 'pipe']
});

backend.stdout.on('data', (data) => {
  console.log(`${colors.green}[Backend]${colors.reset} ${data.toString().trim()}`);
});

backend.stderr.on('data', (data) => {
  console.error(`${colors.red}[Backend Error]${colors.reset} ${data.toString().trim()}`);
});

// Wait a moment for backend to initialize
setTimeout(() => {
  // Start Frontend
  console.log(`${colors.magenta}[Frontend]${colors.reset} Starting Vite dev server...`);
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'frontend'),
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe']
  });

  frontend.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(`${colors.blue}[Frontend]${colors.reset} ${output}`);
    
    // Check if Vite server is ready
    if (output.includes('Local:') && output.includes('http://localhost:')) {
      console.log(`
${colors.bright}${colors.green}╔═══════════════════════════════════════════════════════╗
║                  ✅ Ready!                            ║
║                                                       ║
║   Frontend: http://localhost:5173                     ║
║   Backend:  http://localhost:3000                     ║
║                                                       ║
║   Press Ctrl+C to stop both servers                   ║
╚═══════════════════════════════════════════════════════╝${colors.reset}
      `);
    }
  });

  frontend.stderr.on('data', (data) => {
    console.error(`${colors.red}[Frontend Error]${colors.reset} ${data.toString().trim()}`);
  });

  // Handle process termination
  const cleanup = () => {
    console.log(`\n${colors.yellow}Shutting down services...${colors.reset}`);
    backend.kill();
    frontend.kill();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

}, 2000);

// Handle backend crashes
backend.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`${colors.red}[Backend] Process exited with code ${code}${colors.reset}`);
    process.exit(1);
  }
}); 