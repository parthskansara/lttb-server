import {
  getAllCocktails,
  getCocktailById,
  addCocktail,
  deleteCocktailById,
} from "../controllers/MeoWoofCocktailController.js";
import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "temp/uploads/"); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  // limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.get("/", getAllCocktails);
router.get("/:id", getCocktailById);
router.post("/", upload.single("cocktailImage"), addCocktail);
router.delete("/:id", deleteCocktailById);

export default router;
