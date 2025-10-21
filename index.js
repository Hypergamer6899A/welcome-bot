const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// List of custom join messages
const joinMessages = [
  "Welcome to GoShiggy's Basement {Username}!",
  "{Username} just made the membercound {PlayerCount}!",
  "Oh, {Username} just joined. Lets see how long they last"
];

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('guildMemberAdd', (member) => {
  // Get channel ID from environment variable
  const channel = member.guild.channels.cache.get(process.env.CHANNEL_ID);
  if (!channel) return console.error("❌ Channel not found. Check CHANNEL_ID.");

  // Pick a random message
  const messageTemplate = joinMessages[Math.floor(Math.random() * joinMessages.length)];

  // Replace placeholders
  const message = messageTemplate
    .replace(/{Username}/g, member.user.username)
    .replace(/{PlayerCount}/g, member.guild.memberCount);

  // Send it!
  channel.send(message);
});

client.login(process.env.TOKEN);
