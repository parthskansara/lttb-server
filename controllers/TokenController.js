import config from '../config/auth.config.js';
import localStorage from '../utils/storage.utils.js';

const getAccessToken = async (req, res) => {
    const clientUrl = config.clientUrl;
    const { code } = req.query;  // Gets authorization code from Spotify's redirect after successful login

    let codeVerifier = localStorage.getItem('code_verifier'); // TODO: Get current user's code verifier
    const url = `https://accounts.spotify.com/api/token`;
    const clientId = config.clientId;
    const redirectUri = config.redirectUri;

    
    const params = new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code', 
        code, 
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
    });

    try {

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Full error response:', errorBody);
            throw new Error(`HTTP error status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Logging access_token: ', data.access_token)
        localStorage.setItem('access-token', data.access_token);
        localStorage.setItem('refresh-token', data.refresh_token);
        res.redirect(`${clientUrl}/user`);
    } catch (error){
        console.error('Error fetching token: ', error);       
    }
};

const getRefreshToken = async() => {
    const refreshToken = localStorage.getItem('refresh_token');
    const url = 'https://accounts.spotify.com/api/token';
    const clientId = config.clientId;

    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId
    })

    try {

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Full error response:', errorBody);
            throw new Error(`HTTP error status: ${response.status}`);
        }

        const data = await response.json();
        localStorage.setItem('access-token', data.access_token);

        if (data.refresh_token){
            localStorage.setItem('refresh-token', data.refresh_token);
        }        
        return data.access_token;
    } catch (error){
        console.error('Error fetching token: ', error);       
    }

}

export default { getAccessToken, getRefreshToken }