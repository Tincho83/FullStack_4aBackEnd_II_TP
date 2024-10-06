const { CartsModel } = require("../models/CartsModel");
const { ProductsModel } = require("../models/ProductsModel.js");

class CartsManagerMongoDB {

    //Obtener carts
    static async getCartsDBMongo() {
        return await CartsModel.find().lean();
    }

    //Obtener cart por id
    static async getCartByDBMongo(id) {
        return await CartsModel.findOne({ _id: id }).populate('products.product').lean();
    }

    //Agregar product a la BBDD
    static async addCartDBMongo() {
        let cartNew = await CartsModel.create({ products: [] });
        return cartNew.toJSON();
    }

    //Actualizar cart desde id con product con valores
    static async updateCartsDBMongo(id, cart) {
        return await CartsModel.updateOne({ _id: id }, cart);
    }

    //Actualizar cart desde id con product con valores
    static async updateCartDBMongo(id, cart) {
        return await CartsModel.findByIdAndUpdate(id, cart, { new: true }).lean();
    }

    //Borrar cart de la BBDD
    static async deleteCartDBMongo(id) {
        return await CartsModel.findByIdAndDelete(id, { new: true }).lean();
    }

}

module.exports = CartsManagerMongoDB;