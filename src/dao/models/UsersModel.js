const { mongoose } = require("mongoose");
const { config } = require("../../config/config");

// coleccion de users
const usersColl = config.MONGO_COLLUSERSNAME;

// esquema para users
const usersSchema = new mongoose.Schema(
    {
        first_name: { type: String, required: true },
        last_name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        age: { type: Number, required: true },
        role: { type: String, required: true, default: 'user' },
        password: { type: String },
        //cart: { Id: { type: mongoose.Schema.Types.ObjectId, ref: "carts" } },
    },
    {
        timestamps: true,
        strict: false,
    }
)

const UsersModel = mongoose.model(
    usersColl,
    usersSchema,
)

module.exports = { UsersModel };