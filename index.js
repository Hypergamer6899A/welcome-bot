// index.js
const { Client, GatewayIntentBits, REST, Routes, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();
const express = require('express');

// --- Discord Bot Setup ---
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages],
});

const joinMessages = [
  "{Servername} has joined {Username}... Wait I got it backwards, dang it",
  "{Username} has arrived, let's see how long they last...",
  "{Username} just made the member count {PlayerCount}",
  "Good luck {Username}, you'll need it",
  "{PlayerCount} members now counting {Username}!",
  "{Username}? That's an interesting name...",
  "No way, could it be? Is it... oh wait, it's just {Username}",
  "{ServerName} has a brand new member. It's the one, the only, {Username}!",
  "{Username} just got kidnapped",
  "{Username} discovered the nether",
  "{Username} might just be the reason I quit",
  "{Username} is here, how many more people are gonna join?",
  "{Username} joined {ServerName}, or did they?",
  "Hey {Username}, {ServerName} here. Your home security system is great! Or is it?",
  "Do we really need {Username}? Oh wait they're already here",
  "It's a bird, it's a plane, it's... it's {Username}!",
  "{ServerName} now has {Username} to worry about",
  "Welcome {Username}. Yes I got lazy with this message, don't judge me"
];

// --- Helper ---
function formatMessage(template, member) {
  return template
    .replace(/{Username}/g, `<@${member.id}>`)
    .replace(/{PlayerCount}/g, member.guild.memberCount)
    .replace(/{ServerName}/g, member.guild.name);
}


// --- Send Welcome ---
async function sendWelcome(member, isTest = false) {
  if (!member) return;
  if (member.user.bot && !isTest) return; // skip bots normally, allow for test

  const channel = member.guild.channels.cache.get(process.env.CHANNEL_ID);
  if (!channel) return console.error("❌ Channel not found. Check CHANNEL_ID.");

  const messageTemplate = joinMessages[Math.floor(Math.random() * joinMessages.length)];
  const message = formatMessage(messageTemplate, member);

  try {
    await channel.send(message);
    console.log(`Sent welcome message for ${member.user.tag}${isTest ? ' (test)' : ''}`);
  } catch (err) {
    console.error('Failed to send welcome message:', err);
  }
}

// --- Event: New member joins ---
client.on('guildMemberAdd', (member) => sendWelcome(member, false));

// --- Register Slash Command ---
client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag} (pid=${process.pid})`);

  const commands = [
    {
      name: 'testwelcome',
      description: 'Sends a test welcome message to a specified user',
      options: [
        {
          name: 'user',
          type: 6, // USER
          description: 'User to test the welcome message for',
          required: true,
        },
      ],
      default_member_permissions: PermissionFlagsBits.Administrator.toString(), // admin-only
    },
  ];

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Slash command registered.');
  } catch (err) {
    console.error('Failed to register slash commands:', err);
  }
});

// --- Handle Slash Command ---
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'testwelcome') {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ You do not have permission to use this.', ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    const guildMember = interaction.guild.members.cache.get(user.id);
    if (!guildMember) return interaction.reply({ content: 'User not found in this server.', ephemeral: true });

    // Send as a test, bypassing guildMemberAdd
    await sendWelcome(guildMember, true);
    return interaction.reply({ content: `✅ Test welcome sent to ${user.tag}`, ephemeral: true });
  }
});

// --- Login Bot ---
client.login(process.env.TOKEN).catch(err => {
  console.error('Failed to login bot. Check TOKEN env variable.', err);
});

// --- Express server for Render ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot is running!'));
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    bot: client.user ? client.user.tag : 'starting',
    pid: process.pid,
    time: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🌐 Tiny web server listening on port ${PORT} (pid=${process.pid})`);
});
