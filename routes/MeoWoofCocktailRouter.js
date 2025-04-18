import express from "express";
import multer from "multer";
import {
  addCocktail,
  getAllCocktails,
  getCocktailById,
  deleteCocktailByName,
} from "../controllers/MeoWoofCocktailController.js";

const router = express.Router();

// Configure Multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", getAllCocktails);
router.get("/:id", getCocktailById);
router.post("/", upload.single("cocktailImage"), addCocktail);
router.delete("/:name", deleteCocktailByName);

export default router;
