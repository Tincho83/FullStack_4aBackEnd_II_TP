const { UsersModel } = require("../models/UsersModel");

// Manager para la BBDD de users
class UsersManagerMongoDB {

    //*Obtener Users
    static async getUsersDBMongo() {
        return await UsersModel.find().lean();
    }

    //*Obtener Users por credenciales
    static async getUserCredencialesDBMongo(email, password) {
        return await UsersModel.findOne({ email, password }).lean();
    }

    //*Obtener Users por medio de filtro
    static async getUsersByDBMongo(filter = {}) { //{ key:"value", key2: "value" }
        return await UsersModel.findOne(filter).lean();
    }

    //*Agregar Users a la BBDD
    static async addUsersDBMongo(User) {
        let prodNew = await UsersModel.create(User);
        return prodNew.toJSON();
    }



    //Obtener Users con paginacion
    static async getUsersDBMongoPaginate(page = 1, limit = 10, sort, searchCriteria = {}) {
        return await UsersModel.paginate(searchCriteria, { page: page, limit: limit, sort: sort, lean: true });
    }



    //Obtener cart por id
    static async getUserByIDDBMongo(id) {
        return await UsersModel.findOne({ _id: id }).lean();
        //return await UsersModel.findOne({ _id: id }).populate('products.product').lean();
    }



    //Actualizar User desde id con User con valores
    static async updateUserDBMongo(id, User) {
        return await UsersModel.findByIdAndUpdate(id, User, { new: true }).lean();
    }

    //Borrar User de la BBDD
    static async deleteUserDBMongo(id) {
        return await UsersModel.findByIdAndDelete(id, { new: true }).lean();
    }

}

module.exports = UsersManagerMongoDB;