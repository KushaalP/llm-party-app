#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get local IP address
const getLocalIP = () => {
  try {
    const output = execSync("ifconfig | grep 'inet ' | grep -v 127.0.0.1 | head -1 | awk '{print $2}'", { encoding: 'utf8' });
    return output.trim();
  } catch (error) {
    console.error('Error getting IP address:', error);
    return 'localhost';
  }
};

const updateEnvFile = () => {
  const envPath = join(__dirname, '..', '.env.local');
  const ip = getLocalIP();
  const port = process.env.PORT || 3001;
  
  console.log(`Local IP address: ${ip}`);
  
  let content = '';
  if (existsSync(envPath)) {
    content = readFileSync(envPath, 'utf8');
    // Update existing VITE_SERVER_URL
    if (content.includes('VITE_SERVER_URL=')) {
      content = content.replace(
        /VITE_SERVER_URL=.*/,
        `VITE_SERVER_URL=http://${ip}:${port}`
      );
    } else {
      // Add if not exists
      content += `\n# Auto-generated for Capacitor development\nVITE_SERVER_URL=http://${ip}:${port}\n`;
    }
  } else {
    // Create new file
    content = `# Auto-generated for Capacitor development\nVITE_SERVER_URL=http://${ip}:${port}\n`;
  }
  
  writeFileSync(envPath, content);
  console.log(`Updated .env.local with VITE_SERVER_URL=http://${ip}:${port}`);
};

updateEnvFile();