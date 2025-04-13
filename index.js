import djs from "discord.js"
import dotenv from 'dotenv';
import mongoose from "mongoose"
dotenv.config();

import keepAlive  from "./utils/keepAlive.js";
import reel from "./utils/reel.js"
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

client.on("messageCreate", async(message) => {

  if(message.author.bot) return;

  if(message.mentions.has(client.user)) {
    const reaction = await message.react("<:loading:1360808684825084095>")
    
    const channel = message.mentions?.channels?.first()

    if(channel) {
      await guilds.set(message.guild.id, channel.id)
      message.react("✅")
    } else {
      message.react("❌")
    }

    reaction.remove()
  }

  if (message.webhookId) return;

  const regex = /https?:\/\/(?:www\.)?instagram\.com\/reel\/[\w-]+(?:\/)?(?:\?[^\s]*)?/gi
  const matches = message.content.match(regex)
  if(!matches) return;

  message.react("<:loading:1360808684825084095>")

  const link = matches[0]

  const webhooks = await message.channel.fetchWebhooks()
  let webhook = webhooks.first()

  if(!webhook) {
    webhook = await message.channel.createWebhook({
      name: 'Reelscord',
      avatar: 'https://cdn.pixabay.com/photo/2021/06/15/12/14/instagram-6338393_1280.png',
    })
  }

  const data = await reel(link)
  if(data.success == 1) {

    const newMsg = message.content.replace(link, `[Reel](${data.data[0].url}.mp4)`)

    const webMsg = await webhook.send({
      content: newMsg,
      username: `${message.author.displayName}・[${message.author.username}]`,
      avatarURL: message.author.avatarURL()
    })

    users.add(message.author.id, webMsg.id)
    message.delete()
  } else {
    console.log(data.message)
  }

})

client.on("messageReactionAdd", async(reaction, user) => {
  
  await reaction.message.fetch()

  if(!reaction.message.webhookId) return;
  
  const emoji = reaction.emoji.name
  if(emoji != "❌") return;

  const messageId = reaction.message.id

  const has = await users.has(user.id, messageId)
  if(!has) return reaction.remove()

  users.del(user.id, messageId)

  const content = reaction.message.content

  reaction.message.delete()
  
  const channelId = await guilds.get(reaction.message?.guildId)
  if(!channelId) return
  const channel = await reaction.message?.guild?.channels?.fetch(channelId)
  if(!channel) return

  channel.send(`${reaction.message.content}\n**${reaction.message.author.displayName}・[${reaction.message.author.username}]**`)

})

mongoose.connect(process.env.MONGODB);
client.login(process.env.TOKEN)
keepAlive()