import djs from "discord.js"
import dotenv from 'dotenv';
dotenv.config();

import keepAlive  from "./keepAlive.js";
import reel from "./reel.js"
import db from "./db.js"

const client = new djs.Client({
  intents: [
    djs.GatewayIntentBits.Guilds,
    djs.GatewayIntentBits.GuildMessages,
    djs.GatewayIntentBits.MessageContent
  ]
})

client.on("ready", () => {
  console.log("Logged In")
  db.init()
})

client.on("messageCreate", async(msg) => {

  if(msg.author.bot) return;
  if (msg.webhookId) return;

  const regex = /https?:\/\/(?:www\.)?instagram\.com\/reel\/[A-Za-z0-9_-]+(?:\?[^\s]*)?/gi;
  const matches = msg.content.match(regex)
  if(!matches) return;
  const link = matches[0]

  const webhooks = await msg.channel.fetchWebhooks()
  let webhook = webhooks.first()

  if(!webhook) {
    webhook = await msg.channel.createWebhook({
      name: 'Reelscord',
      avatar: 'https://cdn.pixabay.com/photo/2021/06/15/12/14/instagram-6338393_1280.png',
    })
  }

  const data = await reel(link)
  if(data.success == 1) {

    const newMsg = msg.content.replace(link, `[Reel Link](${data.data[0].url}.mp4)`)

    const webMsg = await webhook.send({
      content: newMsg,
      username: `${msg.author.displayName}・[${msg.author.username}]`,
      avatarURL: msg.author.avatarURL()
    })

    db.add(msg.author.id, webMsg.id)

    msg.delete()
  } else {
    console.log(data.message)
  }

})

client.login(process.env.TOKEN)
keepAlive()