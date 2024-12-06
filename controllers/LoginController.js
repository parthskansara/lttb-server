import dotenv from 'dotenv';
import targetUrl from '../services/auth.service.js'
import localStorage from '../utils/storage.utils.js';

dotenv.config();

const clientId = process.env.CLIENT_ID;


const getUrl = async (req, res) => {
    res.status(200).json({ url: targetUrl });
}


export default { getUrl }