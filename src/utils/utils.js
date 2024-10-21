const bcrypt = require("bcrypt");
const passport = require("passport");

const createHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(11));
};

const isValidPassword = (pass, hash) => {
    return bcrypt.compareSync(pass, hash);
};

const processesErrors = (res, error) => {
    console.log("Error: ", error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({
        error: `Error inesperado en el servidor. Intente mas tarde o consulte al Administrador.`,
        detalle: `${error.message}` //remover en produccion
    });
}

const passportCall = (controlStrategy) => function (req, res, next) {
    passport.authenticate(controlStrategy, function (err, user, info, status) {
        if (err) { return next(err) }
        if (!user) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(401).json({ error: `${info.message ? info.message : info.toString()}` })
        }
        req.user = user;
        return next();
    })(req, res, next);
}

module.exports = {
    createHash,
    isValidPassword,
    processesErrors,
    passportCall
};