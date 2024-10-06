const { mongoose } = require("mongoose");
const { config } = require("../../config/config");
//const paginate = require("mongoose-paginate-v2");

// coleccion de carts
const cartsColl = config.MONGO_COLLCARTNAME;

// esquema para carts
const cartsSchema = new mongoose.Schema(
    {
        products: {
            type: [
                {
                    product: {
                        type: mongoose.Schema.Types.ObjectId, ref: "products"
                    },
                    quantity: { type: Number, default: 1 }
                }
            ]
        }
    },
    {
        timestamps: true,
        strict: false,
    }
)

//cartsSchema.plugin(paginate);
cartsSchema.pre("findOne", function () {
    this.populate("products.product").lean();
});

const CartsModel = mongoose.model(
    cartsColl,
    cartsSchema
)

module.exports = { CartsModel };
