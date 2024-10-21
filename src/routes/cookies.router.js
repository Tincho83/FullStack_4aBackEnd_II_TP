const express = require('express');
const router = express.Router();


// Ruta para obtener cookie
router.get('/getcookie', (req, res) => {

    if (!req.cookies || !req.signedCookies) {

        console.log("Sin cookies");

        res.setHeader('Content-Type', 'application/json');
        return res.status(401).json({ error: `No hay cookies.` });
    } else {
        //console.log("Cookies: ", req.cookies);
        //console.log("Cookies Firmadas: ", req.signedCookies);

        // Acceso a la cookie
        let cookies = req.cookies;
        let cookiesSign = req.signedCookies;
        let cookiesSignString = JSON.stringify(cookiesSign);
        let cookie = req.cookies.ApplicationPref;

        //res.send(`Cookie valor:  ${cookiesSignString}`);

        res.setHeader('Content-type', 'application/json');
        return res.status(200).json({ cookiesSignString });
    }


});


// Ruta para crear una cookie
router.post('/setcookie', (req, res) => {

    const { user } = req.body;

    let iComCookie = {
        "user": user
    };

    res.cookie("SignUpUser", iComCookie, { maxAge: 1000 * 60 * 1, signed: true, httpOnly: true });

    res.setHeader('Content-type', 'application/json');
    return res.status(200).json({ payload: "Cookie Generada" });

});


// Ruta para eliminar la cookie
router.get('/delcookie', (req, res) => {

    let cookies = Object.keys(req.cookies);
    let cookiesSign = Object.keys(req.signedCookies);

    cookies.forEach(namecookie => {
        console.log("cookie a borrar: ", namecookie);
        res.clearCookie(namecookie);
    })

    cookiesSign.forEach(namecookie => {
        console.log("cookie a borrar: ", namecookie);
        res.clearCookie(namecookie);
    })

    res.setHeader('Content-type', 'application/json');
    return res.status(200).json({ payload: "Cookie/s Eliminada/s." });

});

module.exports = { router };