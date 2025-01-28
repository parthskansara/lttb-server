//      - createPlaylist(followerUserId, followerAccessToken, playlistName, playlistDescription) => return id of the playlist
//      - addSongToPlaylist(followerAccessToken, playlistId, trackPosition, songUri) => add song to default position=0

export const createPlaylist = async (
  followerUserId,
  followerAccessToken,
  playlistName,
  playlistDescription
) => {
  const url = `https://api.spotify.com/v1/users/${followerUserId}/playlists`;
  const requestBody = {
    name: playlistName,
    description: playlistDescription,
    public: false,
    collaborative: true,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + followerAccessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Full error response: ", errorBody);
      throw new Error(`HTTP error status: ${response.status}`);
    }
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error("Error fetching token: ", error);
  }
};

export const addSongToPlaylist = async (
  followerAccessToken,
  playlistId,
  trackPosition,
  songUri
) => {
  const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
  const requestBody = {
    uris: [songUri],
    position: trackPosition,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + followerAccessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    return data.snapshot_id;
  } catch (error) {
    console.error("Error adding to playlist: ", error);
  }
};

// TODO:
export const getPlaylistDetails = async (
  followerAccessToken,
  playlistId,
  limit,
  offset
) => {
  const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=total%2C+items%28track%28id%29%29&limit=${limit}&offset=${offset}`;
  console.log("Checking playlist details at: ", url);
  const fields = "total,items(track(id))";

  const requestBody = { fields: fields, limit: limit, offset: offset };

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + followerAccessToken,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching playlist data: ", error);
  }
};
