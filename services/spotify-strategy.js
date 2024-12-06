import config from '../config/auth.config.js'
import passport from "passport";
import {Strategy} from "passport-spotify";

export default passport.use(
    new Strategy(
        {
            clientID: config.clientId,
            clientSecret: config.clientSecret,
            callbackURL: config.redirectUri,
            scope: ['user-read-private user-read-email'],   // https://developer.spotify.com/documentation/web-api/concepts/scopes
        }, 
        (accessToken, refreshToken, profile,  done) => {
            console.log(profile);
            return done(err, profile);
        }
    )
);

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

