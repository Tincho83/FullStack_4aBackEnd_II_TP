const express = require("express");
const fs = require("fs");
const moment = require("moment");
const { join, path } = require("path");
const { engine } = require("express-handlebars");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");

const { router: productsRouter } = require("../src/routes/products.router.js");
const { router: cartsRouter } = require("../src/routes/carts.router.js");
const { router: viewsRouter } = require("../src/routes/views.router.js");
const { router: usersRouter } = require("../src/routes/users.router.js");

const logMiddleware = require('./middlewares/logMiddleware.js');

const { connDB } = require("./connDB.js");
const { config } = require("./config/config.js");


const PORT = config.PORT;
let serverSocket;

const app = express();

app.use(cookieParser(config.CookieParser_SECRET));
console.log("Set Cookie");
app.get("/setCookie", (req, res) => {
    // Creación de la cookie
    res.cookie("NombreCookie", "ValorCookie", { maxAge: 1000 * 600 }).send("Cookie establecida");
});

console.log("Get Cookie");
app.get("/getCookie", (req, res) => {
    // Acceso a la cookie
    let cookie = req.cookies.NombreCookie;
    res.send(`Cookie valor: ${cookie}`);
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessions({ secret: config.ExpressSessions_SECRET,
                   resave: true,
                   // cookie: { secure: false }, // Cambiar a true si se usa https
                   saveUninitialized: true, }));


let ruta = join(__dirname, "public");
app.use(express.static(ruta));

app.use(logMiddleware);

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

app.use("/", (req, res, next) => {
    req.socket = serverSocket;
    next();
}, viewsRouter);


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