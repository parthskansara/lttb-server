import { createOrUpdateUser } from "../services/user.service.js";

const getProfile = async (req, res) => {
  try {
    console.log("Getting Profile!");

    if (!req.session?.spotify?.accessToken) {
      console.error("Missing Access Token");
      return res
        .status(401)
        .json({ error: "Unauthorized: Missing access token" });
    }

    const accessToken = req.session.spotify.accessToken;
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Spotify API error:", errorData);
      return res
        .status(response.status)
        .json({ error: "Failed to fetch profile from Spotify" });
    }

    const data = await response.json();
    req.session.spotify.user_id = data.id;

    const userData = {
      userId: data.id,
      displayName: data.display_name,
      accessToken: accessToken,
      refreshToken: req.session.spotify.refreshToken,
      expiresIn: req.session.spotify.expiresIn,
      imageUrl: data.images?.[0]?.url,
    };

    console.log("Creating user from ProfileController");
    await createOrUpdateUser(userData);

    await req.session.save();

    console.log("Returning Profile with data!");
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getTopArtists = async (req, res) => {
  if (!req.session?.spotify?.accessToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const accessToken = req.session.spotify.accessToken;
  const params = new URLSearchParams({
    time_range: "medium_term",
    limit: "20",
    offset: "0",
  });

  const response = await fetch("https://api.spotify.com/v1/me/top/artists", {
    headers: {
      Authorization: "Bearer " + accessToken,
    },
    // body: params
  });

  const data = await response.json();
  console.log("Logging in ProfileController: ", data);
  // const items = data.items;
  res.status(200).json(data);
};

export default { getProfile, getTopArtists };
