#!/usr/bin/env node
/**
 * Chrome Web Store OAuth Token Refresh Script
 *
 * Otevře browser, ty klikneš Allow, script automaticky:
 * 1. Zachytí authorization code
 * 2. Vymění za refresh token
 * 3. Aktualizuje GitHub secret
 *
 * Použití: node scripts/refresh-chrome-token.mjs
 */

import http from 'node:http';
import { exec, execSync } from 'node:child_process';
import { URL } from 'node:url';
import readline from 'node:readline';

// Konfigurace - načti z GitHub secrets nebo env
const CONFIG = {
  clientId: process.env.CHROME_CLIENT_ID,
  clientSecret: process.env.CHROME_CLIENT_SECRET,
  repo: 'Replikanti/flowlint-chrome',
  port: 8919,
  scope: 'https://www.googleapis.com/auth/chromewebstore',
};

async function question(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(prompt, answer => { rl.close(); resolve(answer); }));
}

async function getCredentials() {
  if (!CONFIG.clientId) {
    console.log('\n⚠️  CHROME_CLIENT_ID not found in environment.\n');
    CONFIG.clientId = await question('Enter Client ID: ');
  }
  if (!CONFIG.clientSecret) {
    console.log('\n⚠️  CHROME_CLIENT_SECRET not found in environment.\n');
    CONFIG.clientSecret = await question('Enter Client Secret: ');
  }
}

function openBrowser(url) {
  const cmd = process.platform === 'darwin' ? 'open' :
              process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${cmd} "${url}"`);
}

async function exchangeCodeForToken(code) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CONFIG.clientId,
      client_secret: CONFIG.clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: `http://localhost:${CONFIG.port}/callback`,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

function updateGitHubSecret(name, value) {
  console.log(`\n📤 Updating GitHub secret ${name}...`);
  try {
    execSync(`gh secret set ${name} -R ${CONFIG.repo} -b "${value}"`, { stdio: 'pipe' });
    console.log(`✅ ${name} updated successfully!`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to update ${name}:`, error.message);
    console.log(`\n📋 Manual update - run this command:`);
    console.log(`gh secret set ${name} -R ${CONFIG.repo}`);
    console.log(`Then paste: ${value}\n`);
    return false;
  }
}

async function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, `http://localhost:${CONFIG.port}`);

      if (url.pathname === '/callback') {
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');

        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`<h1>❌ Chyba: ${error}</h1><p>Zavři toto okno.</p>`);
          server.close();
          reject(new Error(error));
          return;
        }

        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`<h1>✅ Autorizace úspěšná!</h1><p>Můžeš zavřít toto okno a vrátit se do terminálu.</p>`);
          server.close();
          resolve(code);
          return;
        }
      }

      res.writeHead(404);
      res.end('Not found');
    });

    server.listen(CONFIG.port, () => {
      console.log(`\n🌐 Callback server running on http://localhost:${CONFIG.port}`);
    });

    server.on('error', reject);

    // Timeout po 5 minutách
    setTimeout(() => {
      server.close();
      reject(new Error('Timeout - no authorization received within 5 minutes'));
    }, 5 * 60 * 1000);
  });
}

async function main() {
  console.log('🔑 Chrome Web Store Token Refresh\n');
  console.log('='.repeat(40));

  await getCredentials();

  // Vytvoř OAuth URL
  const authUrl = new URL('https://accounts.google.com/o/oauth2/auth');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', CONFIG.clientId);
  authUrl.searchParams.set('redirect_uri', `http://localhost:${CONFIG.port}/callback`);
  authUrl.searchParams.set('scope', CONFIG.scope);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent'); // Force new refresh token

  // Spusť server a otevři browser
  console.log('\n🚀 Opening browser for authorization...');
  console.log('   (If browser doesn\'t open, visit this URL manually)\n');
  console.log(`   ${authUrl.toString()}\n`);

  const serverPromise = startServer();

  // Dej serveru chvilku nastartovat
  await new Promise(r => setTimeout(r, 500));
  openBrowser(authUrl.toString());

  try {
    const code = await serverPromise;
    console.log('\n✅ Authorization code received!');

    console.log('\n🔄 Exchanging code for tokens...');
    const tokens = await exchangeCodeForToken(code);

    if (!tokens.refresh_token) {
      throw new Error('No refresh_token in response. Try revoking app access at https://myaccount.google.com/permissions and try again.');
    }

    console.log('\n✅ Tokens received!');
    console.log(`   Access token: ${tokens.access_token?.substring(0, 20)}...`);
    console.log(`   Refresh token: ${tokens.refresh_token?.substring(0, 20)}...`);
    console.log(`   Expires in: ${tokens.expires_in} seconds`);

    // Aktualizuj GitHub secret
    updateGitHubSecret('CHROME_REFRESH_TOKEN', tokens.refresh_token);

    console.log('\n🎉 Done! Token has been refreshed.\n');
    console.log('⚠️  Remember: In Testing mode, token expires in 7 days.');
    console.log('   Set a reminder to run this script again.\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
