import config from '../config/auth.config.js';
import generateCodeChallengeAndVerifier from '../utils/pkce.utils.js'
import localStorage from '../utils/storage.utils.js';

const clientId = config.clientId;
const redirectUri = config.redirectUri;

const scope = 'user-read-private user-read-email';  // https://developer.spotify.com/documentation/web-api/concepts/scopes

const authUrl = new URL('https://accounts.spotify.com/authorize')
const { codeChallenge, codeVerifier } = await generateCodeChallengeAndVerifier();

const params = {
    response_type: 'code', 
    client_id: clientId,
    scope,
    code_challenge_method: 'S256', 
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
}

authUrl.search = new URLSearchParams(params).toString();
const targetUrl = authUrl.toString();

export { targetUrl, codeVerifier };