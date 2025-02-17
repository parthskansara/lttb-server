import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import session from "express-session";
import MongoStore from "connect-mongo";
import { MongoClient } from "mongodb";

import LoginRouter from "./routes/LoginRouter.js";
import LogoutRouter from "./routes/LogoutRouter.js";
import TokenRouter from "./routes/TokenRouter.js";
import ProfileRouter from "./routes/ProfileRouter.js";
import FollowerRouter from "./routes/FollowerRouter.js";
import PlaylistRouter from "./routes/PlaylistRouter.js";

// import MeoWoofCocktailRouter from "./routes/MeoWoofCocktailRouter.js";

import config from "./config/auth.config.js";
import getAccessTokenUsingRefreshToken from "./services/refreshToken.service.js";
import connectDB from "./config/database.js";

const app = express();
const PORT = config.port || 3000;

// const corsOptions = {
//   origin: "*", // TODO: set to the frontend's url
//   methods: "GET, HEAD, PUT, POST, DELETE",
//   credentials: true,
//   optionsSuccessStatus: 204,
// };

// app.use(cors(corsOptions));
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// app.use("/api/cocktails", MeoWoofCocktailRouter);

//TODO: align with spotify's rate limits https://developer.spotify.com/documentation/web-api/concepts/rate-limits
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 100 requests per windowMs
});

app.use(limiter);

connectDB();

const mongoUri = config.mongoUri;

// if server runs behind a proxy (eg. k8s, nginx etc)
// app.set('trust proxy', 1)

// configure session middleware
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: "concert-tracker",
    }),
    secret: config.sessionSecret,
    saveUninitialized: false, // empty session is not written to the database
    resave: false, // if session is not updated, session store is not overwritten
    cookie: {
      secure: process.env.NODE_ENV === "production", // set to true in production (sends over https)
      httpOnly: true, // prevents client-side JS from reading cookie
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// TODO: Make sure this works as expected
// app.use((req, res, next) => {
//     res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
//     next();
//   });

app.use(express.json());

app.use(async (req, res, next) => {
  if (req.session && req.session.spotify) {
    const currentTime = new Date();
    const expirationTime = new Date(req.session.spotify.expiration_time);

    if (currentTime > expirationTime) {
      try {
        const data = await getAccessTokenUsingRefreshToken(
          req.session.spotify.refreshToken
        );

        req.session.spotify.accessToken = data.access_token;

        if (data.refresh_token) {
          // localStorage.setItem('refresh-token', data.refresh_token);
          req.session.spotify.refreshToken = data.refresh_token;
        }

        if (data.expires_in) {
          req.session.spotify.expiration_time = new Date(
            new Date().getTime() + data.expires_in * 1000
          );
        }

        await req.session.save();
      } catch (err) {
        console.error("Error refreshing token: ", err);
        req.session.spotify = undefined;
        next();
      }
    }
  }
  next();
});

// TODO: Serve the API documentation here
// app.get("/", (req, res) => {
//   res.status(200).send();
// });

app.get("/api/health", (req, res) => {
  res.status(200).send("<html><body><h1>Status: OK</h1></body></html>");
});

app.use("/api/login", LoginRouter);
app.use("/api/token", TokenRouter);
app.use("/api/logout", LogoutRouter);

// TODO: whenever use is not authenticated, clear session store and cookie

// check if user is authenticated
app.use((req, res, next) => {
  if (!req.session || !req.session.spotify) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Please login and try again!",
    });
  }
  next();
});

app.use("/api/profile", ProfileRouter);

app.use("/api/follower", FollowerRouter);
app.use("/api/playlist", PlaylistRouter);

export { app };
