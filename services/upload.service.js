import { google } from "googleapis";
import Cocktails from "../models/Cocktails.js";
import fs from "fs";

import { Readable } from "stream";

const GOOGLE_API_FOLDER_ID = "1PACutlcKkxYt4eJY5DQex_2SSDjXLq8H";

export const constructUrlFromId = (imageId) => {
  return `https://drive.google.com/file/d/${imageId}/preview`;
};

export const uploadFile = async (imageName, fileBuffer) => {
  try {
    const credentialsBase64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
    if (!credentialsBase64) {
      throw new Error("Google credentials not found in environment variables");
    }

    const credentials = JSON.parse(
      Buffer.from(credentialsBase64, "base64").toString()
    );
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const driveService = google.drive({
      version: "v3",
      auth,
    });

    const fileMetaData = {
      name: imageName,
      parents: [GOOGLE_API_FOLDER_ID],
    };

    const media = {
      mimeType: imageName.endsWith(".png") ? "image/png" : "image/jpeg",
      body: bufferToStream(fileBuffer),
    };

    const response = await driveService.files.create({
      requestBody: fileMetaData,
      media: media,
      fields: "id",
    });

    console.log("File Id:", response.data.id);
    return response.data.id;
  } catch (err) {
    console.log("Upload File error!", err);
    throw err;
  }
};

// Helper function to convert buffer to stream
function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

export const getCocktailByCocktailId = async (cocktailId) => {
  console.log("Request made to the database");
  try {
    const cocktail = await Cocktails.findOne({ cocktailId });
    return cocktail;
  } catch (error) {
    console.error("Error fetching cocktail: ", error);
    throw error;
  }
};

export const getAllCocktailsFromDb = async () => {
  console.log("Fetching all cocktails from the database");
  try {
    const cocktails = await Cocktails.find();
    console.log(`Cocktails fetched: ${cocktails}`);
    return cocktails;
  } catch (error) {
    console.error("Error fetching all cocktails: ", error);
    throw error;
  }
};

export const createOrUpdateCocktail = async (cocktailData) => {
  const { displayName, recipeUrl, cocktailImgUrl, recipe } = cocktailData;
  console.log("Request to add cocktail made to the database");
  try {
    let cocktail;
    cocktail = new Cocktails({
      displayName,
      recipeUrl,
      cocktailImgUrl,
      recipe,
    });
    await cocktail.save();
    return cocktail;
  } catch (error) {
    console.error("Error updating cocktail: ", error);
    throw error;
  }
};

export const deleteCocktail = async (displayName) => {
  console.log("Request made to the database");
  try {
    const result = await Cocktails.deleteOne({ displayName });
    if (result.deletedCount === 0) {
      //   return { message: "Cocktail not found" };
      throw new Error("Cocktail not found");
    }
    return { message: "Cocktail deleted successfully" };
  } catch (error) {
    console.error("Error deleting cocktail: ", error);
    throw error;
  }
};
