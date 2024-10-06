const { Router } = require("express");
const { isValidObjectId } = require("mongoose");
const CartsManager = require("../dao/filesystem/CartsManager.js");
const CartsManagerMongoDB = require("../dao/db/CartsManagerMongoDB.js");
const ProductsManagerMongoDB = require("../dao/db/ProductsManagerMongoDB.js");
const ProductsManager = require("../dao/filesystem/ProductsManager.js");
const { CartsModel } = require("../dao/models/CartsModel.js");
const { ProductsModel } = require("../dao/models/ProductsModel.js");

const router = Router();

//CartsManager.path = "./src/data/carrito.json";

//EndPopints para el manejo de products

// 1.Obtener todos los carritos
router.get('/', async (req, res) => {

    try {
        let carts = await CartsManagerMongoDB.getCartsDBMongo();
        //console.log(`Se encontraron ${carts.length} carritos.`);
        res.setHeader('Content-type', 'application/json');
        return res.status(200).json({ carts })
    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }
})

// 2.Obtener carrito por id y sus productos
router.get('/:cid', async (req, res) => {

    let { cid } = req.params;
    if (!isValidObjectId(cid)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `id: ${cid} no valido,` })
    }

    try {
        // Llamamos al metodo con populate para obtener los datos completos de los productos
        let cart = await CartsManagerMongoDB.getCartByDBMongo(cid);
        if (!cart) {
            res.setHeader('Content-type', 'application/json');
            return res.status(404).json({ error: `Carrito con id: ${cid} no encontrado.` });
        }

        res.setHeader('Content-type', 'application/json');
        return res.status(200).json({ cart });
    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor. Intente nuevamente más tarde.`,
            detalle: error.message
        });
    }

});

// 3.Agregar carrito
router.post('/', async (req, res) => {
    //const { products = [] } = req.body;

    try {
        let cartnuevo = await CartsManagerMongoDB.addCartDBMongo();        
        res.setHeader('Content-type', 'application/json');
        return res.status(200).json({ cartnuevo });

    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde.`,
            detalle: `${error.message}`
        });
    }
})

//4.Agregar producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {

    let { cid, pid } = req.params;

    // Validar los ID
    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `ID(s) no validos. Verifique los Id's ingresados.` });
    }

    try {
        const cart = await CartsManagerMongoDB.getCartByDBMongo(cid);
        if (!cart) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ error: `Carrito inexistente ${cid}` });
        }

        const product = await ProductsManagerMongoDB.getProductsByDBMongo({ _id: pid });
        if (!product) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ error: `Producto ${pid} inexistente.` });
        }

        let indexProduct = cart.products.findIndex(p => p.product._id == pid);
        if (indexProduct === -1) {
            cart.products.push({
                product: pid, quantity: 1
            })
        } else {
            cart.products[indexProduct].quantity++;
        }

        let resultado = await CartsManagerMongoDB.updateCartsDBMongo(cid, cart);
        if (resultado.modifiedCount > 0) {
            res.setHeader('Content-type', 'application/json');
            res.status(200).json({ message: "Producto agregado al carrito" });
        } else {
            res.setHeader('Content-type', 'application/json');
            res.status(400).json({ error: "Error al agregar un producto al carrito" });
        }

    } catch (error) {
        console.error('Error al agregar el producto al carrito:', error);
        res.setHeader('Content-type', 'application/json');
        res.status(500).send('Error al agregar el producto al carrito');
    }

});

//5.Borra producto del carrito
router.delete('/:cid/product/:pid', async (req, res) => {

    let { cid, pid } = req.params;

    // Validar los ID
    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `ID(s) no válidos. Verifique los Is's ingresados.` });
    }

    try {
        // Obtener el carrito actual
        let cart = await CartsManagerMongoDB.getCartByDBMongo(cid);
        if (!cart) {
            //console.log(`Carrito NO encontrado ${cart}`);
            res.setHeader('Content-type', 'application/json');
            return res.status(404).json({ error: `Carrito no encontrado con ID: ${cid}` });
        }
        //console.log(`Carrito encontrado ${JSON.stringify(cart, null, 5)}`);


        // Filtrar los productos para eliminar el producto especificado
        const updatedProducts = cart.products.filter(item => item.product._id.toString() !== pid);
        // Si no se modifica nada, es porque el producto no estaba en el carrito
        if (updatedProducts.length === cart.products.length) {
            //console.log(`Producto con ID: ${pid} no encontrado en el carrito.`);
            res.setHeader('Content-type', 'application/json');
            return res.status(404).json({ error: `Producto con ID: ${pid} no encontrado en el carrito.` });
        }

        // Actualizar el carrito con la nueva lista de productos
        cart.products = updatedProducts;
        let prodDelete = await CartsManagerMongoDB.updateCartDBMongo(cid, cart);

        if (!prodDelete) {
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({ error: `No se pudo eliminar el producto id: ${cid}` })
        } else {
            //console.log(`Producto con ID: ${pid} eliminado del carrito con ID: ${cid}`)

            req.socket.emit("ProductoBorrado", pid);
            console.log("Evento *ProductoBorrado* emitido");

            res.setHeader('Content-type', 'application/json');
            return res.status(200).json({ message: `Producto id: ${pid} eliminado del carrito ${cid} exitosamente.` });
        }
    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }
})

