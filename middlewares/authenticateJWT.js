import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key_here';

export const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ result: false, error: 'Authorization header missing' });

    const token = authHeader.split(' ')[1]; // Expecting 'Bearer <token>'

    if (!token) return res.status(401).json({ result: false, error: 'Token missing' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ result: false, error: 'Invalid or expired token' });

        req.user = user;
        next();
    });
};
