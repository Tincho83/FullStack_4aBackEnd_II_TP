const { Router } = require("express");
const { isValidObjectId } = require("mongoose");
const sessions = require("express-session");

const ProductsManagerMongoDB = require("../dao/db/ProductsManagerMongoDB.js");
const ProductsManager = require("../dao/filesystem/ProductsManager.js");
const CartsManager = require("../dao/filesystem/CartsManager.js");
const CartsManagerMongoDB = require("../dao/db/CartsManagerMongoDB.js");
const authMiddleware = require("../middlewares/authMiddleware.js");

const router = Router();

let changename = undefined;

//1. EndPoint para vista Home
router.get("/", (req, res) => {

    let titulo = "Te damos la bienvenida al Portal de Acceso a Productos.";
    const name = req.query.name;
    console.log(`0:  params: ${req.query.name}, name: ${name}, session: ${req.session.user}, contador: ${req.session.contador}, previousname: ${req.session.previousName}`);

    // Verificar si el nombre ha cambiado o si ha sido removido el parámetro
    if (req.session.previousName && req.session.previousName !== name) {
        // Si el nombre cambió o se removió, reseteamos el contador y usuario
        req.session.contador = 0;
        req.session.user = null;
        console.log(`1:  params: ${req.query.name}, name: ${name}, session: ${req.session.user}, contador: ${req.session.contador}, previousname: ${req.session.previousName}`);
    }

    // Si el parámetro "name" está presente y es diferente al nombre anterior o no existe en la sesión
    if (name && (!req.session.user || req.session.user !== name)) {
        req.session.user = name;
        req.session.contador = 1; // Reiniciar contador al cambiar o agregar nombre
        console.log(`2:  params: ${req.query.name}, name: ${name}, session: ${req.session.user}, contador: ${req.session.contador}, previousname: ${req.session.previousName}`);
    } else if (!name && req.session.contador === 0) {
        // Si no hay un nombre y no hay contador, inicializarlo
        req.session.contador = 1;
        console.log(`3:  params: ${req.query.name}, name: ${name}, session: ${req.session.user}, contador: ${req.session.contador}, previousname: ${req.session.previousName}`);
    } else if (req.session.contador) {
        req.session.contador++; // Incrementar el contador si ya existe
        console.log(`4:  params: ${req.query.name}, name: ${name}, session: ${req.session.user}, contador: ${req.session.contador}, previousname: ${req.session.previousName}`);
    } else {
        req.session.contador = 1;
        console.log(`5:  params: ${req.query.name}, name: ${name}, session: ${req.session.user}, contador: ${req.session.contador}, previousname: ${req.session.previousName}`);
    }

    // Construcción del título basado en si hay un usuario o no
    if (!req.session.user) {
        titulo += ` Has visitado la página ${req.session.contador} veces sin haberte registrado. Te invitamos a Registrarte o Iniciar Sesión`;
        console.log(`6:  params: ${req.query.name}, name: ${name}, session: ${req.session.user}, contador: ${req.session.contador}, previousname: ${req.session.previousName}`);
    } else {
        titulo += ` ${req.session.user}, has visitado la página ${req.session.contador} veces.`;
        console.log(`7:  params: ${req.query.name}, name: ${name}, session: ${req.session.user}, contador: ${req.session.contador}, previousname: ${req.session.previousName}`);
    }

    // Guardar el valor actual de name en la sesión para futuras comparaciones
    req.session.previousName = name;
    console.log(`8:  params: ${req.query.name}, name: ${name}, session: ${req.session.user}, contador: ${req.session.contador}, previousname: ${req.session.previousName}`);

    let sesion = JSON.stringify(req.session);

    console.log(`9:  session: ${sesion}`);

    // Renderizar la respuesta
    res.setHeader('Content-type', 'text/html');
    res.status(200).render("home", { titulo, isLogin: req.session.user });

});

router.get("/signup", (req, res) => {
    let titulo = "Registracion.";

    res.setHeader('Content-type', 'text/html');
    res.status(200).render("signup", { titulo, isLogin: req.session.user });
});

router.get("/login", (req, res) => {
    let titulo = "Inicio de Sesion.";

    res.setHeader('Content-type', 'text/html');
    res.status(200).render("login", { titulo, isLogin: req.session.user });
});

router.get("/profile", authMiddleware, (req, res) => {
    let titulo = `Bienvenido \r\n\r\n Perfil`;

    let usuario = req.session.user;
    console.log(usuario);

    if (req.session.contador) {
        req.session.contador++;
        titulo += ` Visita ${req.session.contador}`
    } else {
        req.session.contador = 1;
        titulo += ` Visita ${req.session.contador}`
    }

    res.setHeader('Content-type', 'text/html');
    res.status(200).render("profile", { titulo, usuario, isLogin: req.session.user });
});




//2. EndPoint para vista de producto en /products
router.get('/products/:pid', async (req, res) => {

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
router.get('/products', async (req, res) => {

    let titulo = "Listado de Productos";
    let prodss;
    let dataObject = {};
    let cSort = {};

    let { page, limit, sort, query, type } = req.query;

    // Validacion de los parametros
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
        isLogin: req.session.user
    });
})

//5. EndPoint para vista de productos en tiempo real usando socket.io
router.get('/realtimeproducts', authMiddleware, async (req, res) => {

    let titulo = "Listado de Productos en tiempo Real";
    let prodss;
    let dataObject = {};
    let cSort = {};

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
        isLogin: req.session.user
    });
});


module.exports = { router };