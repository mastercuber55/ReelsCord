import { Schema, model } from "mongoose"

const user = new Schema({
    _id: {
      type: String,
      required: true
    },
    messageIds: {
      type: [String],
      default: []
    }
  });

user.statics.add = async function (userId, messageId) {
    return this.findByIdAndUpdate(
        userId,
        { $addToSet: { messageIds: messageId } },
        { upsert: true, new: true }
    );
};

user.statics.del = async function (userId, messageId) {
    return this.findByIdAndUpdate(
    userId,
    { $pull: { messageIds: messageId } },
    { new: true }
    );
};

user.statics.has = async function (userId, messageId) {
    const user = await this.findById(userId, { messageIds: 1 });
    return user?.messageIds.includes(messageId) || false;
};

export default model("users", user)