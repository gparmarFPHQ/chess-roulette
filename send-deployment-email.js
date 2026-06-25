/**
 * Send Chess-Roulette Deployment Link via Gmail
 * 
 * Prerequisites:
 * 1. Install nodemailer: npm install nodemailer
 * 2. Create a Gmail App Password (not your regular password):
 *    - Go to: https://myaccount.google.com/apppasswords
 *    - Select "Mail" and your device
 *    - Copy the 16-character password
 * 3. Set environment variables or update the config below
 * 
 * Usage: node send-deployment-email.js
 */

import nodemailer from 'nodemailer';

// ============================================================================
// CONFIGURATION
// ============================================================================

const config = {
  // Your Gmail credentials
  gmail: {
    email: process.env.GMAIL_EMAIL || 'your-email@gmail.com',
    appPassword: process.env.GMAIL_APP_PASSWORD || 'your-app-password-here'
  },
  
  // Recipient email
  recipient: process.env.RECIPIENT_EMAIL || 'recipient@example.com',
  
  // Deployment URL (update after deploying)
  deploymentUrl: process.env.DEPLOYMENT_URL || 'https://chess-roulette.your-subdomain.workers.dev',
  
  // Email subject and body
  subject: '🎮 Chess-Roulette - Play Chess with Video Chat!',
  
  body: `
Hi there! 👋

I've deployed a chess app where you can play random opponents with video chat. It's live and ready to use!

🔗 Play here: {DEPLOYMENT_URL}

How to use:
1. Click the link above
2. Click "Play" to join the queue
3. Wait for an opponent to be matched
4. Enable camera/microphone when prompted (optional but recommended!)
5. Play chess and chat via video

Features:
♟️ Real-time chess gameplay
📹 Peer-to-peer video chat with your opponent
🎯 Random matchmaking
⚡ Fast and responsive

The app works best in Chrome, Firefox, or Edge. Camera/mic are optional - you can still play chess without them.

Let me know if you have any issues!

Enjoy the game! 🎲
`
};

// ============================================================================
// EMAIL TRANSPORTER SETUP
// ============================================================================

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.gmail.email,
    pass: config.gmail.appPassword
  }
});

// ============================================================================
// SEND EMAIL
// ============================================================================

async function sendEmail() {
  // Check if credentials are configured
  if (config.gmail.email === 'your-email@gmail.com' || 
      config.gmail.appPassword === 'your-app-password-here') {
    console.error('❌ Error: Gmail credentials not configured!');
    console.error('\nPlease do ONE of the following:\n');
    console.error('1. Set environment variables:');
    console.error('   export GMAIL_EMAIL="your-email@gmail.com"');
    console.error('   export GMAIL_APP_PASSWORD="your-16-char-app-password"');
    console.error('   export RECIPIENT_EMAIL="recipient@example.com"');
    console.error('   export DEPLOYMENT_URL="https://your-app.workers.dev"');
    console.error('\n2. Or edit this file and update the config object directly.\n');
    console.error('📧 To get a Gmail App Password:');
    console.error('   1. Go to: https://myaccount.google.com/apppasswords');
    console.error('   2. Enable 2FA if not already enabled');
    console.error('   3. Create an app password for "Mail"');
    console.error('   4. Copy the 16-character password');
    process.exit(1);
  }

  const mailOptions = {
    from: `"Chess-Roulette" <${config.gmail.email}>`,
    to: config.recipient,
    subject: config.subject,
    text: config.body.replace('{DEPLOYMENT_URL}', config.deploymentUrl),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">🎮 Chess-Roulette is Live!</h2>
        
        <p>Hi there! 👋</p>
        
        <p>I've deployed a chess app where you can play random opponents with video chat. It's live and ready to use!</p>
        
        <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <a href="${config.deploymentUrl}" 
             style="background-color: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 18px; display: inline-block;">
            ♟️ Play Chess Now
          </a>
        </div>
        
        <p><strong>Deployment URL:</strong> <a href="${config.deploymentUrl}">${config.deploymentUrl}</a></p>
        
        <h3>How to use:</h3>
        <ol>
          <li>Click the green button above (or the link)</li>
          <li>Click "Play" to join the queue</li>
          <li>Wait for an opponent to be matched</li>
          <li>Enable camera/microphone when prompted (optional!)</li>
          <li>Play chess and chat via video</li>
        </ol>
        
        <h3>Features:</h3>
        <ul>
          <li>♟️ Real-time chess gameplay</li>
          <li>📹 Peer-to-peer video chat with your opponent</li>
          <li>🎯 Random matchmaking</li>
          <li>⚡ Fast and responsive</li>
        </ul>
        
        <p style="color: #666; font-size: 14px;">
          <strong>Note:</strong> The app works best in Chrome, Firefox, or Edge. 
          Camera/microphone are optional - you can still play chess without them.
        </p>
        
        <p>Let me know if you have any issues!</p>
        
        <p>Enjoy the game! 🎲</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
          Sent from Chess-Roulette Deployment Script
        </p>
      </div>
    `
  };

  try {
    console.log('📧 Sending email...');
    console.log(`   From: ${config.gmail.email}`);
    console.log(`   To: ${config.recipient}`);
    console.log(`   URL: ${config.deploymentUrl}`);
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Preview URL: ${nodemailer.getTestMessageUrl(info) || 'N/A'}`);
    
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    console.error('\nTroubleshooting tips:');
    console.error('1. Make sure you\'re using a Gmail App Password, not your regular password');
    console.error('2. Check that 2FA is enabled on your Gmail account');
    console.error('3. Verify the recipient email address is correct');
    console.error('4. Make sure "Less secure app access" is handled via App Passwords');
    process.exit(1);
  }
}

// Run
sendEmail();
