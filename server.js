import express from 'express';
import authRouter from './routes/auth.js';
import categoriesRouter from './routes/categories.js';
import servicesRouter from './routes/services.js';
import { authenticateJWT } from './middlewares/authenticateJWT.js';
import db from './db/init.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_, res) => {
    res.send("Hello, This is a backend server for \"Code for Tomorrow's Task\"!");
});

// routers without authentication
app.use('/auth', authRouter);           // => POST /auth/login

// authentication middleware
app.use(authenticateJWT);
// Note: The authentication token shoul be in authorization header as "Authorization: Bearer <token>"

// routers with authentication
app.use('/', categoriesRouter);         // => /category, /categories etc
app.use('/', servicesRouter);           // => /category/:categoryId/service etc

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
