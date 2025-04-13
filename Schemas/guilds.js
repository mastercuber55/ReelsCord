import { Schema, model } from "mongoose"

const guild = new Schema({
    _id: {
      type: String,
      required: true
    },
    channelId: {
      type: String,
      required: true
    }
  });

guild.statics.set = async function (guildId, channelId) {
return this.findByIdAndUpdate(
    guildId,
    { channelId },
    { upsert: true, new: true }
);
};

guild.statics.get = async function (guildId) {
    const doc = await this.findById(guildId);
    return doc?.channelId || null;
};

export default model("guilds", guild)