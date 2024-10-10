const authMiddleware = (req, res, next) => {

    console.log("auth")

    url = req.url;
    console.log("url solicitante:", url);

    let { web } = req.query;

    if (!req.session.user) {

        console.log("Sin sesion creada")

        if (web) {
            console.log("Redireccionando con param web...");

            return res.redirect("/login?mensaje=Sin Usuario Autenticado");
        } else {
            console.log("Mostrando msj sin param web");
            res.setHeader('Content-Type', 'application/json');
            return res.status(401).json({ error: `No hay usuarios autenticados.` });
        }
    }

    if (req.session.user.role != "admin") {
        console.log("Con sesion creada")
        console.log("Sin permisos de rol admin")

        if (url.includes("/realtimeproducts")) {
            console.log("Redireccionando a products");
            return res.redirect("/products");
        }
    }


    /*
        let { email, password } = req.query;
        if (!email || !password || email != "admin@coder.com" || password != "123") {
            res.setHeader('Content-Type', 'application/json');
            return res.status(401).json({ error: `Credenciales Invalidas.` });
        }
    */



    return next();
}

module.exports = authMiddleware;

// import {authMiddleware} ftom './middlewares/authMiddleware.js';
// app.post("/api/heroes", authMiddleware (req, res) =>{});
//http://localhost:8080/api/heroes?email=admin@coder.com&password=123