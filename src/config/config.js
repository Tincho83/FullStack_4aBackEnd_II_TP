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
    ExpressSessions_SECRET: "Tincho07$",
    JWT_SECRET: "Tincho11$",
    PATH_LOGFILE: "./src/log.txt",
    PATH_STOSESS: "./src/sessions",
    GITHUB_APPID: "1021894",
    GITHUB_CLIENTID: "Iv23lio4Na64NA4Q6u86",
    GITHUB_CLIENTSECRET: "f7a7e78ba138695c859771052a19c3d1baf01a2f",
    GITHUB_CALLBACKURL: "http://localhost:8080/api/sessions/callbackGithub"   
}

module.exports = { config };
