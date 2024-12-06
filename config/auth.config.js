import dotenv from 'dotenv'

dotenv.config();

export default {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
    clientUrl: process.env.CLIENT_URL,
    sessionSecret: process.env.SESSION_SECRET,
};