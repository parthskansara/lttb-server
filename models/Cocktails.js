import mongoose from "mongoose";

const CocktailSchema = new mongoose.Schema(
  {
    cocktailId: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    recipeUrl: {
      type: String,
    },
    cocktailImgUrl: {
      type: String,
    },
    recipe: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Cocktails", CocktailSchema);
