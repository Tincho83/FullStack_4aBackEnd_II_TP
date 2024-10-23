const { Router } = require("express");
const { isValidObjectId } = require("mongoose");
const crypto = require("crypto");

const UsersManagerMongoDB = require("../dao/db/UsersManagerMongoDB");
const { UsersModel } = require("../dao/models/UsersModel.js");
const { config } = require("../config/config");
const { createHash, isValidPassword } = require("../utils/utils");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const router = Router();

//Paso 3:
router.get("/error", (req, res) => {
    res.setHeader('Content-type', 'application/json');
    return res.status(401).json({ error: "Error al autenticar" });
});

router.post("/signup",
    passport.authenticate("signup", { session: false, failureRedirect: "/api/sessions/error" }), // add "session: false" si no se usa sessions
    (req, res) => {
        res.setHeader('Content-type', 'application/json');
        return res.status(201).json({ result: "Registro Ok", newuser: req.user });
    });

router.post("/login",
    passport.authenticate("login", { session: false, failureRedirect: "/api/sessions/error" }), // add "session: false" si no se usa sessions
    (req, res) => {

        //remover Datos sensibles
        let existe = { ...req.user };
        delete existe.password;

        let token = jwt.sign(req.user, config.JWT_SECRET, { expiresIn: 300 }); //exp 5min

        res.cookie("currentUser", token, { httpOnly: true });

        res.setHeader('Content-type', 'application/json');
        return res.status(201).json({ payload: `Login Ok para ${req.user.first_name}: ${JSON.stringify(req.user)} token: ${token}`, existe });
    });

router.get('/logout', async (req, res) => {

    let { web } = req.query;

    res.clearCookie('currentUser');

    req.session.destroy(error => {
        if (error) {
            res.setHeader('Content-type', 'application/json');
            return res.status(500).json({
                error: `Error inesperado en el servidor, no se pudo realizar cierre de sesion.`,
                detalle: `${error.message}`
            });
        }
        if (web) {
            return res.redirect("/login?mensaje=Logout Success.")
        } else {
            res.setHeader('Content-type', 'application/json');
            return res.status(200).json({ payload: "Logout Success" });
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

//Paso 3:
router.get("/github",
    passport.authenticate("github", { session: false }),
    (req, res) => {

        let token = jwt.sign(req.user, config.JWT_SECRET, { expiresIn: 300 }); //exp 5min
        res.cookie("currentUser", token, { httpOnly: true });

    });


router.get("/callbackGithub",
    passport.authenticate("github", { session: false, failureRedirect: "/api/sessions/error" }),
    (req, res) => {

        let user = req.user;
        delete user.profileGithub._raw;

        let token = jwt.sign(user, config.JWT_SECRET, { expiresIn: 300 }); //exp 5min

        if (!token) {
            return res.status(500).json({ error: "Token no encontrado." });
        }


        try {
            res.cookie("currentUser", encodeURIComponent(token), { httpOnly: true });
        } catch (error) {
            console.log("creando currentUser: error: ", error);
        }

        return res.redirect("/profile");

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