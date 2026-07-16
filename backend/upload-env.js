import fs from 'fs';
import { execSync } from 'child_process';

const envLines = fs.readFileSync('.env', 'utf8').split('\n');
for (const line of envLines) {
  if (line.trim() && !line.startsWith('#')) {
    const [key, ...values] = line.split('=');
    const value = values.join('=');
    if (key && value) {
      console.log(`Adding ${key}...`);
      try {
        try { execSync(`npx vercel env rm ${key} --yes`, { stdio: 'ignore' }); } catch(e) {}
        execSync(`npx vercel env add ${key} production`, { input: value, stdio: ['pipe', 'pipe', 'pipe'] });
        console.log(`Added ${key}`);
      } catch (err) {
        console.error(`Failed to add ${key}: ${err.message}`);
      }
    }
  }
}
