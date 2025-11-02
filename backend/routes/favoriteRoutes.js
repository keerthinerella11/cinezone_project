import express from "express";
import Favorite from "../models/Favorite.js";

const router = express.Router();

// ✅ Add to favorites
router.post("/", async (req, res) => {
  try {
    const { movieId, title, poster, rating, likedBy } = req.body;

    const existing = await Favorite.findOne({ movieId, likedBy });
    if (existing) {
      return res.status(200).json({ message: "Already in favorites" });
    }

    const favorite = new Favorite({
      movieId,
      title,
      poster,
      rating,
      likedBy,
    });

    await favorite.save();
    res.status(201).json({ message: "Added to favorites", favorite });
  } catch (err) {
    console.error("Error adding favorite:", err);
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

// ✅ Get favorites for a user
router.get("/:user", async (req, res) => {
  try {
    const { user } = req.params;
    const favorites = await Favorite.find({ likedBy: user });
    res.json(favorites);
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// ✅ Remove favorite
router.delete("/:movieId/:user", async (req, res) => {
  try {
    const { movieId, user } = req.params;
    await Favorite.findOneAndDelete({ movieId, likedBy: user });
    res.json({ message: "Removed from favorites" });
  } catch (err) {
    console.error("Error removing favorite:", err);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

export default router;
