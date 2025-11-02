// src/pages/MovieDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./Home.css";

const API_KEY = "e57ed672f332201311e63165d765cdd6";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const BACKEND_URL = "http://localhost:5000";
const user = localStorage.getItem("userEmail") || "guest";
 // 🔒 later replace with logged-in user

function MovieDetails() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(state?.movie || null);
  const [loading, setLoading] = useState(!state?.movie);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);

  // ✅ Fetch user's favorites (for persistent likes)
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

    // 💥 Optimistic UI update (instant color change)
    if (isFav) {
      setFavorites((prev) => prev.filter((id) => id !== movie.id));

      // tell backend to remove
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

      // tell backend to add
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

  // ✅ Fetch movie details from TMDb (if not passed)
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

        {/* ❤️ Like button */}
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
