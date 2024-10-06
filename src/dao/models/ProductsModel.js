const { mongoose } = require("mongoose");
const { config } = require("../../config/config");
const  paginate = require("mongoose-paginate-v2");

// coleccion de products
const productsColl = config.MONGO_COLLPRODNAME;

// esquema para products
const productsSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        code: { type: String, required: true, unique: true },
        price: { type: Number, required: true },
        status: { type: Boolean, default: true },
        stock: { type: Number, required: true },
        category: { type: String, required: true },
        thumbnails: { type: Array, required: false },
    },
    {
        timestamps: true,
        strict: false,
    }    
)

// plugin para usar paginate
productsSchema.plugin(paginate);

const ProductsModel = mongoose.model(
    productsColl,
    productsSchema,
)

module.exports = { ProductsModel };

