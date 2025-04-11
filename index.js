import djs from "discord.js"
import dotenv from 'dotenv';
dotenv.config();

import reel from "./reel.js"

const client = new djs.Client({
  intents: [
    djs.GatewayIntentBits.Guilds,
    djs.GatewayIntentBits.GuildMessages,
    djs.GatewayIntentBits.MessageContent
  ]
})

client.on("ready", () => {
  console.log("Logged In")
})

client.on("messageCreate", async(msg) => {

  if(msg.author.bot) return;
  if (msg.webhookId) return;

  const regex = /https?:\/\/(?:www\.)?instagram\.com\/reel\/[A-Za-z0-9_-]+/gi;
  const matches = msg.content.match(regex)
  if(!matches) return;
  const link = matches[0]

  const webhooks = await msg.channel.fetchWebhooks()
  let webhook = webhooks.first()

  if(!webhook) {
    webhook = await msg.channel.createWebhook({
      name: 'Reelscord',
      avatar: 'https://i.imgur.com/AfFp7pu.png',
    })
  }

  const data = await reel(link)
  if(data.success == 1) {

    const newMsg = msg.content.replace(link, `[Reel Link](${data.data[0].url}.mp4)`)

    await webhook.send({
      content: newMsg,
      username: `${msg.author.displayName}・[${msg.author.username}]`,
      avatarURL: msg.author.avatarURL()
    })

    msg.delete()
  } else {
    console.log(data.message)
  }

})

client.login(process.env.TOKEN)