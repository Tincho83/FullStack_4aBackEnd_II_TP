const { Router } = require("express");
const { isValidObjectId } = require("mongoose");
const crypto = require("crypto");

const UsersManagerMongoDB = require("../dao/db/UsersManagerMongoDB");
const { UsersModel } = require("../dao/models/UsersModel.js");
const { config } = require("../config/config");
const { createHash, isValidPassword } = require("../utils/utils");
const passport = require("passport");

const router = Router();

router.get("/error", (req, res) => {
    res.setHeader('Content-type', 'application/json');
    return res.status(401).json({ error: "Error al autenticar" });
});

router.post("/signup",
    passport.authenticate("signup", { failureRedirect: "/api/sessions/error" }),
    (req, res) => {
        res.setHeader('Content-type', 'application/json');
        return res.status(201).json({ result: "Registro Ok", newuser: req.user });
    });
/*
router.post("/signup", async (req, res) => {

    //{"first_name": "Operario", "last_name": "Operario", "email": "operario@test.com", "password":"ope123" }
    //{"first_name": "Admin", "last_name": "Admin", "email": "admin@test.com", "role": "admin", "password":"admin123" }


    // role,
    let { first_name, last_name, email, age, password } = req.body;


    // !role ||
    if (!first_name || !last_name || !email || !age || !password) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ status: "error", error: "Incomplete values." })
    }

    //poner validaciones 


    try {
        let existe = await UsersManagerMongoDB.getUsersByDBMongo({ email });
        if (existe) {
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({ status: "error", error: `Ya existe un usuario con el email '${email}'.` })
        }

        password = createHash(password);
        console.log("pass hash: ", password);
        //password = crypto.createHmac("sha512", config.ExpressSessions_SECRET).update(password).digest("hex");

        //role,
        const result = await UsersManagerMongoDB.addUsersDBMongo({ first_name, last_name, email, age, password });

        res.setHeader('Content-type', 'application/json');
        return res.status(201).json({ result: "Registro Ok", result });
        //res.send({ status: 'success', payload: result });
    } catch (error) {
        console.log(error);

        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }
});
*/


router.post("/login",
    passport.authenticate("login", { failureRedirect: "/api/sessions/error" }),
    (req, res) => {

        req.session.user = req.user;
        res.setHeader('Content-type', 'application/json');
        return res.status(200).json({ payload: "Login Ok", existe: req.user });
    });
/*
router.post("/login", async (req, res) => {
    //router.get('/login', async (req, res) => {

    let { email, password } = req.body;

    console.log("email: ", email);
    console.log("pass: ", password);

    if (!email || !password) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ status: "error", error: "Incomplete values." })
    }

    try {
        //password = crypto.createHmac("sha512", config.ExpressSessions_SECRET).update(password).digest("hex");
        //let existe = await UsersManagerMongoDB.getUsersByDBMongo({ email, password });
        let existe = await UsersManagerMongoDB.getUsersByDBMongo({ email });
        if (!existe) {
            res.setHeader('Content-type', 'application/json');
            return res.status(401).json({ status: "error", error: `Credenciales invalidas.` })
        }

        if (!isValidPassword(password, existe.password)) {
            res.setHeader('Content-type', 'application/json');
            return res.status(401).json({ status: "error", error: `Credenciales invalidas.` })
        }


        
        //if (email == "adminCoder@coder.com" && password == "adminCoder") {
            //req.session.user = email;
        //    req.session.admin = true;
            //res.setHeader('Content-type', 'application/json');
            //return res.status(200).json({ status: "Ok" })
        //}
        

        delete existe.password;

        req.session.user = existe;

        res.setHeader('Content-type', 'application/json');
        return res.status(201).json({ result: "Login Ok", existe });
        //res.send({ status: 'success', payload: result });

    } catch (error) {
        console.log(error);

        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }
});
*/

router.get('/logout', async (req, res) => {

    let { web } = req.query;

    req.session.destroy(error => {
        if (error) {
            res.setHeader('Content-type', 'application/json');
            return res.status(500).json({
                error: `Error inesperado en el servidor, no se pudo realizar cierre de sesion.`,
                detalle: `${error.message}`
            });
        }
        if (web) {
            return res.redirect("/login?mensaje=Logout Exitoso.")
        } else {
            res.setHeader('Content-type', 'application/json');
            return res.status(200).json({ payload: "Logout Ok" });
        }
    })

});

router.put("/resetpassword", async (req, res) => {

    let { email, password } = req.body;

    if (!email || !password) {
        res.setHeader('Content-type', 'application/json');
        return res.status(400).json({ status: "error", error: "Incomplete values." })
    }

    try {
        let existe = await UsersManagerMongoDB.getUsersByDBMongo({ email });
        if (!existe) {
            res.setHeader('Content-type', 'application/json');
            return res.status(400).json({ status: "error", error: `No existe un usuario con el email '${email}'.` })
        }

        password = createHash(password);
        console.log("pass hash: ", password);

        const result = await UsersManagerMongoDB.updateUserDBMongo(existe._id, { password });

        res.setHeader('Content-type', 'application/json');
        return res.status(201).json({ result: "Reseteo password Ok", result });
    } catch (error) {
        console.log(error);

        res.setHeader('Content-type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor, vuelva a intentar mas tarde o contacte con el administrador.`,
            detalle: `${error.message}`
        });
    }
});

module.exports = { router };

