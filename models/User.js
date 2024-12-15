import mongoose from "mongoose";

    const UserSchema = new mongoose.Schema ({
        userId: {
            type: String,
            required: true,
            unique: true
        },
        displayName: {
            type: String,
            required: true,
        },
        accessToken: {
            type: String
        }, 
        refreshToken: {
            type: String,
        },
        expiresIn: {
            type: Date,
        },
        followers: {
            type: [{
                followerName: String,
                followerId: String,
            }],
            default: []
        },
        // stores hashmap (followerUserId, playlistId)
        playlistRecommendations: {
            type: Map,
            of: String,
        },
        imageUrl: String,
    }, { timestamps: true });

export default mongoose.model('User', UserSchema);