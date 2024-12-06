import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import LoginRouter from './routes/LoginRouter.js';
import TokenRouter from './routes/TokenRouter.js';
import ProfileRouter from './routes/ProfileRouter.js';

import './services/spotify-strategy.js';

dotenv.config()

const app = express();
const PORT = process.env.PORT || 3000;

// app.use(cors());
app.use(express.json());

app.use(session({
    secret: "parthk",
    saveUninitialized: true,
    resave: false,
}))

app.use(passport.initialize());
app.use(passport.session());

// app.get('/api/login', passport.authenticate('spotify'))
app.use('/api/login', LoginRouter)
app.use('/api/token', TokenRouter)
app.use('/api/profile', ProfileRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})