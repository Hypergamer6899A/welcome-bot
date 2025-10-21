import { Client, GatewayIntentBits } from "discord.js";
import "dotenv/config";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

const joinMessages = [
  "🎉 Welcome {Username}! You’re the {Player count}th member!",
  "👋 {Username} joined — we’re now {Player count} strong!",
  "🌟 Say hi to {Username}! That makes {Player count} members!",
  "{Username} appeared! Current population: {Player count}."
];

client.on("guildMemberAdd", async (member) => {
  const channel = member.guild.systemChannel; // or replace with your specific channel ID
  if (!channel) return;

  const message = joinMessages[Math.floor(Math.random() * joinMessages.length)]
    .replace(/{Username}/g, member.user.username)
    .replace(/{Player count}/g, member.guild.memberCount);

  channel.send(message);
});

client.login(process.env.TOKEN);
