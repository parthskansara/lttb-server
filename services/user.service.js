import User from '../models/User.js'
import getAccessTokenUsingRefreshToken from './refreshToken.service.js';

export const createOrUpdateUser = async (userData) => {
    const { userId, displayName, accessToken, refreshToken, expiresIn, followers, imageUrl } = userData;
    console.log("Request made to the database");
    try {
        
        const user = await User.findOneAndUpdate(
            { userId }, 
            { displayName, accessToken, refreshToken, expiresIn, followers, imageUrl },
            { new: true, upsert: true }
        );
        return user;
    }
    catch (error){
        console.error("Error creating/updating user:", error);
        throw error;
    }
};

export const getUserByUserId = async(userId) => {
    console.log("Request made to the database");
    try {
        const user = await User.findOne({ userId });
        return user;
    }
    catch (error) {
        console.error("Error fetching user: ", error);
        throw error;
    }
}

export const updateUserAfterRefresh = async (userId, userData) => {
    try {
        const { access_token, refresh_token, expires_in } = userData;
        const expiresIn = new Date().getTime() + expires_in * 1000;

        const updatedUser = await User.findOneAndUpdate(
            { userId },
            { accessToken: access_token, refreshToken: refresh_token, expiresIn },
            { new: true }
        );

        return updatedUser;
    } catch (error) {
        console.error("Error updating user after refresh:", error);
        throw error;
    }
}


// - getAccessTokenByUserId(user_id) => Also check if expired, and fetch a new one using refreshToken
export const getAccessTokenByUserId = async (userId) => {
    try {
        const user = await getUserByUserId(userId);
        if (!user){
            throw new Error('User not found');
        }
        const currentTime = new Date().getTime();
        const expirationTime = new Date(user.expiresIn).getTime();

        if (currentTime < expirationTime){
            return user.accessToken;
        }

        const data = await getAccessTokenUsingRefreshToken(user.refreshToken);
        const updatedUser = await updateUserAfterRefresh(userId, data);

        return data.access_token;
        
    }
    catch(error){
        console.error('Error getting access token:', error);
    }
}

export const setPlaylistRecommendation = async (userId, followerUserId, playlistId) => {
    try {
        const user = await getUserByUserId(userId);

        if (!user) {
            throw new Error ('User not found');
        }
        
        if (!user.playlistRecommendations) {
            user.playlistRecommendations = new Map();
          }
        user.playlistRecommendations.set(followerUserId, playlistId);
        await user.save();
        console.log('Updated playlist for user: ', userId);
        console.log(`Added: ${followerUserId} => ${playlistId}`);
        return user;
    } catch (error) {
        console.error('Error updating playlist recommendation ID: ', error);
        throw error;
    }
}