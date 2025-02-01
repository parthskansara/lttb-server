// Parameters:
//     - Friend's user_id
//     - Song link
//     - Current user's details

import config from "../config/auth.config.js";
import {
  addSongToPlaylist,
  createPlaylist,
  getPlaylistDetails,
} from "../services/spotify.service.js";
import {
  getAccessTokenByUserId,
  getUserByUserId,
  setPlaylistRecommendation,
} from "../services/user.service.js";

// Steps:
//     - Fetch the friend's access token
//     - Use this access token to create a playlist
//         - Playlist name = `Recommendations by {user.user_name}`
//         - Playlist icon = user.imageUrl
//     - Add the song to the playlist

// services/user.service.js :
//      - getAccessTokenByUserId(user_id) => Also check if expired, and fetch a new one using refreshToken

// services/spotify.service.js:
//      - createPlaylist(followerUserId, followerAccessToken, playlistName, playlistDescription) => return id of the playlist
//      - addSongToPlaylist(followerAccessToken, playlistId, trackPosition, songUri) => add song to default position=0

const isSongAlreadyAdded = async (followerAccessToken, songUri, playlistId) => {
  // Returns true if song is added, else false
  const trackId = songUri.split(":").pop();
  let limit = 50;
  let playlistDetails = await getPlaylistDetails(
    followerAccessToken,
    playlistId,
    limit,
    0
  );

  const totalSongCount = playlistDetails?.total;
  // console.log(playlistDetails?.items);
  for (const trackItem of playlistDetails?.items) {
    if (trackItem?.track?.id === trackId) {
      return true;
    }
  }

  for (let offset = limit; offset < totalSongCount; offset += limit) {
    playlistDetails = await getPlaylistDetails(
      followerAccessToken,
      playlistId,
      limit,
      offset
    );

    for (const trackItem of playlistDetails?.items) {
      if (trackItem?.track?.id === trackId) {
        return true;
      }
    }
  }
  return false;
};

const createPlaylistForFollower = async (req, res) => {
  if (!req.body || !req.session.spotify.user_id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { followerUserId, songUri } = req.body;
  const userId = req.session.spotify.user_id;
  let alreadyAdded = false;

  try {
    const followerAccessToken = await getAccessTokenByUserId(
      followerUserId
    ).catch((error) => {
      console.error("Error in getAccessTokenByUserId: ", error);
      throw new Error("Access Token Error");
    });

    const userDetails = await getUserByUserId(userId).catch((error) => {
      console.log("Error in getUserByUserId: ", error);
      throw new Error("User Id Error");
    });

    const playlistName = `Recommended by ${userDetails.displayName}`;
    const playlistDescription = `Collection of tracks suggested by your friend via ${config.appName}`;

    let playlistId;

    if (userDetails?.playlistRecommendations?.has(followerUserId)) {
      playlistId = userDetails.playlistRecommendations.get(followerUserId);
      alreadyAdded = await isSongAlreadyAdded(
        followerAccessToken,
        songUri,
        playlistId
      );
      console.log("The song was already added? (T/F) ", alreadyAdded);
      console.log("Existing playlist id found: ", playlistId);
    } else {
      playlistId = await createPlaylist(
        followerUserId,
        followerAccessToken,
        playlistName,
        playlistDescription
      ).catch((error) => {
        console.log("Error in createPlaylist: ", error);
        throw new Error("Create Playlist Error");
      });

      await setPlaylistRecommendation(userId, followerUserId, playlistId).catch(
        (error) => {
          console.log("Error in setPlaylistRecommendation: ", error);
          throw new Error("Database Update for Playlist Error");
        }
      );
    }

    const trackPosition = 0;
    let snapshotId = "";

    if (!alreadyAdded) {
      snapshotId = await addSongToPlaylist(
        followerAccessToken,
        playlistId,
        trackPosition,
        songUri
      ).catch((error) => {
        console.log("Error in addSongToPlaylist: ", error);
        throw new Error("Song Addition Error");
      });
    } else {
      console.log("Song already added to the playlist!");
    }

    res.status(200).json({ success: true, alreadyAdded, snapshotId });
  } catch (error) {
    console.error("Error creating playlist for follower: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default { createPlaylistForFollower };
