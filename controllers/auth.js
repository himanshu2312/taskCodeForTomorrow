import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'codeForTomorrow';  // Use env var in prod

export const login = (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ result: false, error: 'Email and password are required' });
    }

    // Check credentials against fixed admin account
    if (email === 'admin@codesfortomorrow.com' && password === 'Admin123!@#') {
        // Generate JWT token
        const payload = { email, role: 'admin' };
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });

        return res.json({ result: true, token });
    } else {
        return res.status(401).json({ result: false, error: 'Invalid credentials' });
    }
};
