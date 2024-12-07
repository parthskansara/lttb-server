import dotenv from 'dotenv';
import { targetUrl, codeVerifier } from '../services/auth.service.js'
import config from '../config/auth.config.js';

dotenv.config();

const clientId = process.env.CLIENT_ID;


const getUrl = async (req, res) => {
    let finalUrl = targetUrl;
    if (req.session && req.session.spotify) {
        try{            
            finalUrl = '/user';
        }
        catch (err){
            console.error('Error in LoginController: ', err);
        }
    }
    else {
        req.session.spotify = {
            codeVerifier: codeVerifier,
        }
        await req.session.save();
    }
    
    res.status(200).json({ url: finalUrl });
}

const logOut = async (req, res) => {
    if (req.session){
        req.session.destroy(err => {
            if (err){
                res.status(400).json({ message: 'Unable to log out, try again!' })
            } else {
                res.json({ message: 'Logout sucessful' });
            }
        })
    } else {
        res.end();
    }
}


export default { getUrl, logOut }