// index.js
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const express = require('express'); // Express for Render port

// --- Discord Bot Setup ---
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// join messages
const joinMessages = [
  "Welcome {Username} to GoShiggy's Basement",
  "{Username} has arrived, lets see how long they last",
  "{Username} just made the member count {PlayerCount}",
  "Looks like {Username} is also a GoShiggy fan",
  "Goodluck {Username}, you'll need it",
  "{PlayerCount} members now counting {Username}",
  "{Username}? That's an interesting name"
];

// In-memory dedupe: map of userId -> timestamp (ms)
const recentJoins = new Map();
// dedupe window in ms
const DEDUPE_WINDOW = 20 * 1000; // 20 seconds

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag} (pid=${process.pid}) at ${new Date().toISOString()}`);
});

// helper: pick random message and replace tokens
function formatMessage(template, member) {
  return template
    .replace(/{Username}/g, member.user.username)
    .replace(/{PlayerCount}/g, member.guild.memberCount);
}

client.on('guildMemberAdd', async (member) => {
  try {
    // IGNORE other bots joining (common desired behavior)
    if (member.user.bot) {
      console.log(`Ignoring bot join: ${member.user.tag}`);
      return;
    }

    // Dedupe by user id
    const now = Date.now();
    const last = recentJoins.get(member.id) || 0;
    if (now - last < DEDUPE_WINDOW) {
      console.log(`Deduped join event for ${member.user.tag} (user id ${member.id}). Last sent ${now - last}ms ago.`);
      return;
    }
    // update last seen
    recentJoins.set(member.id, now);

    // clean up old entries occasionally to avoid memory growth
    if (recentJoins.size > 500) {
      const cutoff = now - DEDUPE_WINDOW;
      for (const [uid, ts] of recentJoins) {
        if (ts < cutoff) recentJoins.delete(uid);
      }
    }

    const channel = member.guild.channels.cache.get(process.env.CHANNEL_ID);
    if (!channel) {
      console.error("❌ Channel not found. Check CHANNEL_ID.");
      return;
    }

    const messageTemplate = joinMessages[Math.floor(Math.random() * joinMessages.length)];
    const message = formatMessage(messageTemplate, member);

    console.log(`Sending welcome message for ${member.user.tag} (pid=${process.pid}) at ${new Date().toISOString()}`);
    await channel.send(message);
  } catch (err) {
    console.error('Error in guildMemberAdd handler:', err);
  }
});

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
