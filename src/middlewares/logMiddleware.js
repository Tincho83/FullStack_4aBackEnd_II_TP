const fs = require("fs");
const { config } = require("../config/config.js");

const logMiddleware = (req, res, next) => {

    let log = `Se ha ingresado a la url: "${req.url}" usando metodo: "${req.method}". Fecha: ${new Date().toLocaleDateString()}`;
    console.log(log);

    if (fs.existsSync(config.PATH_LOGFILE)) {
        fs.appendFileSync(config.PATH_LOGFILE, "\n" + log)
    } else {
        fs.writeFileSync(config.PATH_LOGFILE, log);
    }


    next();
}

module.exports = logMiddleware;