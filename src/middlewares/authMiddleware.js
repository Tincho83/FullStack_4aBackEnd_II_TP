const authMiddleware = (req, res, next) => {
    if (!req.session.usuario) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(401).json({ error: `No hay usuarios autenticados` });
    }

    return next();
}

module.exports = authMiddleware;