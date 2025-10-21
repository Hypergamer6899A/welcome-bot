// index.js
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const express = require('express'); // Express for Render port

// --- Discord Bot Setup ---
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

const joinMessages = [
  "Welcome {Username} to GoShiggy's Basement",
  "{Username} has arrived, let's see how long they last",
  "{Username} just made the member count {PlayerCount}",
  "Looks like {Username} is also a GoShiggy fan",
  "Good luck {Username}, you'll need it",
  "{PlayerCount} members now counting {Username}",
  "{Username}? That's an interesting name"
];

// --- Helper to pick a random message ---
function formatMessage(template, member) {
  return template
    .replace(/{Username}/g, member.user.username)
    .replace(/{PlayerCount}/g, member.guild.memberCount);
}

// --- Event: new member joins ---
client.on('guildMemberAdd', async (member) => {
  // Ignore bots if you want
  if (member.user.bot) return;

  const channel = member.guild.channels.cache.get(process.env.CHANNEL_ID);
  if (!channel) return console.error("❌ Channel not found. Check CHANNEL_ID.");

  const messageTemplate = joinMessages[Math.floor(Math.random() * joinMessages.length)];
  const message = formatMessage(messageTemplate, member);

  try {
    await channel.send(message);
    console.log(`Sent welcome message for ${member.user.tag}`);
  } catch (err) {
    console.error('Failed to send welcome message:', err);
  }
});

// --- On bot ready ---
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag} (pid=${process.pid})`);
});

// --- Login bot ---
client.login(process.env.TOKEN).catch(err => {
  console.error('Failed to login bot. Check TOKEN env variable.', err);
});

// --- Tiny Express Server for Render Port Scan ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot is running!'));
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    bot: client.user ? client.user.tag : 'starting',
    pid: process.pid,
    time: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🌐 Tiny web server listening on port ${PORT} (pid=${process.pid})`);
});
