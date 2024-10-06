const { Router } = require("express");
const { isValidObjectId } = require("mongoose");
const ProductsManager = require("../dao/filesystem/ProductsManager.js");
const ProductsManagerMongoDB = require("../dao/db/ProductsManagerMongoDB");
const { ProductsModel } = require("../dao/models/ProductsModel.js");

const router = Router();

//ProductsManager.path = "./src/data/productos.json";

//EndPopints para el manejo de products

// 1.Obtener todos los productos
router.get('/', async (req, res) => {

    let prodss;
    let dataObject = {};
    let cSort = {};

    let { page, limit, sort, query, type } = req.query;

    // Validacion de parametros
    if (type && !['category', 'price', 'title', 'status', 'stock'].includes(type)) {
        dataObject = {
            status: 'error',
            message: 'Tipo de búsqueda inválido.'
        };
        //console.log(`${dataObject.status}: ${dataObject.message} `);

        // Retornar error 400 (Bad Request) indicando que el tipo no es valido
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
                    status: 'Sin Resultados.',
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
            //pageLink: pageLink,
            hasPrevPage: prodss.hasPrevPage,
            hasNextPage: prodss.hasNextPage,
            prevLink: prevLink,
            nextLink: nextLink,
            //lastLink: lastLink,
            //hasLastPage: showLastPage
        };

    } catch (error) {
        console.log(error);

        dataObject = {
            status: 'error',
            message: 'Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.'
        };

        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }
    res.setHeader('Content-type', 'application/json');
    return res.status(200).json({ dataObject })
})

// 2.Obtener producto por id
router.get('/:id', async (req, res) => {

    let { id } = req.params;
    if (!isValidObjectId(id)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `id: ${id} no valido,` })
    }

    try {
        let product = await ProductsManagerMongoDB.getProductsByDBMongo({ _id: id });
        if (!product) {
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({ error: `No existen productos con el id: ${id}` });
        }

        res.setHeader('Content-type', 'application/json');
        return res.status(200).json({ product })
    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }
})

// 3.Agregar producto
router.post('/', async (req, res) => {
    
    let { title, description, code, price, stock, category } = req.body;
    
    if (!title || !description || !code || !price || !stock || !category) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ status: "error", error: "Incomplete values." })
    }

    try {
        let existe = await ProductsManagerMongoDB.getProductsByDBMongo({ code })
        if (existe) {
            //console.log(`Producto ${code} existente en DB.`);
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({ error: `Producto ${code} existente en DB.` })
        }
        
        let prodNew = await ProductsManagerMongoDB.addProductDBMongo({ title, description, code, price, stock, category })
        
        req.socket.emit("nuevoProducto", prodNew);
        console.log("Evento *nuevoProducto* emitido");

        res.setHeader('Content-type', 'application/json');
        return res.status(201).json({ prodNew })

    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Erro.r inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }
})

//4.Actualizar producto
router.put('/:id', async (req, res) => {
    
    let { id } = req.params;
    if (!isValidObjectId(id)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `id: ${id} no valido,` })
    }
    
    let prodToModify = req.body;
    
    let existingProduct = await ProductsModel.findOne({ _id: id });
    
    if (existingProduct && existingProduct.id !== id) {
        console.log(existingProduct);
        res.setHeader('Content-type', 'application/json');
        return res.send({ status: "error", error: "Duplicate ID found" });
    }

    // Comprobar si codigo existe en otro producto
    if (prodToModify.code) {
        let productWithSameCode = await ProductsModel.findOne({ code: prodToModify.code, _id: { $ne: id } });

        if (productWithSameCode) {
            //console.log("Producto con código duplicado encontrado:", productWithSameCode);
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({ error: `El código ${prodToModify.code} ya está en uso por otro producto.` });
        }
    }
    
    try {
        let prodModified = await ProductsManagerMongoDB.updateProductDBMongo(id, prodToModify)
        if (!prodModified) {
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({ error: `No se a podido actualizar el producto id: ${id}, ${prodModified}` })
        }

        req.socket.emit("ProductoActualizado", prodModified);
        console.log("Evento *ProductoActualizado* emitido");

        res.setHeader('Content-type', 'application/json');
        return res.status(200).json({ success: `producto actualizado id: ${id}` })

    } catch (error) {
        console.log(error);
        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }
})

//5.Borrar producto
router.delete('/:id', async (req, res) => {

    let { id } = req.params;
    if (!isValidObjectId(id)) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ error: `id: ${id} no valido,` })
    }

    try {
        let prodDelete = await ProductsManagerMongoDB.deleteProductDBMongo(id);
        if (!prodDelete) {
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({ error: `No se pudo eliminar el producto id: ${id}` })
        } else {

            req.socket.emit("ProductoBorrado", id);
            console.log("Evento *ProductoBorrado* emitido");

            res.setHeader('Content-type', 'application/json');
            return res.status(200).json({ prodDelete })
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