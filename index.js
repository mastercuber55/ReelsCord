import djs, { EmbedBuilder } from "discord.js"
import dotenv from 'dotenv';
import mongoose from "mongoose"
dotenv.config();

import keepAlive from "./utils/keepAlive.js";
import users from "./Schemas/users.js"
import guilds from "./Schemas/guilds.js"

const client = new djs.Client({
  intents: [
    djs.GatewayIntentBits.Guilds,
    djs.GatewayIntentBits.GuildMessages,
    djs.GatewayIntentBits.GuildMessageReactions,
    djs.GatewayIntentBits.MessageContent
  ],
  partials: [
    djs.Partials.Message, 
    djs.Partials.Channel, 
    djs.Partials.Reaction
  ],
})

client.on("ready", () => {
  console.log("Logged In")
})

async function handleCommands(message) {

    const cmd = message.content.split(" ")[1]

    if(cmd == "set") {
      const channel = message.mentions?.channels?.first()

      if (!message.member.permissions.has(["ManageGuild", "Administrator"], false)) {
          await message.reply("❌ You need the **Manage Server** or **Administrator** permission to change the logging channel.");
          message.react("❌")
          return; 
      }

      if (channel) {
        await guilds.set(message.guild.id, channel.id)
        message.react("✅")
      } else {
        message.react("❌")
      }


    } else if(cmd == "remove") {
      if (!message.member.permissions.has(["ManageGuild", "Administrator"], false)) {
          await message.reply("❌ You need the **Manage Server** or **Administrator** permission to change the logging channel.");
          message.react("❌")
          return; 
      }
      await guilds.del(message.guild.id)
      message.react("✅")
    } else {
      const embed = new EmbedBuilder()
        .setTitle("Reelscoord ・Usage")
        .setDescription([
          "- Send 🔗 reel link to convert it to video.",
          "- React with ❌ to delete your reel.",
          `- **<@${client.user.id}> set #channel** to set a logging channel.`,
          `- **<@${client.user.id}> remove** to remove logging channel.`
        ].join("\n"))
        .setColor("Random")

        message.channel.send({ embeds: [embed] })
    }
}

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  if (message.mentions.has(client.user)) {
    return await handleCommands(message)
  }

  if (message.webhookId) return;

  const regex = /https?:\/\/[^\s]+/i;
  const matches = message.content.match(regex)
  if (!matches) return;

  const url = new URL(matches[0])
    const isInstagram = url.hostname === "instagram.com" || url.hostname === "www.instagram.com";
    const isReelOrPost = ["/reel/", "/reels/", "/p/"].some(path => url.pathname.startsWith(path))

    if (!isInstagram || !isReelOrPost) return;

    message.react("<:loading:1360808684825084095>")

    url.search = "" // Clean the URL, remove trackers.

    url.hostname = "kkinstagram.com"

    const webhooks = await message.channel.fetchWebhooks()
    let webhook = webhooks.find(wh => wh.name === client.user.username)

    if (!webhook) {
      webhook = await message.channel.createWebhook({
        name: client.user.username,
        avatar: client.user.avatarURL(),
      })
    }

    const webMsg = await webhook.send({
      content: `[Instagram Reel](${url.toString()})`,
      username: message.author.username,
      avatarURL: message.author.avatarURL()
    })

    users.add(message.author.id, webMsg.id)
    message.delete()

})

client.on("messageReactionAdd", async (reaction, user) => {
  
  const { message } = reaction

  await message.fetch()

  if (!message.webhookId) return;
  
  const emoji = reaction.emoji.name
  if (emoji != "❌") return;

  const messageId = message.id

  const has = await users.has(user.id, messageId)
  if (!has) return reaction.remove()

  users.del(user.id, messageId)

  const content = message.content

  
  const channelId = await guilds.get(message?.guildId)
  
  message.delete()  

  if (!channelId) return

  const channel = await message?.guild?.channels?.fetch(channelId)
  if (!channel) return

  const perms = channel.permissionsFor(message.guild.members.me)
  
  if (!perms || !perms.has(['ViewChannel', 'SendMessages'])) {
    return message.channel.send("⚠️ Lacking permissions to view or send message to logging channel!")
  }

  channel.send(`${reaction.message.content}\n**${user.username}**`)

})

process.on("uncaughtException", (error) => {
  console.error("❌ CRITICAL UNCAUGHT EXCEPTION:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ UNHANDLED PROMISE REJECTION at:", promise, "reason:", reason);
});

mongoose.connect(process.env.MONGODB);
client.login(process.env.TOKEN)
keepAlive()

