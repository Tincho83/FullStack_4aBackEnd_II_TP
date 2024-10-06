const fs = require("fs");

class CartsManager {

    static path;

    static async getCarts() {
        if (fs.existsSync(this.path)) {

            let carts = JSON.parse(await fs.promises.readFile(this.path, { encoding: "utf-8" }));
            return carts;

        } else {
            return [];
        }
    }

    static async addCart(prods = {}) {

        let carts = await this.getCarts();

        let id = 1;

        if (carts.length > 0) {
            id = Math.max(...carts.map(idp => idp.id)) + 1;
        }

        let nuevoCart = { id, ...prods };
        carts.push(nuevoCart);

        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 5), {encoding: "utf-8"});

        return nuevoCart;

    }

    static async addProductToCart(cid, pid) {

        let carts = await this.getCarts();
        let cart = carts.find(cart => cart.id === cid);

        if (!cart) {
            throw new Error("Carrito no encontrado");
        }

        let product = cart.products.find(prod => prod.product === pid);
        if (product) {
            product.quantity += 1;
        } else {
            cart.products.push({ product: pid, quantity: 1 });
        }

        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 5), {encoding: "utf-8"});
        return cart;

    }

    static async updateProduct(id, aModificar = {}) {
        let prods = await this.getProducts();
        let indiceProd = prods.findIndex(prod => prod.id === id);

        if (indiceProd === -1) {
            throw new Error(`Error: no existe el producto con id ${id}`);
        }

        prods[indiceProd] = {
            ...prods[indiceProd],
            ...aModificar,
            id
        }

        await fs.promises.writeFile(this.path, JSON.stringify(prods, null, 5), {encoding: "utf-8"});

        return prods[indiceProd];

    }

    static async deleteProduct(id) {
        let prods = await this.getProducts();
        let indiceProd = prods.findIndex(prod => prod.id === id);

        if (indiceProd === -1) {
            throw new Error(`Error: no existe el producto con id ${id}`);
        }

        let precant = prods.length;
        prods = prods.filter(prod => prod.id !== id);
        let postcant = prods.length;

        await fs.promises.writeFile(this.path, JSON.stringify(prods, null, 5), {encoding: "utf-8"});

        return precant - postcant;
    }
}

module.exports = CartsManager;