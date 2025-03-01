import config from "../config/auth.config.js";

const getAccessToken = async (req, res) => {
  const clientUrl = config.clientUrl;

  if (!req.query || !req.session?.spotify?.codeVerifier) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { code } = req.query; // Gets authorization code from Spotify's redirect after successful login

  let codeVerifier = req.session?.spotify?.codeVerifier;
  const url = `https://accounts.spotify.com/api/token`;
  const clientId = config.clientId;
  const redirectUri = config.redirectUri;

  const params = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Full error response:", errorBody);
      throw new Error(`HTTP error status: ${response.status}`);
    }

    const data = await response.json();

    req.session.spotify = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      codeVerifier: codeVerifier,
      expiration_time: new Date(new Date().getTime() + data.expires_in * 1000),
    };

    await req.session.save();
    res.redirect(`${clientUrl}/user`);
  } catch (error) {
    console.error("Error fetching token: ", error);
    throw err;
  }
};

export default { getAccessToken };
