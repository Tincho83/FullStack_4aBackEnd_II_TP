const { Router } = require("express");
const { isValidObjectId } = require("mongoose");
const sessions = require("express-session");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const ProductsManagerMongoDB = require("../dao/db/ProductsManagerMongoDB.js");
const ProductsManager = require("../dao/filesystem/ProductsManager.js");
const CartsManager = require("../dao/filesystem/CartsManager.js");
const CartsManagerMongoDB = require("../dao/db/CartsManagerMongoDB.js");

const authMiddleware = require("../middlewares/authMiddleware.js");
const { config } = require("../config/config");

const router = Router();

let changename = undefined;

//1. EndPoint para vista Home
router.get("/", (req, res) => {

    // Verificar si existe la cookie con el token JWT
    if (!req.cookies.currentUser) {
        return res.redirect("/login");
    }

    try {
        let usuario = jwt.verify(req.cookies.currentUser, config.JWT_SECRET);
        req.user = usuario;
    } catch (error) {
        if (error.name === "TokenExpiredError") {

            res.clearCookie('currentUser');
            return res.status(401).json({ error: "Token expirado. Por favor, actualize la pagina e inicie sesión de nuevo." });
        } else {
            console.log("Error al verificar el token: ", error.message);
            return res.status(401).json({ error: "Token inválido. Acceso no autorizado." });
        }
    }

    let token = req.cookies.currentUser;

    let usuario = jwt.verify(token, config.JWT_SECRET);
    req.user = usuario;

    let contador = usuario.contador ? usuario.contador + 1 : 1;

    // Actualizar el token JWT con el contador actualizado
    let nuevoToken = jwt.sign({ ...usuario, contador: contador }, config.JWT_SECRET, {});

    // Guardar el nuevo token en la cookie
    res.cookie("currentUser", nuevoToken, { httpOnly: true });



    let titulo = "Te damos la bienvenida al Portal de Acceso a Productos.";

    if (!req.user) {
        return res.redirect("/login");
    }

    // Construcción del título basado en si hay un usuario o no
    if (!req.user) {
        titulo += ` Has visitado la página ${req.contador} veces sin haberte registrado. Te invitamos a Registrarte o Iniciar Sesión`;        
    } else {
        titulo += ` ${req.user.first_name} ${req.user.last_name}, has visitado la página ${contador} veces.`;        
    }

    let sesion = JSON.stringify(req.session);    

    // Renderizar la respuesta
    res.setHeader('Content-type', 'text/html');
    res.status(200).render("home", { titulo, isLogin: req.user });
});

router.get("/signup", (req, res) => {
    let titulo = "Registracion.";

    // Verificar si existe la cookie con el token JWT
    if (req.cookies.currentUser) {
        return res.redirect("/profile");
    }

    res.setHeader('Content-type', 'text/html');
    res.status(200).render("signup", { titulo, isLogin: req.user });
});

router.get("/login", (req, res) => {
    let titulo = "Inicio de Sesion.";

    if (req.cookies.currentUser) {
        return res.redirect("/profile");
    }

    res.setHeader('Content-type', 'text/html');
    res.status(200).render("login", { titulo, isLogin: req.user });
});

router.get("/profile", passport.authenticate("current", { session: false, failureRedirect: "/api/sessions/error" }), (req, res) => {

    let usuario;

    // Verificar si existe la cookie con el token JWT
    if (!req.cookies.currentUser) {
        return res.redirect("/login");
    }

    try {
        //let usuario = jwt.verify(req.cookies.currentUser, config.JWT_SECRET);
        //req.user = usuario;
        usuario = req.user;
        //console.log (usuario);
    } catch (error) {
        if (error.name === "TokenExpiredError") {

            res.clearCookie('currentUser');
            //return res.status(401).json({ error: "Token expirado. Por favor, actualize la pagina e inicie sesión de nuevo." });
            alert("Token expirado. Por favor, actualize la pagina e inicie sesión de nuevo.");
            return res.redirect("/login");
        } else {
            console.log("Error al verificar el token: ", error.message);
            return res.status(401).json({ error: "Token inválido. Acceso no autorizado." });
        }
    }

    let titulo = `Bienvenido \r\n\r\n Perfil`;



    if (req.contador) {
        req.contador++;
        titulo += ` Visita ${req.contador}`
    } else {
        req.contador = 1;
        titulo += ` Visita ${req.contador}`
    }

    res.setHeader('Content-type', 'text/html');
    res.status(200).render("profile", { titulo, usuario, isLogin: req.user });
});

