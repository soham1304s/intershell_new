import { execSync } from 'child_process';

const envs = {
  'VITE_API_URL': 'https://intershell-backend.vercel.app/api',
  'VITE_SOCKET_URL': 'https://intershell-backend.vercel.app'
};

for (const [key, value] of Object.entries(envs)) {
  console.log(`Setting ${key}...`);
  try {
    execSync(`npx vercel env add ${key} production`, { input: value, stdio: ['pipe', 'pipe', 'pipe'] });
    console.log(`Set ${key} successfully.`);
  } catch (err) {
    console.error(`Failed to set ${key}: ${err.message}`);
  }
}
