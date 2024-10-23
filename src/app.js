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
const jwt = require("jsonwebtoken");

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
const { passportCall } = require("./utils/utils.js");


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

//Paso 2:
initPassport();
app.use(passport.initialize());

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
let rutaviews = join(__dirname, '/views');
app.set('views', rutaviews);

app.use("/api/products",
    (req, res, next) => {
        req.socket = serverSocket;
        next();
    }, passport.authenticate("current", { session: false }), productsRouter);  // para passportCall: passportCall("current"), productsRouter); 

app.use("/api/carts/", cartsRouter);

app.use('/api/users', usersRouter);

app.use('/api/cookies', cookiesRouter);

app.use('/api/sessions', sessionsRouter);

app.use("/", (req, res, next) => {
    req.socket = serverSocket;
    next();
}, viewsRouter);

let servername = process.env.COMPUTERNAME;
let nodeversion = process.version;
let modversion = process.versions;
let pid = process.pid;

const serverHTTP = app.listen(PORT, () => console.log(`

***************************************                                    
* Servidor en linea sobre puerto ${PORT} *
***************************************                                    

# Url:
    http://localhost:${PORT}


# Iniciado en el servidor: ${servername}
# con el proceso Id: ${pid}
# usando version de NodeJS: ${nodeversion}
# Nombre y Version de Modulos: ${JSON.stringify(modversion, null, 5)}

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