router.get("/resetpassword", (req, res) => {
    let titulo = `Bienvenido`;

    res.setHeader('Content-type', 'text/html');
    res.status(200).render("resetpassword", { titulo });
});




//2. EndPoint para vista de producto en /products
router.get('/products/:pid', passport.authenticate("current", { session: false, failureRedirect: "/api/sessions/error" }), async (req, res) => {

    const { pid } = req.params;
    if (!isValidObjectId(pid)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: 'ID de carrito no válido.' });
    }

    try {
        // Obtener los productos con el ID pid
        let product = await ProductsManagerMongoDB.getProductsByDBMongo({ _id: pid });
        if (!product) {
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({ error: `No existen productos con el id: ${pid}` });
        }

        let titulo = "Detalle del Producto";

        res.setHeader('Content-type', 'text/html');
        res.status(200).render("product", {
            titulo,
            product
        });

    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }
})

//3. EndPoint para vista de carrito en /carts
router.get('/carts/:cid', async (req, res) => {

    const { cid } = req.params;
    if (!isValidObjectId(cid)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: 'ID de carrito no válido.' });
    }

    try {
        // Obtener los productos del carrito con el ID cid
        const cart = await CartsManagerMongoDB.getCartByDBMongo(cid);

        if (!cart) {
            res.setHeader('Content-type', 'application/json');
            return res.status(404).json({ error: 'Carrito no encontrado.' });
        }

        let titulo = "Listado de Productos del Carrito";
        const prodss = cart.products;  // Suponiendo que el carrito tiene un array de productos

        let subtotal = 0;
        let total = 0;

        prodss.forEach(p => {
            subtotal += p.product.price * p.quantity;
        });

        res.setHeader('Content-type', 'text/html');
        res.status(200).render("carts", {
            titulo,
            subtotal,
            prodss,
            cartId: cid
        });

    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }
})

