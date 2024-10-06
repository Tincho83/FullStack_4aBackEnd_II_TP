const logMiddleware = ( req, res, next) => {
console.log(`Se ha ingresado a la url: "${req.url}" usando metodo: "${req.method}". Fecha: ${new Date().toLocaleDateString()}`);
    next();
}

module.exports = logMiddleware;