// Parameters: 
//     - Friend's user_id
//     - Song link
//     - Current user's details

import config from "../config/auth.config.js";
import { addSongToPlaylist, createPlaylist } from "../services/spotify.service.js";
import { getAccessTokenByUserId, getUserByUserId, setPlaylistRecommendation } from "../services/user.service.js";

// Steps: 
//     - Fetch the friend's access token
//     - Use this access token to create a playlist
//         - Playlist name = `Recommendations by {user.user_name}`
//         - Playlist icon = user.imageUrl
//     - Add the song to the playlist

// TODO: Add the playlist id to map[follower_userId] in the current user's database


// services/user.service.js :
//      - getAccessTokenByUserId(user_id) => Also check if expired, and fetch a new one using refreshToken

// services/spotify.service.js:
//      - createPlaylist(followerUserId, followerAccessToken, playlistName, playlistDescription) => return id of the playlist
//      - addSongToPlaylist(followerAccessToken, playlistId, trackPosition, songUri) => add song to default position=0

const createPlaylistForFollower = async(req, res) => {
    const { followerUserId, songUri } = req.body;
    const userId = req.session.spotify.user_id;

    try {
        
        const followerAccessToken = await getAccessTokenByUserId(followerUserId);
        const userDetails = await getUserByUserId(userId);
        console.log("Display name = ", userDetails.displayName)
        const playlistName = `Recommended by ${userDetails.displayName}`
        const playlistDescription = `Collection of tracks suggested by your friend via ${config.appName}`

        // TODO: Check if followers.recommendationPlaylistId exists in current user's data, if yes, just add to that playlist
        let playlistId;

        if (userDetails?.playlistRecommendations?.has(followerUserId)){
            playlistId = userDetails.playlistRecommendations.get(followerUserId);
            console.log("Existing playlist id found: ", playlistId);
        } else {
            playlistId = await createPlaylist(
                followerUserId, 
                followerAccessToken, 
                playlistName, 
                playlistDescription
            );

            await setPlaylistRecommendation(userId, followerUserId, playlistId);
        }
        const trackPosition = 0;

        const snapshotId = await addSongToPlaylist(
            followerAccessToken,
            playlistId,
            trackPosition,
            songUri
        )

        res.status(200).json(snapshotId);
    }
    catch(error){
        console.error("Error creating playlist for follower: ", error);
    }

}


export default { createPlaylistForFollower }