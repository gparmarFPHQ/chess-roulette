# Chess-Roulette Deployment & Sharing Guide

## Quick Start

### 1. Deploy to Cloudflare Workers

```bash
# Navigate to the project
cd chess-roulette

# Install dependencies (if not already done)
npm install

# Authenticate with Cloudflare (first time only)
npx wrangler login

# Deploy the app
npm run deploy
```

After successful deployment, you'll see output like:
```
Deployed chess-roulette triggers:
- https://chess-roulette.your-subdomain.workers.dev
```

**Copy this URL** - you'll need it for the email!

---

### 2. Send Deployment Link via Email

#### Option A: Using the Email Script (Recommended)

```bash
# Install nodemailer (email sending library)
npm install nodemailer

# Set environment variables (Windows PowerShell)
$env:GMAIL_EMAIL="your-email@gmail.com"
$env:GMAIL_APP_PASSWORD="your-16-char-app-password"
$env:RECIPIENT_EMAIL="recipient@example.com"
$env:DEPLOYMENT_URL="https://chess-roulette.your-subdomain.workers.dev"

# Or set environment variables (Linux/Mac)
# export GMAIL_EMAIL="your-email@gmail.com"
# export GMAIL_APP_PASSWORD="your-16-char-app-password"
# export RECIPIENT_EMAIL="recipient@example.com"
# export DEPLOYMENT_URL="https://chess-roulette.your-subdomain.workers.dev"

# Send the email
node send-deployment-email.js
```

#### Option B: Manual Email

Simply copy the deployment URL and paste it into an email with these instructions:

```
🎮 Chess-Roulette - Play Chess with Video Chat!

Link: [YOUR_DEPLOYMENT_URL]

How to use:
1. Click the link above
2. Click "Play" to join the queue
3. Wait for an opponent to be matched
4. Enable camera/microphone when prompted (optional)
5. Play chess and chat via video

Features:
♟️ Real-time chess gameplay
📹 Peer-to-peer video chat
🎯 Random matchmaking
⚡ Fast and responsive

Works best in Chrome, Firefox, or Edge.
```

---

## Gmail App Password Setup (Required for Email Script)

To send emails via Gmail, you need an **App Password** (not your regular password):

1. **Enable 2-Factor Authentication** (if not already enabled):
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Create App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Select your device (e.g., "Windows Computer")
   - Click "Generate"
   - Copy the 16-character password (no spaces)

3. **Use the App Password**:
   - Use this password in the `GMAIL_APP_PASSWORD` environment variable
   - Or update it directly in `send-deployment-email.js`

---

## Local Development (Alternative to Deployment)

If you just want to test locally:

```bash
# Start development server
npm run dev

# The app will be available at:
# http://localhost:5173
```

**Note:** Local development won't work for multiplayer since the WebSocket server runs on Cloudflare. For testing multiplayer locally, you'd need to run two browser windows and use the same local server.

---

## Troubleshooting

### Deployment Issues

**Authentication Error:**
```bash
# Re-authenticate with Cloudflare
npx wrangler logout
npx wrangler login
```

**Build Errors:**
```bash
# Clean and rebuild
rm -rf dist
npm run build
```

### Email Sending Issues

**"Invalid credentials" error:**
- Make sure you're using a Gmail **App Password**, not your regular password
- Verify 2FA is enabled on your Gmail account

**"Connection timeout" error:**
- Check your internet connection
- Verify the recipient email address is correct

### WebRTC Video Issues

**Video not connecting:**
- Check that both players granted camera/microphone permissions
- Verify TURN credentials in `wrangler.jsonc` (currently placeholders)
- Try a different browser (Chrome, Firefox, Edge recommended)

**"WebRTC not supported" error:**
- Use a modern browser (Chrome, Firefox, Edge, Safari)
- Ensure you're on HTTPS (Cloudflare Workers provides this automatically)

---

## Architecture Overview

- **Frontend**: React + Vite + TypeScript
- **Chess Logic**: chess.js library
- **UI**: react-chessboard component
- **Backend**: Cloudflare Workers (serverless)
- **State Management**: Durable Objects (for game state)
- **Real-time**: WebSocket connections
- **Video**: WebRTC (peer-to-peer)
- **Matchmaking**: FIFO queue in Durable Object

---

## File Structure

```
chess-roulette/
├── src/
│   ├── components/
│   │   └── ChessGame.tsx      # Main chess game component
│   ├── client/
│   │   ├── connection.js       # WebSocket connection
│   │   └── webrtc.ts           # WebRTC video handling
│   ├── index.ts                # Worker entry point
│   ├── App.tsx                 # React app root
│   ├── main.tsx                # React entry point
│   └── index.css               # Global styles
├── public/                     # Static assets
├── test/                       # Test files
├── wrangler.jsonc              # Cloudflare config
├── vite.config.ts              # Vite build config
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── send-deployment-email.js    # Email sending script
└── DEPLOYMENT_GUIDE.md         # This file
```

---

## Next Steps

1. ✅ Deploy to Cloudflare Workers
2. ✅ Get the deployment URL
3. ✅ Set up Gmail App Password
4. ✅ Send email with deployment link
5. 🎮 Share with friends and play!

---

## Support

If you encounter issues:
1. Check the console logs in your browser (F12)
2. Check Cloudflare Workers logs in the dashboard
3. Verify all environment variables are set correctly
4. Try redeploying with `npm run deploy`

Good luck and have fun playing! ♟️🎲
