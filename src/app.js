const express = require("express");
const fs = require("fs");
const moment = require("moment");
const { join, path } = require("path");
const { engine } = require("express-handlebars");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const FileStore = require("session-file-store");
const MongoStore = require("connect-mongo");
const passport = require("passport");

const { router: productsRouter } = require("../src/routes/products.router.js");
const { router: cartsRouter } = require("../src/routes/carts.router.js");
const { router: viewsRouter } = require("../src/routes/views.router.js");
const { router: usersRouter } = require("../src/routes/users.router.js");
const { router: sessionsRouter } = require("../src/routes/sessions.router.js");
const { router: cookiesRouter } = require("../src/routes/cookies.router.js");

const logMiddleware = require('./middlewares/logMiddleware.js');

const { connDB } = require("./connDB.js");
const { config } = require("./config/config.js");
const { initPassport } = require("./config/passport.config.js");

//const { UsersModel } = require("./dao/models/UsersModel.js");
//const UsersManagerMongoDB = require("./dao/db/UsersManagerMongoDB.js");


const PORT = config.PORT;
let serverSocket;

const fileStore = FileStore(sessions);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser(config.CookieParser_SECRET));

app.use(logMiddleware);

let ruta = join(__dirname, "public");
app.use(express.static(ruta));

app.use(sessions({
    secret: config.ExpressSessions_SECRET,
    resave: true, // cookie: { secure: false }, // Cambiar a true si se usa https    
    saveUninitialized: true,
    //store: new fileStore({ path: config.PATH_STOSESS, ttl:830, retries: 0}) //Persistencia en FS
    store: MongoStore.create({
            mongoUrl: config.MONGO_URL,
            dbName: config.MONGO_DBNAME,
            ttl: 830,
        })
}));
initPassport();
app.use(passport.initialize());
app.use(passport.session()); //SOlo si uso sessions


app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
let rutaviews = join(__dirname, '/views');
app.set('views', rutaviews);

app.use("/api/products",
    (req, res, next) => {
        req.socket = serverSocket;
        next();
    }, productsRouter);

app.use("/api/carts/", cartsRouter);

app.use('/api/users', usersRouter);

app.use('/api/cookies', cookiesRouter);

app.use('/api/sessions', sessionsRouter);

app.use("/", (req, res, next) => {
    req.socket = serverSocket;
    next();
}, viewsRouter);

/*
first_name
"Admin"

last_name
"Admin"

email
"admin@test.com"

role
"admin"

password
"admin123"

app.get("/login", async (req, res) => {
    let { email, password } = req.query;
    res.setHeader('Set-Cookie', 'Titulo=Subtitulo;Path=/');

    if (!email || !password) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ status: "error", error: "Incomplete values." })
    }
    console.log(email);
    console.log(password);

    //http://localhost:8080/login?email=admin&password=admin123
    let user = await UsersManagerMongoDB.getUserCredencialesDBMongo(email, password);

    if (!user) {
        res.setHeader('Content-type', 'application/json');
        return res.status(401).json({ status: "error", error: "Credenciales Invalidas." })
    }

    console.log(user);

    req.session.user = user;
    res.setHeader('Content-type', 'application/json');
    return res.status(200).json({ payload: `Login Ok de: ${user.email}` });
})
*/


const serverHTTP = app.listen(PORT, () => console.log(`

***************************************                                    
* Servidor en linea sobre puerto ${PORT} *
***************************************                                    

# Url:
    http://localhost:${PORT}

`));

serverSocket = new Server(serverHTTP);

// Emision de Fecha y Hora
setInterval(() => {
    let horahhmmss = moment().format('DD/MM/yyyy hh:mm:ss A');
    serverSocket.emit("HoraServidor", horahhmmss);
}, 500);

// Funcion para cada cliente que se conecta
serverSocket.on('connection', (socket) => {

    let dato;
    let sessionTime = moment().format('DD/MM/yyyy hh:mm:ss');

    console.log(`Nuevo cliente conectado: ${socket.id} a las ${sessionTime}`);

    socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${socket.id}`);
    });
});

// Funcion para conectarse a la BBDD.
connDB();