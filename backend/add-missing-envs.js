import fs from 'fs';
import { execSync } from 'child_process';

const missingKeys = [
  'EMAIL_PORT', 'EMAIL_SECURE', 'EMAIL_USER', 'EMAIL_PASSWORD',
  'OPENAI_API_KEY', 'OPENAI_MODEL', 'OPENAI_MAX_TOKENS', 'OPENAI_TEMPERATURE',
  'ENABLE_AI_INTERVIEWS', 'ENABLE_CODING_TESTS', 'ENABLE_AI_ANALYSIS',
  'ENABLE_CAREER_GUIDANCE', 'ENABLE_AUTO_SHORTLISTING', 'GEMINI_API_KEY', 'chatgpt'
];

const envLines = fs.readFileSync('.env', 'utf8').split('\n');
for (const line of envLines) {
  if (line.trim() && !line.startsWith('#')) {
    const [key, ...values] = line.split('=');
    const value = values.join('=');
    if (missingKeys.includes(key)) {
      console.log(`Adding ${key}...`);
      try {
        execSync(`echo -n "${value}" | npx vercel env rm ${key} production -y`, { stdio: 'ignore' });
      } catch (e) {} // ignore rm error
      
      try {
        execSync(`echo -n "${value}" | npx vercel env add ${key} production`, { stdio: 'inherit' });
        console.log(`Added ${key} successfully.`);
      } catch (err) {
        console.error(`Failed to add ${key}: ${err.message}`);
      }
    }
  }
}
