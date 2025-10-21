// index.js
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const express = require('express'); // Express for Render port

// --- Discord Bot Setup ---
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

const joinMessages = [
  "Welcome to the server, {Username}! You're member #{PlayerCount} 🎉",
  "Hey {Username}, glad you joined us! We’re now {PlayerCount} strong 💪",
  "{Username} just appeared — bringing us up to {PlayerCount} members!",
  "A wild {Username} has joined! Total members: {PlayerCount} 👀",
  "Welcome aboard, {Username}! You’re lucky number {PlayerCount} 🚀"
];

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('guildMemberAdd', (member) => {
  const channel = member.guild.channels.cache.get(process.env.CHANNEL_ID);
  if (!channel) return console.error("❌ Channel not found. Check CHANNEL_ID.");

  const messageTemplate = joinMessages[Math.floor(Math.random() * joinMessages.length)];
  const message = messageTemplate
    .replace(/{Username}/g, member.user.username)
    .replace(/{PlayerCount}/g, member.guild.memberCount);

  channel.send(message).catch(console.error);
});

client.login(process.env.TOKEN).catch(err => {
  console.error('Failed to login bot. Check TOKEN env variable.', err);
});

// --- Tiny Express Server for Render Port Scan ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot is running!'));
app.get('/health', (req, res) => res.json({ status: 'ok', bot: client.user ? client.user.tag : 'starting' }));

app.listen(PORT, () => {
  console.log(`🌐 Tiny web server listening on port ${PORT}`);
});

