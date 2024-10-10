const passport = require("passport");
const local = require("passport-local");
const { isValidPassword, createHash } = require("../utils/utils");
const UsersManagerMongoDB = require("../dao/db/UsersManagerMongoDB");

const initPassport = () => {
    // Paso 1a:
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
                        console.log("passport.Incomplete values.");
                        return done(null, false);
                    }

                    let existe = await UsersManagerMongoDB.getUsersByDBMongo({ email: username });
                    if (existe) {
                        console.log(`passport.Ya existe un usuario con el email '${username}'.`);
                        return done(null, false);
                    }

                    password = createHash(password);
                    console.log("passport.pass hash: ", password);

                    const newuser = await UsersManagerMongoDB.addUsersDBMongo({ first_name, last_name, email: username, age, password });

                    console.log("passport.Registro Ok", newuser);
                    return done(null, newuser);


                } catch (error) {            //                                  error>null>sin error  user>false>no_hay_user
                    return done(error) //OPciones "return(error)" Or "done(null, false)" Or "return done(null, user)"
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
                        console.log(`Passport.Credenciales invalidas. '${existe}'.`);
                        return done(null, false);
                    }

                    if (!isValidPassword(password, existe.password)) {
                        console.log(`Passport.Credenciales invalidas. '${existe}'.`);
                        return done(null, false);
                    }

                    console.log("passport.Login Ok", existe);
                    return done(null, existe);

                } catch (error) {            //                                  error>null>sin error  user>false>no_hay_user
                    return done(error); //OPciones "return(error)" Or "done(null, false)" Or "return done(null, user)"
                }

            }
        )

    );


    // Paso 1b: Solo si uso session. no, si uso JWT
    passport.serializeUser((user, done) => {
        console.log("passport.Serialize Ok", user._id);
        return done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        let user = await UsersManagerMongoDB.getUsersByDBMongo({ _id: id });
        console.log("passport.Deserialize Ok", user);
        return done(null, user);
    });

}


module.exports = { initPassport };