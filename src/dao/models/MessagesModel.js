const { mongoose } = require("mongoose");
const { config } = require("../../config/config");

const messagesColl = config.MONGO_COLLMSGSNAME;

const messagesSchema = new mongoose.Schema(
    {
        //id: { type: Number, required: true, unique: true },
        messages: { type: String, required: true },
        source: { type: String, required: true },
        destiny: { type: String, required: true },
        status: { type: Boolean, default: true },
        category: { type: String, required: true },
        thumbnails: { type: Array, required: false },
    },
    {
        timestamps: true,
        strict: false,
    }
)

const MessagesModel = mongoose.model(
    messagesColl,
    messagesSchema
)

module.exports = { MessagesModel };