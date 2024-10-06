const { ProductsModel } = require("../models/ProductsModel");

// Manager para la BBDD de products
class ProductsManagerMongoDB {

    //Obtener products
    static async getProductsDBMongo() {
        return await ProductsModel.find().lean();
    }

    //Obtener products con paginacion
    static async getProductsDBMongoPaginate(page = 1, limit = 10, sort, searchCriteria = {}) {
        return await ProductsModel.paginate(searchCriteria, { page: page, limit: limit, sort: sort, lean: true });
    }

    //Obtener products por medio de filtro
    static async getProductsByDBMongo(filter = {}) { //{ key:"value", key2: "value" }
        return await ProductsModel.findOne(filter).lean();
    }

    //Agregar product a la BBDD
    static async addProductDBMongo(product) {
        let prodNew = await ProductsModel.create(product);
        return prodNew.toJSON();
    }

    //Actualizar product desde id con product con valores
    static async updateProductDBMongo(id, product) {
        return await ProductsModel.findByIdAndUpdate(id, product, { new: true }).lean();        
    }

    //Borrar product de la BBDD
    static async deleteProductDBMongo(id) {
        return await ProductsModel.findByIdAndDelete(id, { new: true }).lean();
    }

}

module.exports = ProductsManagerMongoDB;