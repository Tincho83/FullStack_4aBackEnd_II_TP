const bcrypt = require("bcrypt");

const createHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(11));
};

const isValidPassword = (pass, hash) => {
    return bcrypt.compareSync(pass, hash);
};

module.exports = {
    createHash,
    isValidPassword
};