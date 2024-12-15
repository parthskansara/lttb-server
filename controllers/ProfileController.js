import { createOrUpdateUser } from "../services/user.service.js";

const getProfile = async(req, res) => {
    const accessToken = req.session.spotify.accessToken; 
    const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    })

    const data = await response.json();
    req.session.spotify.user_id = data.id;

    const userData = {
        userId: data.id,
        displayName: data.display_name,
        accessToken: accessToken,
        refreshToken: req.session.spotify.refreshToken,
        expiresIn: req.session.spotify.expiresIn,
        imageUrl: data.images?.[0].url,
    }
    console.log("Creating user from ProfileController")
    await createOrUpdateUser (userData);

    await req.session.save();
    res.status(200).json(data);

}

const getTopArtists = async (req, res) => {
    const accessToken = req.session.spotify.accessToken;
    const params = new URLSearchParams({
        time_range: "medium_term",
        limit: "20",
        offset: "0",
    });

    const response = await fetch('https://api.spotify.com/v1/me/top/artists', {
        headers: {
            Authorization: 'Bearer ' + accessToken
        },
        // body: params
    });

    const data = await response.json();
    console.log("Logging in ProfileController: ", data);
    // const items = data.items;
    res.status(200).json(data);
}

export default { getProfile, getTopArtists }