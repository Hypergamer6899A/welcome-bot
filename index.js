// index.js (CommonJS)
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// Your messages
const joinMessages = [
  "Welcome to the server, {Username}! You're member #{PlayerCount} 🎉",
  "Hey {Username}, glad you joined! We’re now {PlayerCount} strong 💪",
  "{Username} just appeared — bringing us up to {PlayerCount} members!",
  "A wild {Username} has joined! Total members: {PlayerCount} 👀",
  "Welcome aboard, {Username}! You’re lucky number {PlayerCount} 🚀"
];

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('guildMemberAdd', (member) => {
  const channel = member.guild.channels.cache.get(process.env.CHANNEL_ID);
  if (!channel) {
    console.error('❌ Channel not found. Check CHANNEL_ID in Render env variables.');
    return;
  }

  const template = joinMessages[Math.floor(Math.random() * joinMessages.length)];
  const message = template
    .replace(/{Username}/g, member.user.username)
    .replace(/{PlayerCount}/g, member.guild.memberCount);

  channel.send(message).catch(err => console.error('Failed to send welcome message:', err));
});

// Login the bot
client.login(process.env.TOKEN).catch(err => {
  console.error('Failed to login the bot. Check TOKEN env variable:', err);
});

// -------- tiny HTTP server so Render sees an open port --------
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot is running');
});

// optional health endpoint
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', bot: client.user ? client.user.tag : 'starting' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Tiny web server listening on port ${PORT}`);
});

