const authMiddleware = (req, res, next) => {

    let { web } = req.query;

    console.log("auth")
    if (!req.session.user) {

        console.log("Sin sesion")
        if (web) {
            console.log("Redireccionando con param web...");

            return res.redirect("/login?mensaje=Sin Usuario Autenticado");
        } else {
            console.log("Mostrando msj sin param web");
            res.setHeader('Content-Type', 'application/json');
            return res.status(401).json({ error: `No hay usuarios autenticados.` });
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