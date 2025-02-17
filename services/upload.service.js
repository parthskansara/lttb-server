import { google } from "googleapis";
import Cocktails from "../models/Cocktails.js";
import fs from "fs";

const GOOGLE_API_FOLDER_ID = "1PACutlcKkxYt4eJY5DQex_2SSDjXLq8H";

export const constructUrlFromId = (imageId) => {
  return `https://drive.google.com/uc?id=${imageId}`;
};

export const uploadFile = async (imageName, filePath) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "./meowoof-site-key.json",
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

    const fileContent = fs.createReadStream(filePath);

    const media = {
      mimeType: imageName.endsWith(".png") ? "image/png" : "image/jpeg",
      //TODO: Check format of image
      body: fileContent,
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
  const { cocktailId, displayName, recipeUrl, cocktailImgUrl, recipe } =
    cocktailData;
  console.log("Request to add cocktail made to the database");
  try {
    const cocktail = await Cocktails.findOneAndUpdate(
      { cocktailId },
      { displayName, recipeUrl, cocktailImgUrl, recipe },
      { new: true, upsert: true }
    );
    return cocktail;
  } catch (error) {
    console.error("Error updating cocktail: ", error);
    throw error;
  }
};

export const deleteCocktail = async (cocktailId) => {
  console.log("Request made to the database");
  try {
    const result = await Cocktails.deleteOne({ cocktailId });
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
