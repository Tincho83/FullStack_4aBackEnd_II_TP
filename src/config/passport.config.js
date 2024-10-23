const passport = require("passport");
const local = require("passport-local");
const github = require("passport-github2");
const { isValidPassword, createHash } = require("../utils/utils");
const UsersManagerMongoDB = require("../dao/db/UsersManagerMongoDB");
const { config } = require("./config");
const passportJWT = require("passport-jwt");
const jwt = require("jsonwebtoken");

const cookieExtractor = req => {
    let token = null;

    if (req.cookies.currentUser) {
        token = req.cookies.currentUser;
    }
    return token;
}

const initPassport = () => {
    // Paso 1a: registro/inicio sesion local >>> signup/login        mini registro y login desde github >>> github
    passport.use("signup",
        new local.Strategy(
            {
                usernameField: "email",
                passReqToCallback: true
            },
            async (req, username, password, done) => {
                try {
                    let { first_name, last_name, age } = req.body

                    if (!first_name || !last_name || !age) {
                        return done(null, false);
                    }

                    let existe = await UsersManagerMongoDB.getUsersByDBMongo({ email: username });
                    if (existe) {
                        return done(null, false);
                    }

                    password = createHash(password);

                    const newuser = await UsersManagerMongoDB.addUsersDBMongo({ first_name, last_name, email: username, age, password });

                    return done(null, newuser);


                } catch (error) {
                    return done(error)
                }
            }
        )
    );

    passport.use("login",
        new local.Strategy(
            {
                usernameField: "email",
            },
            async (username, password, done) => {
                try {
                    let existe = await UsersManagerMongoDB.getUsersByDBMongo({ email: username });
                    if (!existe) {
                        return done(null, false);
                    }

                    if (!isValidPassword(password, existe.password)) {
                        return done(null, false);
                    }

                    //remover Datos sensibles
                    existe = { ...existe };
                    delete existe.password;

                    return done(null, existe);

                } catch (error) {
                    return done(error);
                }

            }
        )
    );

    passport.use("github",
        new github.Strategy(
            {
                clientID: config.GITHUB_CLIENTID,
                clientSecret: config.GITHUB_CLIENTSECRET,
                callbackURL: config.GITHUB_CALLBACKURL
            },
            async (token, refreshtoken, profile, done) => {
                try {
                    let { name, email } = profile._json;
                    if (!name || !email) {
                        return done(null, false);
                    }

                    let usuario = await UsersManagerMongoDB.getUsersByDBMongo({ email });
                    if (!usuario) {

                        let fullName = profile._json.name;
                        let nombres = fullName.split(" ");

                        let createdAt = new Date(profile._json.created_at);
                        let currentDate = new Date();
                        let diffInMilliseconds = currentDate - createdAt;
                        let millisecondsPerYear = 1000 * 60 * 60 * 24 * 365.25;
                        let yearsDifference = diffInMilliseconds / millisecondsPerYear;
                        let age = Math.floor(yearsDifference);

                        usuario = await UsersManagerMongoDB.addUsersDBMongo({ first_name: profile._json.name, last_name: "", email, age: 19, password: "", profileGithub: profile })
                    }

                    let token = jwt.sign(usuario, config.JWT_SECRET, { expiresIn: 300 }); // expira en 5 min

                    return done(null, usuario);

                } catch (error) {
                    return done(error);
                }

            }
        )
    );

    //cookieExtractor 
    passport.use("current",
        new passportJWT.Strategy(
            {
                secretOrKey: config.JWT_SECRET,
                jwtFromRequest: new passportJWT.ExtractJwt.fromExtractors([cookieExtractor])
            },
            async (user, done) => {
                try {
                    /*
                    if(user.role==="admin"){
                        return done(null, false, {message:"Ha ingresado como Administrador."})
                    }
                    */
                    if (!user) {
                        return done(null, false, { message: "Usuario no encontrado." })
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    )

}

module.exports = { initPassport };