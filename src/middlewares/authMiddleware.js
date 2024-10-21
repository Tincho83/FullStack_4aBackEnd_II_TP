const jwt = require("jsonwebtoken");
const { config } = require("../config/config");

const authMiddleware = (req, res, next) => {

    let url = req.url;
    let { web } = req.query;

    if (!req.cookies.currentUser) {

        res.setHeader('Content-Type', 'application/json');
        return res.status(401).json({ error: `Credenciales No autorizadas. Sin token` });
    }

    let token = req.cookies.currentUser;

    try {

        let usuario = jwt.verify(token, config.JWT_SECRET);
        req.user = usuario;

        // Todos redireccionan a /products pero solo role: "admin" tiene permisos para /realtimeproducts
        if (req.user.role != "admin") {

            if (url.includes("/realtimeproducts")) {
                return res.redirect("/products");
            }
        }

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            res.clearCookie('currentUser');
            return res.status(401).json({ error: "Token expirado. Por favor, actualize la pagina e inicie sesión de nuevo." });
        } else {
            console.log("Error al verificar el token: ", error.message);

            res.setHeader('Content-Type', 'application/json');
            return res.status(401).json({ error: `Credenciales No autorizadas.`, detalle: error.message });
        }
    }

    return next();
}

module.exports = authMiddleware;