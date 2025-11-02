import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    movieId: { type: String, required: true },
    title: { type: String, required: true },
    poster: { type: String },
    rating: { type: Number },
    likedBy: { type: String, required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ movieId: 1, likedBy: 1 }, { unique: true });

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;
