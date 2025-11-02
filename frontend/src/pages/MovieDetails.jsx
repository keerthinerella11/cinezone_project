// src/pages/MovieDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./Home.css";

// ✅ Use your new TMDB API key
const API_KEY = import.meta.env.VITE_TMDB_KEY || "eeec6858ccc8ea28e5972fba3c3e55c4";

// ✅ Use backend URL from env (works for Render + local)
const BACKEND_URL = import.meta.env.VITE_API_URL || "https://cinezone-project.onrender.com";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const user = localStorage.getItem("userEmail") || "guest";

function MovieDetails() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(state?.movie || null);
  const [loading, setLoading] = useState(!state?.movie);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);

  // ✅ Fetch user's favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/favorites/${user}`);
        const data = await res.json();
        setFavorites(data.map((fav) => fav.movieId));
      } catch (err) {
        console.error("Error fetching favorites:", err);
      }
    };
    fetchFavorites();
  }, []);

  // ✅ Toggle like/unlike
  const toggleFavorite = async (movie) => {
    const isFav = favorites.includes(movie.id);

    if (isFav) {
      setFavorites((prev) => prev.filter((id) => id !== movie.id));
      try {
        await fetch(`${BACKEND_URL}/api/favorites/${movie.id}/${user}`, {
          method: "DELETE",
        });
      } catch (err) {
        console.error("Error removing favorite:", err);
        setFavorites((prev) => [...prev, movie.id]);
      }
    } else {
      setFavorites((prev) => [...prev, movie.id]);
      try {
        await fetch(`${BACKEND_URL}/api/favorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            movieId: movie.id,
            title: movie.title,
            poster: movie.poster_path,
            rating: movie.vote_average,
            likedBy: user,
          }),
        });
      } catch (err) {
        console.error("Error adding favorite:", err);
        setFavorites((prev) => prev.filter((id) => id !== movie.id));
      }
    }
  };

  // ✅ Fetch movie details if not passed from Home
  useEffect(() => {
    if (!movie && id) {
      const fetchMovie = async () => {
        try {
          const res = await fetch(
            `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`
          );
          const data = await res.json();
          setMovie(data);
          setLoading(false);
        } catch (err) {
          setError("Failed to fetch movie details.");
          setLoading(false);
        }
      };
      fetchMovie();
    }
  }, [id, movie]);

  if (loading) return <h2 style={{ textAlign: "center" }}>Loading movie details...</h2>;
  if (error) return <h2 style={{ textAlign: "center" }}>{error}</h2>;
  if (!movie)
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h2>Movie details not found</h2>
        <button
          onClick={() => navigate("/home")}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            background: "#00adb5",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          ← Back to Home
        </button>
      </div>
    );

  return (
    <section className="movie-details-section">
      <div className="movie-details-card">
        <img
          src={
            movie.poster_path
              ? `${IMAGE_BASE_URL}${movie.poster_path}`
              : "https://via.placeholder.com/250x350?text=No+Image"
          }
          alt={movie.title}
          style={{ maxWidth: "250px", borderRadius: "10px", marginBottom: "20px" }}
        />

        <h2>{movie.title}</h2>
        {movie.tagline && <p><em>"{movie.tagline}"</em></p>}
        <p><strong>Synopsis:</strong> {movie.overview}</p>
        <p><strong>Release Date:</strong> {movie.release_date}</p>
        <p><strong>Rating:</strong> ⭐ {movie.vote_average} / 10</p>
        <p><strong>Runtime:</strong> {movie.runtime} min</p>
        <p><strong>Genres:</strong> {movie.genres?.map((g) => g.name).join(", ")}</p>
        <p><strong>Language:</strong> {movie.original_language?.toUpperCase()}</p>

        <button
          onClick={() => toggleFavorite(movie)}
          className={`like-button ${favorites.includes(movie.id) ? "liked" : ""}`}
          style={{ marginTop: "10px" }}
        >
          {favorites.includes(movie.id) ? "❤️ Liked" : "🤍 Like"}
        </button>

        <button
          onClick={() => navigate("/home")}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            background: "#00adb5",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          ← Back to Home
        </button>
      </div>
    </section>
  );
}

export default MovieDetails;
