/**
 * Send Chess-Roulette Email via Gmail
 * This script sends an email with deployment/run instructions
 * 
 * Usage: 
 *   node send-email-now.js <gmail-app-password>
 * 
 * Get Gmail App Password: https://myaccount.google.com/apppasswords
 */

import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Recipient (you!)
const RECIPIENT = 'parmar.gurinder@gmail.com';

// Get app password from command line or prompt
const APP_PASSWORD = process.argv[2];

if (!APP_PASSWORD) {
  console.log('❌ Gmail App Password required!\n');
  console.log('Usage: node send-email-now.js <your-gmail-app-password>\n');
  console.log('📧 How to get Gmail App Password:');
  console.log('   1. Go to: https://myaccount.google.com/apppasswords');
  console.log('   2. Enable 2FA if not already enabled');
  console.log('   3. Create an app password for "Mail"');
  console.log('   4. Copy the 16-character password');
  console.log('\nExample: node send-email-now.js abcd efgh ijkl mnop\n');
  process.exit(1);
}

// Read the built files info
let buildInfo = 'Build completed successfully!';
try {
  const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));
  buildInfo = `Version: ${packageJson.version}\nBuilt with: ${packageJson.devDependencies.vite || 'N/A'}`;
} catch (e) {
  // Ignore
}

// Email content
const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #4CAF50; }
    .button { 
      display: inline-block; 
      background: #4CAF50; 
      color: white; 
      padding: 12px 30px; 
      text-decoration: none; 
      border-radius: 5px; 
      margin: 10px 0;
      font-weight: bold;
    }
    .code { 
      background: #f4f4f4; 
      padding: 15px; 
      border-radius: 5px; 
      font-family: 'Courier New', monospace; 
      font-size: 13px;
      overflow-x: auto;
    }
    .step { 
      background: #e8f5e9; 
      padding: 15px; 
      border-left: 4px solid #4CAF50; 
      margin: 15px 0;
    }
    .warning {
      background: #fff3e0;
      padding: 15px;
      border-left: 4px solid #ff9800;
      margin: 15px 0;
    }
    ul { line-height: 2; }
  </style>
</head>
<body>
  <h1>♟️ Your Chess-Roulette App is Ready!</h1>
  
  <p>Hi Gurinder,</p>
  
  <p>Your chess application with video chat has been built successfully and is ready to use!</p>
  
  <div class="step">
    <h2>🚀 Quick Start - Run Locally</h2>
    <ol>
      <li>Open terminal in the <code>chess-roulette</code> folder</li>
      <li>Run: <code>npm run dev</code></li>
      <li>Open browser to: <strong>http://localhost:5173</strong></li>
      <li>Click "Play" to start matchmaking!</li>
    </ol>
  </div>
  
  <div class="step">
    <h2>☁️ Deploy to Cloudflare (Optional)</h2>
    <p>When Cloudflare's API is available (currently rate-limited), run:</p>
    <div class="code">
      cd chess-roulette<br>
      npm run deploy
    </div>
    <p>This will give you a live URL like: <code>https://chess-roulette.your-subdomain.workers.dev</code></p>
  </div>
  
  <div class="warning">
    <strong>⚠️ Note About Video Chat:</strong><br>
    The chess gameplay works perfectly! Video chat may need TURN server credentials for some networks. 
    To enable video for all users, get Cloudflare Realtime TURN credentials and update 
    <code>wrangler.jsonc</code>.
  </div>
  
  <h2>📁 What's Included</h2>
  <ul>
    <li>✅ React + Vite frontend (built and ready)</li>
    <li>✅ Cloudflare Worker backend with Durable Objects</li>
    <li>✅ Real-time chess matchmaking</li>
    <li>✅ WebRTC video chat support</li>
    <li>✅ Complete documentation (DEPLOYMENT_GUIDE.md, QUICK_START.md)</li>
  </ul>
  
  <h2>🎮 How to Play</h2>
  <ol>
    <li>Start the dev server: <code>npm run dev</code></li>
    <li>Open two browser windows to test multiplayer</li>
    <li>Click "Play" in both windows</li>
    <li>Wait for matchmaking (you'll match with yourself in the second window)</li>
    <li>Enable camera/mic when prompted (optional)</li>
    <li>Play chess!</li>
  </ol>
  
  <h2>📚 Documentation</h2>
  <ul>
    <li><strong>QUICK_START.md</strong> - Quick reference guide</li>
    <li><strong>DEPLOYMENT_GUIDE.md</strong> - Complete deployment instructions</li>
    <li><strong>README.md</strong> - Project overview</li>
  </ul>
  
  <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
    Built with ❤️ using Cloudflare Workers, React, and WebRTC<br>
    ${buildInfo}
  </p>
</body>
</html>
`;

const emailText = `
♟️ Your Chess-Roulette App is Ready!

Hi Gurinder,

Your chess application with video chat has been built successfully!

🚀 Quick Start - Run Locally
=============================
1. Open terminal in the chess-roulette folder
2. Run: npm run dev
3. Open browser to: http://localhost:5173
4. Click "Play" to start matchmaking!

☁️ Deploy to Cloudflare (Optional)
===================================
When Cloudflare's API is available (currently rate-limited), run:
  cd chess-roulette
  npm run deploy

This will give you a live URL like: https://chess-roulette.your-subdomain.workers.dev

⚠️ Note About Video Chat
=========================
The chess gameplay works perfectly! Video chat may need TURN server credentials 
for some networks. To enable video for all users, get Cloudflare Realtime TURN 
credentials and update wrangler.jsonc.

📁 What's Included
==================
✅ React + Vite frontend (built and ready)
✅ Cloudflare Worker backend with Durable Objects
✅ Real-time chess matchmaking
✅ WebRTC video chat support
✅ Complete documentation (DEPLOYMENT_GUIDE.md, QUICK_START.md)

🎮 How to Play
==============
1. Start the dev server: npm run dev
2. Open two browser windows to test multiplayer
3. Click "Play" in both windows
4. Wait for matchmaking
5. Enable camera/mic when prompted (optional)
6. Play chess!

📚 Documentation
================
- QUICK_START.md - Quick reference guide
- DEPLOYMENT_GUIDE.md - Complete deployment instructions
- README.md - Project overview

---
Built with ❤️ using Cloudflare Workers, React, and WebRTC
${buildInfo}
`;

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'parmar.gurinder@gmail.com',
    pass: APP_PASSWORD
  }
});

// Send email
async function sendEmail() {
  console.log('📧 Sending email to parmar.gurinder@gmail.com...\n');
  
  try {
    const info = await transporter.sendMail({
      from: '"Chess-Roulette App" <parmar.gurinder@gmail.com>',
      to: RECIPIENT,
      subject: '♟️ Your Chess-Roulette App is Ready to Play!',
      text: emailText,
      html: emailHtml
    });
    
    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log('\n📬 Check your inbox at parmar.gurinder@gmail.com');
    console.log('   (Also check spam folder just in case)\n');
    
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure you\'re using a Gmail App Password (not regular password)');
    console.error('2. Verify 2FA is enabled on your Gmail account');
    console.error('3. Check that the app password was copied correctly (16 chars, no spaces)');
    console.error('4. Try generating a new app password at: https://myaccount.google.com/apppasswords');
    process.exit(1);
  }
}

sendEmail();
