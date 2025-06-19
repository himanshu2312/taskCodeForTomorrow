import express from 'express';
import authRouter from './routes/auth.js';
import categoriesRouter from './routes/categories.js';
import servicesRouter from './routes/services.js';
import db from './db/init.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_, res) => {
    res.send("Hello, This is a backend server for \"Code for Tomorrow's Task\"!");
});

// routers
app.use('/auth', authRouter);           // => POST /auth/login
app.use('/', categoriesRouter);         // => /category, /categories etc
app.use('/', servicesRouter);           // => /category/:categoryId/service etc

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