//4. EndPoint para vista productos
router.get('/products', passport.authenticate("current", { session: false }), async (req, res) => {

    let prodss;
    let dataObject = {};
    let cSort = {};

    let usersession = req.user;

    let titulo = `Bienvenido ${req.user.role} ${req.user.first_name} ${req.user.last_name} (${req.user.email}). Listado de Productos`;

    let { page, limit, sort, query, type } = req.query;

    // Validacion de los parametros
    if (type && !['category', 'price', 'title', 'status', 'stock'].includes(type)) {
        dataObject = {
            status: 'error',
            message: 'Tipo de búsqueda inválido.'
        };

        // Retornar un error 400 (Bad Request) indicando que el tipo no es valido
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json(dataObject);
    }

    if (!page || isNaN(Number(page))) {
        page = 1;
    }

    if (!limit || isNaN(Number(limit))) {
        limit = 10;
    }

    if (!sort) {
        //console.log(`orden no definida: ${sort}`);
    } else {
        let criteriosSep = sort.split(',');

        criteriosSep.forEach(element => {
            let [criterio, orden] = element.split(':');

            let valorOrden = (orden === 'asc') ? 1 : (orden === 'desc') ? -1 : null;

            if (valorOrden !== null) {
                // Agregar el criterio y el valor al objeto cSort
                cSort[criterio] = valorOrden;
            }
        });
    }

    let searchCriteria = {};

    try {
        if (!query) {
            //console.log('Busqueda general');
            prodss = await ProductsManagerMongoDB.getProductsDBMongoPaginate(page, limit, cSort);
        } else {
            //console.log('Busqueda por criterio');
            // Criterio de busqueda con base en el tipo de filtro
            if (type === 'category') {
                searchCriteria = { category: new RegExp(query, 'i') };
            } else if (type === 'price') {
                searchCriteria = { price: query };
            } else if (type === 'title') {
                searchCriteria = { title: new RegExp(query, 'i') }; // Insensible a mayus/minus
            } else if (type === 'status') {
                searchCriteria = { status: query.toLowerCase() === 'true' };
            } else if (type === 'stock') {
                searchCriteria = { stock: query }; // Insensible a mayus/minus
            }

            prodss = await ProductsManagerMongoDB.getProductsDBMongoPaginate(page, limit, cSort, searchCriteria);

            if (prodss.docs.length === 0) {
                dataObject = {
                    status: 'error',
                    message: 'No se encontraron productos que coincidan con la busqueda.'
                };

                res.setHeader('Content-type', 'application/json');
                return res.status(404).json(dataObject);
            }
        }

        let prevLink;
        let nextLink;
        let pageLink;
        let lastLink;
        let showLastPage;

        const baseUrl = `/products?page=${prodss.page}&limit=${limit}`;
        const filters = `&sort=${sort || ''}&query=${query || ''}&type=${type || ''}`.trim();

        if (prodss.hasPrevPage) {
            prevLink = `${baseUrl.replace(`page=${prodss.page}`, `page=${prodss.prevPage}`)}${filters}`;
        } else {
            prevLink = null;
        }

        if (prodss.hasNextPage) {
            nextLink = `${baseUrl.replace(`page=${prodss.page}`, `page=${prodss.nextPage}`)}${filters}`;
        } else {
            nextLink = null;
        }

        pageLink = `${baseUrl}${filters}`;
        lastLink = `/products?page=${prodss.totalPages}&limit=${limit}${filters}`;

        if (prodss.nextPage == prodss.totalPages || !prodss.nextPage) {
            showLastPage = false;
        } else {
            showLastPage = true;
        }

        dataObject = {
            status: 'success',
            payload: prodss.docs,
            totalPages: prodss.totalPages,
            prevPage: prodss.prevPage,
            nextPage: prodss.nextPage,
            page: prodss.page,
            pageLink: pageLink,
            hasPrevPage: prodss.hasPrevPage,
            hasNextPage: prodss.hasNextPage,
            prevLink: prevLink,
            nextLink: nextLink,
            lastLink: lastLink,
            hasLastPage: showLastPage
        };

    } catch (error) {
        console.log(error);

        dataObject = {
            status: 'error',
            message: 'Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.',
            errorDetails: error.message
        };

        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }
    res.setHeader('Content-type', 'text/html');
    res.status(200).render("index", {
        titulo,
        products: prodss.docs,
        dataObject,
        isLogin: req.user
    });
})

