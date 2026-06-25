# ♟️ Chess-Roulette - Quick Start

## ✅ What's Been Done

1. **Project Built Successfully** ✓
   - Build output: `dist/` folder ready
   - All dependencies installed including `nodemailer`

2. **Email Script Created** ✓
   - File: `send-deployment-email.js`
   - Ready to send deployment link via Gmail

3. **Documentation Created** ✓
   - `DEPLOYMENT_GUIDE.md` - Complete deployment instructions
   - `QUICK_START.md` - This file

---

## 🚀 Next Steps

### Step 1: Deploy to Cloudflare (Wait 5-10 minutes first!)

**Important:** Cloudflare is rate-limiting due to multiple deployment attempts. Wait 5-10 minutes, then run:

```bash
cd chess-roulette
npm run deploy
```

You should see output like:
```
Deployed chess-roulette triggers:
- https://chess-roulette.your-subdomain.workers.dev
```

**Copy this URL!** You'll need it for the email.

---

### Step 2: Set Up Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Enable 2FA if not already enabled
3. Create an app password:
   - Select "Mail" → Your device
   - Copy the 16-character password

---

### Step 3: Send the Email

**Option A: Environment Variables (Recommended)**

```bash
# Windows PowerShell
$env:GMAIL_EMAIL="your-email@gmail.com"
$env:GMAIL_APP_PASSWORD="your-16-char-password"
$env:RECIPIENT_EMAIL="friend@example.com"
$env:DEPLOYMENT_URL="https://chess-roulette.your-subdomain.workers.dev"

node send-deployment-email.js
```

**Option B: Edit the Script**

Open `send-deployment-email.js` and update the config:

```javascript
const config = {
  gmail: {
    email: 'your-email@gmail.com',
    appPassword: 'your-16-char-password'
  },
  recipient: 'friend@example.com',
  deploymentUrl: 'https://chess-roulette.your-subdomain.workers.dev',
  // ...
};
```

Then run:
```bash
node send-deployment-email.js
```

---

## 📧 What the Email Contains

The email script sends a beautifully formatted HTML email with:
- ✅ Clickable "Play Chess Now" button
- ✅ Direct deployment URL
- ✅ Step-by-step instructions
- ✅ Feature list
- ✅ Browser compatibility notes

---

## 🎮 How Recipients Play

1. Click the link in the email
2. Click "Play" button
3. Wait for matchmaking (finds another player)
4. Enable camera/mic (optional)
5. Play chess with video chat!

---

## ⚠️ Current Limitations

**TURN Server Credentials:** The WebRTC video chat requires TURN server credentials for players behind strict firewalls. Currently configured with placeholders in `wrangler.jsonc`.

**To get TURN credentials:**
1. Sign up for Cloudflare Realtime: https://www.cloudflare.com/products/realtime/
2. Get TURN credentials from dashboard
3. Update `wrangler.jsonc`:
   ```jsonc
   "vars": {
     "ICE_SERVERS": "{\"urls\":[\"stun:stun.cloudflare.com:3478\",\"turn:turn.cloudflare.com:3478\"],\"username\":\"REAL_USERNAME\",\"credential\":\"REAL_CREDENTIAL\"}"
   }
   ```

**Note:** Chess gameplay works fine without TURN - only video chat may fail between some networks. STUN (already configured) handles most connections.

---

## 📁 Files Created

```
chess-roulette/
├── send-deployment-email.js    # Email sending script
├── DEPLOYMENT_GUIDE.md         # Full deployment guide
├── QUICK_START.md              # This file
├── dist/                       # Built app (ready to deploy)
└── ... (original project files)
```

---

## 🆘 Troubleshooting

**Deployment still failing?**
- Wait 10 more minutes (rate limit)
- Try: `npx wrangler whoami` to verify auth
- Check Cloudflare dashboard: https://dash.cloudflare.com/

**Email not sending?**
- Verify Gmail App Password (not regular password)
- Check 2FA is enabled
- Verify recipient email address

**Video not working?**
- Check browser permissions for camera/mic
- Try Chrome/Firefox/Edge
- TURN credentials may be needed (see above)

---

## 📞 Summary

You now have:
- ✅ A buildable chess app with video chat
- ✅ Deployment script (just wait for rate limit)
- ✅ Email script to share the link
- ✅ Complete documentation

**After deployment succeeds**, run the email script to share with friends!

---

**Questions?** Check `DEPLOYMENT_GUIDE.md` for detailed instructions.
