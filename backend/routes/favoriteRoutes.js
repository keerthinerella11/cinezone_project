import express from "express";
import Favorite from "../models/Favorite.js";

const router = express.Router();

// ✅ Add a movie to favorites
router.post("/", async (req, res) => {
  try {
    const { movieId, title, poster, rating, likedBy } = req.body;

    if (!movieId || !likedBy) {
      return res.status(400).json({ error: "movieId and likedBy are required" });
    }

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
    return res.status(201).json({ message: "Added to favorites", favorite });
  } catch (err) {
    console.error("❌ Error adding favorite:", err);
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

// ✅ Get all favorites for a user
router.get("/:user", async (req, res) => {
  try {
    const { user } = req.params;
    if (!user) {
      return res.status(400).json({ error: "User parameter is required" });
    }

    const favorites = await Favorite.find({ likedBy: user });
    return res.json(favorites);
  } catch (err) {
    console.error("❌ Error fetching favorites:", err);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// ✅ Remove a movie from favorites
router.delete("/:movieId/:user", async (req, res) => {
  try {
    const { movieId, user } = req.params;
    if (!movieId || !user) {
      return res.status(400).json({ error: "movieId and user are required" });
    }

    const removed = await Favorite.findOneAndDelete({ movieId, likedBy: user });
    if (!removed) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    return res.json({ message: "Removed from favorites" });
  } catch (err) {
    console.error("❌ Error removing favorite:", err);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

export default router;