//5. EndPoint para vista de productos en tiempo real usando socket.io
router.get('/realtimeproducts', authMiddleware, async (req, res) => {

    let prodss;
    let dataObject = {};
    let cSort = {};

    let usersession = req.user;

    let titulo = `Bienvenido ${req.user.role} ${req.user.first_name} ${req.user.last_name} (${req.user.email}). Listado de Productos en tiempo Real`;

    let { page, limit, sort, query, type } = req.query;

    // Validación de los parámetros
    if (type && !['category', 'price', 'title', 'status', 'stock'].includes(type)) {
        dataObject = {
            status: 'error',
            message: 'Tipo de búsqueda inválido.'
        };
        //console.log(`${dataObject.status}: ${dataObject.message} `);

        // Retornar un error 400 (Bad Request) indicando que el tipo no es valido
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json(dataObject);
    }

    if (!page || isNaN(Number(page))) {
        page = 1;
    }

    if (!limit || isNaN(Number(limit))) {
        limit = 10;
    }

    if (!sort) {
        //console.log(`orden no definida: ${sort}`);
    } else {
        let criteriosSep = sort.split(',');

        criteriosSep.forEach(element => {
            let [criterio, orden] = element.split(':');

            let valorOrden = (orden === 'asc') ? 1 : (orden === 'desc') ? -1 : null;

            if (valorOrden !== null) {
                // Agregar el criterio y el valor al objeto cSort
                cSort[criterio] = valorOrden;
            }
        });
    }

    let searchCriteria = {};

    try {
        if (!query) {
            //console.log('Busqueda general');            
            prodss = await ProductsManagerMongoDB.getProductsDBMongoPaginate(page, limit, cSort);
        } else {
            //console.log('Busqueda por criterio');
            // Criterio de busqueda con base en el tipo de filtro
            if (type === 'category') {
                searchCriteria = { category: new RegExp(query, 'i') };
            } else if (type === 'price') {
                searchCriteria = { price: query };
            } else if (type === 'title') {
                searchCriteria = { title: new RegExp(query, 'i') }; // Insensible a mayus/minus
            } else if (type === 'status') {
                searchCriteria = { status: query.toLowerCase() === 'true' };
            } else if (type === 'stock') {
                searchCriteria = { stock: query }; // Insensible a mayus/minus
            }

            prodss = await ProductsManagerMongoDB.getProductsDBMongoPaginate(page, limit, cSort, searchCriteria);

            if (prodss.docs.length === 0) {
                dataObject = {
                    status: 'error',
                    message: 'No se encontraron productos que coincidan con la búsqueda.'
                };

                res.setHeader('Content-type', 'application/json');
                return res.status(404).json(dataObject);
            }
        }

        let prevLink;
        let nextLink;
        let pageLink;
        let lastLink;
        let showLastPage;

        const baseUrl = `/realtimeproducts?page=${prodss.page}&limit=${limit}`;
        const filters = `&sort=${sort || ''}&query=${query || ''}&type=${type || ''}`.trim();

        if (prodss.hasPrevPage) {
            prevLink = `${baseUrl.replace(`page=${prodss.page}`, `page=${prodss.prevPage}`)}${filters}`;
        } else {
            prevLink = null;
        }

        if (prodss.hasNextPage) {
            nextLink = `${baseUrl.replace(`page=${prodss.page}`, `page=${prodss.nextPage}`)}${filters}`;
        } else {
            nextLink = null;
        }

        pageLink = `${baseUrl}${filters}`;
        lastLink = `/realtimeproducts?page=${prodss.totalPages}&limit=${limit}${filters}`;

        if (prodss.nextPage == prodss.totalPages || !prodss.nextPage) {
            showLastPage = false;
        } else {
            showLastPage = true;
        }

        dataObject = {
            status: 'success',
            payload: prodss.docs,
            totalPages: prodss.totalPages,
            prevPage: prodss.prevPage,
            nextPage: prodss.nextPage,
            page: prodss.page,
            pageLink: pageLink,
            hasPrevPage: prodss.hasPrevPage,
            hasNextPage: prodss.hasNextPage,
            prevLink: prevLink,
            nextLink: nextLink,
            lastLink: lastLink,
            hasLastPage: showLastPage
        };

    } catch (error) {
        console.log(error);

        dataObject = {
            status: 'error',
            message: 'Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.',
            errorDetails: error.message
        };

        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }
    res.setHeader('Content-type', 'text/html');
    res.status(200).render("realTimeProducts", {
        titulo,
        products: prodss.docs,
        dataObject,
        isLogin: req.user
    });
});

router.get("/current",
    passport.authenticate("current", { session: false, failureRedirect: "/api/sessions/error" }),
    (req, res) => {
        try {
            res.setHeader('Content-type', 'application/json');
            return res.status(200).json({ user: req.user });
        } catch (error) {
            console.error("Error en el endpoint /current:", error);

            res.setHeader('Content-type', 'application/json');
            return res.status(500).json({
                error: "Error inesperado en el servidor.",
                detalle: error.message
            });
        }
    });


module.exports = { router };