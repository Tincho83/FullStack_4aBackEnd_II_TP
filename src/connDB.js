const { mongoose } = require("mongoose");
const { config } = require("./config/config.js");

//Funcion de conexion a MongoDB
const connDB = async () => {
    try {
        await mongoose.connect(
            config.MONGO_URL,
            { dbName: config.MONGO_DBNAME }
        )
        console.log(`Se establecio conexion con la base de datos "${config.MONGO_DBNAME}" de manera exitosa.`)
    } catch (error) {
        console.log(`Error: No se pudo establecer conexion con la base de datos "${config.MONGO_DBNAME}". Motivo: ${error.message}`)
    }
}

module.exports = { connDB };