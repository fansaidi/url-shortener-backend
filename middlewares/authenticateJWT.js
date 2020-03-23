const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const secretKey = process.env.SECRET_KEY || 'secret';

    if (authHeader) {
        const token = authHeader.replace('Bearer', '').trim();

        jwt.verify(token, secretKey, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

module.exports = authenticateJWT;