//6.Actualizar carrito desde un arreglo
router.put('/:cid', async (req, res) => {

    const { cid } = req.params;
    // Validar el ID del carrito
    if (!isValidObjectId(cid)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `id: ${cid} no valido,` })
    }

    const productsToUpdate = req.body;

    // Validar que el body contiene un arreglo de productos
    if (!Array.isArray(productsToUpdate)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: "Se esperaba un arreglo de productos en el body" });
    }

    try {
        // Verificar si el carrito existe
        const cart = await CartsManagerMongoDB.getCartByDBMongo(cid);
        if (!cart) {
            res.setHeader('Content-type', 'application/json');
            return res.status(404).json({ error: `Carrito no encontrado con ID: ${cid}` });
        }

        // Validar que los productos existen en la base de datos de productos
        for (let product of productsToUpdate) {
            if (!isValidObjectId(product.product)) {
                res.setHeader('Content-type', 'application/json');
                return res.status(400).json({ error: `ID de producto no válido: ${product.product}` });
            }

            const existingProduct = await ProductsModel.findById(product.product).lean();
            if (!existingProduct) {
                res.setHeader('Content-type', 'application/json');
                return res.status(404).json({ error: `Producto no encontrado con ID: ${product.product}` });
            }
        }

        // Actualizar el carrito con los nuevos productos
        cart.products = productsToUpdate;

        // Actualizar el carrito en la base de datos
        const updatedCart = await CartsManagerMongoDB.updateCartDBMongo(cid, cart);

        if (!updatedCart) {
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({ error: `No se a podido actualizar el producto id: ${cid}, ${prodModified}` })
        }

        // Emitir el evento de actualización
        req.socket.emit("CarritoActualizado", updatedCart);
        console.log("Evento *CarritoActualizado* emitido");

        res.setHeader('Content-type', 'application/json');
        return res.status(200).json({ success: "Carrito actualizado correctamente", updatedCart });

    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }
});

//7.Actualizar en el carrito la cantidad de un producto pasado por body
router.put('/:cid/product/:pid', async (req, res) => {
    
    const { cid, pid } = req.params;
    // Validar el ID del carrito y del producto
    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: "ID de carrito o producto no válido" });
    }

    const { quantity } = req.body;
    // Validar que la cantidad sea un número mayor que 0
    if (!quantity || typeof quantity !== "number" || quantity <= 0) {
        return res.status(400).json({ error: "Cantidad no válida, debe ser un número mayor que 0" });
    }

    try {
        // Verificar si el carrito existe en la base de datos
        const cart = await CartsManagerMongoDB.getCartByDBMongo(cid);
        if (!cart) {
            res.setHeader('Content-type', 'application/json');
            return res.status(404).json({ error: `Carrito no encontrado con ID: ${cid}` });
        }
        // Verificar si el producto existe en la base de datos
        const product = await ProductsManagerMongoDB.getProductsByDBMongo({ _id: pid });
        if (!product) {
            res.setHeader('Content-type', 'application/json');
            return res.status(404).json({ error: `Producto no encontrado con ID: ${pid}` });
        }

        let indexProduct = cart.products.findIndex(p => p.product._id == pid);
        if (indexProduct === -1) {
            res.setHeader('Content-type', 'application/json');
            return res.status(404).json({ error: `Producto con ID: ${pid} no encontrado en el carrito ID: ${cid}.` });
        } else {
            cart.products[indexProduct].quantity = quantity;
        }

        // Guardar el carrito actualizado
        const updatedCart = await CartsManagerMongoDB.updateCartDBMongo(cid, cart);

        if (!updatedCart) {
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({ error: `No se pudo actualizar el carrito con ID: ${cid}` });
        }
        
        // Emitir el evento de actualización
        req.socket.emit("CarritoActualizado", updatedCart);
        console.log("Evento *CarritoActualizado* emitido");

        res.setHeader('Content-type', 'application/json');
        return res.status(200).json({ success: "Cantidad de producto actualizada correctamente", updatedCart });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Error inesperado en el servidor. Intente más tarde.",
            detalle: error.message
        });
    }
});

//8.Borrar todos los productos del carrito
router.delete('/:cid', async (req, res) => {

    let { cid } = req.params;

    if (!isValidObjectId(cid)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `id: ${cid} no valido,` })
    }

    try {
        // Buscar el carrito en la base de datos
        const cart = await CartsManagerMongoDB.getCartByDBMongo(cid);
        if (!cart) {
            res.setHeader('Content-type', 'application/json');
            return res.status(404).json({ error: `Carrito no encontrado con ID: ${cid}` });
        }

        // Eliminar todos los productos del carrito
        cart.products = [];

        // Guardar el carrito actualizado
        const updatedCart = await CartsManagerMongoDB.updateCartDBMongo(cid, cart);
        //console.log("Carrito actualizado a vacio: ", updatedCart);

        if (!updatedCart) {
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({ error: `No se pudo eliminar los productos del carrito id: ${cid}` })
        } else {
            req.socket.emit("ProductoBorrado", cid);
            console.log("Evento *ProductoBorrado* emitido");

            res.setHeader('Content-type', 'application/json');
            return res.status(200).json({ updatedCart })
        }
    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }
})

module.exports = { router };

