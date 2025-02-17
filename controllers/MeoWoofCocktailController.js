import {
  uploadFile,
  getCocktailByCocktailId,
  getAllCocktailsFromDb,
  createOrUpdateCocktail,
  deleteCocktail,
  constructUrlFromId,
} from "../services/upload.service.js";
import path from "path";
import * as fs from "fs";

export const getAllCocktails = async (req, res) => {
  try {
    const cocktails = await getAllCocktailsFromDb();
    res.status(200).json(cocktails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCocktailById = async (req, res) => {
  const cocktailId = req.params.id;
  try {
    const cocktail = await getCocktailByCocktailId(cocktailId);
    res.status(200).json(cocktail);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addCocktail = async (req, res) => {
  console.log("Logging in controller: ", req.body);
  console.log("File: ", req.file);
  try {
    if (req.body) {
      const { displayName, recipeUrl, recipe } = req.body;
      const cocktailImage = req.file; // This is the uploaded file

      const imageExtension = path
        .extname(cocktailImage.originalname)
        .substring(1);
      const imageFileName = `${displayName}_img.${imageExtension}`;

      // Use the file path to upload to Google Drive
      const cocktailImgId = await uploadFile(imageFileName, cocktailImage.path);

      const cocktailImgUrl = await constructUrlFromId(cocktailImgId);

      const cocktailData = {
        displayName,
        recipeUrl,
        cocktailImgUrl,
        recipe, // If recipe is sent as a JSON string
      };

      const cocktail = await createOrUpdateCocktail(cocktailData);

      // Delete the temporary file
      fs.unlinkSync(cocktailImage.path);

      res.status(200).json(cocktail);
    } else {
      throw new Error("No request body");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCocktailById = async (req, res) => {
  const cocktailId = req.params.id;
  try {
    const response = await deleteCocktail(cocktailId);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
