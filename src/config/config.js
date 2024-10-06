const config = {
    PORT: 8080,
    MONGO_URL: "mongodb+srv://tincho83:Codin33Codin33@cluster0.hhucv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    MONGO_URLwithDB: "mongodb+srv://tincho83:Codin33Codin33@cluster0.hhucv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&dbName=DB_eCommerce",
    MONGO_USER: "tincho83",
    MONGO_PASS: "Codin33Codin33",
    MONGO_DBNAME: "ecommerce",
    MONGO_COLLPRODNAME: "products",
    MONGO_COLLCARTNAME: "carts",
    MONGO_COLLMSGSNAME: "messages",
    MONGO_COLLUSERSNAME: "users",
    CookieParser_SECRET: "Tincho03$",
    ExpressSessions_SECRET: "Tincho03$"
}

module.exports = { config };