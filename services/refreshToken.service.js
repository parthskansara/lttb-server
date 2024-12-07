import config from "../config/auth.config.js";

const getAccessTokenUsingRefreshToken = async (refreshToken) => {
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
        return data;
    } catch (error){
        console.error('Error fetching token: ', error);       
    }
}

export default getAccessTokenUsingRefreshToken;