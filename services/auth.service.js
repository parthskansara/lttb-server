import config from "../config/auth.config.js";
import generateCodeChallengeAndVerifier from "../utils/pkce.utils.js";

const redirectUri = config.redirectUri;
const clientId = config.clientId;

// https://developer.spotify.com/documentation/web-api/concepts/scopes
const scope =
  "user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private";

const getAuthUrl = async () => {
  const authUrl = new URL("https://accounts.spotify.com/authorize");
  const { codeChallenge, codeVerifier } =
    await generateCodeChallengeAndVerifier();

  const params = {
    response_type: "code",
    client_id: clientId,
    scope,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  };

  authUrl.search = new URLSearchParams(params).toString();
  const targetUrl = authUrl.toString();

  return { targetUrl, codeVerifier };
};

export default getAuthUrl;
