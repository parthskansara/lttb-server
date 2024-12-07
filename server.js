import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { MongoClient } from 'mongodb';

import LoginRouter from './routes/LoginRouter.js';
import TokenRouter from './routes/TokenRouter.js';
import ProfileRouter from './routes/ProfileRouter.js';

import config from './config/auth.config.js';

const app = express();
const PORT = config.port || 3000;

const mongoUri = config.mongoUri;

// if server runs behind a proxy (eg. k8s, nginx etc)
// app.set('trust proxy', 1)

// configure session middleware
app.use(session({
    store: MongoStore.create({
        mongoUrl: mongoUri,
        collectionName: 'concert-tracker'
    }),
    secret: config.sessionSecret,
    saveUninitialized: false, // empty session is not written to the database
    resave: false, // if session is not updated, session store is not overwritten
    cookie: {
        secure: false, // set to true in production (sends over https)
        httpOnly: true, // prevents client-side JS from reading cookie
        maxAge: 1000*60*60*24
    }
}))

app.use(express.json());

app.use(async(req, res, next) => {
    if (req.session  && req.session.spotify){
        const currentTime = new Date();
        const expirationTime = new Date(req.session.spotify.expiration_time);

        if (currentTime > expirationTime){
            try{
                const response = await fetch('/api/token/refresh-token');
                const data = await response.json();
            }
            catch(err){
                console.error('Error refreshing token: ', err);
            }

        }
    }
    next();
})

app.use('/api/login', LoginRouter);
app.use('/api/token', TokenRouter);
app.use('/api/logout', LoginRouter);

// check if user is authenticated
app.use((req, res, next) => {
    if (!req.session || !req.session.spotify) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Please login and try again!',
        })
    }
    next(); 
})

app.use('/api/profile', ProfileRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})