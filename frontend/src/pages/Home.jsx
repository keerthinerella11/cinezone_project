import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const API_KEY = "e57ed672f332201311e63165d765cdd6"; // your TMDb key
const BACKEND_URL = "http://localhost:5000"; // backend base URL

const Home = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [favorites, setFavorites] = useState([]);

  const user = localStorage.getItem("userEmail") || "guest";

  // 🔹 Initial load
  useEffect(() => {
    fetchGenres();
    fetchLanguages();
    fetchMovies();
    fetchFavorites();
  }, []);

  // 🔹 Fetch favorites
  const fetchFavorites = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/favorites/${user}`);
      const data = await res.json();
      setFavorites(data.map((fav) => fav.movieId));
    } catch (err) {
      console.error("Error fetching favorites:", err);
    }
  };

  // 🔹 Toggle Like / Unlike
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

  // 🔹 Fetch genres
  const fetchGenres = async () => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`
      );
      const data = await res.json();
      setGenres(data.genres || []);
    } catch (err) {
      console.error("Error fetching genres:", err);
    }
  };

  // 🔹 Fetch languages
  const fetchLanguages = async () => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/configuration/languages?api_key=${API_KEY}`
      );
      const data = await res.json();
      setLanguages(data);
    } catch (err) {
      console.error("Error fetching languages:", err);
    }
  };

  // 🔹 Fetch movies
  const fetchMovies = async (language = "", genre = "") => {
    try {
      let url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&page=1`;
      if (language) url += `&with_original_language=${language}`;
      if (genre) url += `&with_genres=${genre}`;

      const res = await fetch(url);
      const data = await res.json();

      const moviesWithGenres = data.results?.map((movie) => ({
        ...movie,
        genre_names: movie.genre_ids
          ?.map((id) => genres.find((g) => g.id === id)?.name)
          .filter(Boolean),
      }));

      setMovies(moviesWithGenres || []);
    } catch (err) {
      console.error("Error fetching movies:", err);
    }
  };

  // 🔹 Search handler
  const handleSearch = async (e) => {
    e.preventDefault();
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${searchQuery}`
    );
    const data = await res.json();
    setMovies(data.results || []);
  };

  // 🔹 Handle language & genre
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    fetchMovies(lang, selectedGenre);
  };

  const handleGenreChange = (e) => {
    const genre = e.target.value;
    setSelectedGenre(genre);
    fetchMovies(selectedLanguage, genre);
  };

  // 🔹 Navigate to movie details
  const handleClick = (movie) => {
    navigate(`/movie/${movie.id}`, { state: { movie } });
  };

  // 🔹 Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isAuthenticated");
    navigate("/"); // ✅ Redirects to Auth.jsx
  };

  return (
    <div>
      {/* Header */}
      <header className="top-nav">
        <div className="logo-section">
          <img src="/images/logo2.jpeg" alt="CineZone Logo" className="logo" />
          <div>
            <h1 className="site-title">CineZone</h1>
            <p className="site-caption">
              From Classics to Hidden Gems — We've got you.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="filters">
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search movies..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">
              🔍
            </button>
          </form>

          <select
            className="language-dropdown"
            value={selectedLanguage}
            onChange={handleLanguageChange}
          >
            <option value="">🌐 All Languages</option>
            {languages.map((lang) => (
              <option key={lang.iso_639_1} value={lang.iso_639_1}>
                {lang.english_name || lang.name}
              </option>
            ))}
          </select>

          <select
            className="genre-dropdown"
            value={selectedGenre}
            onChange={handleGenreChange}
          >
            <option value="">🎭 All Genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>

          {/* ❤️ View Favourites Button */}
          <button
            onClick={() => navigate("/favourites")}
            className="view-fav-btn"
            style={{
              padding: "8px 16px",
              background: "#ff4d4d",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              marginLeft: "10px",
            }}
          >
            ❤️ View Favourites
          </button>

          {/* 🚪 Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              background: "#222",
              color: "#fff",
              border: "1px solid #ff4d4d",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              marginLeft: "10px",
            }}
          >
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Movie Section */}
      <section className="latest-section">
        <h2>
          {selectedGenre
            ? `${genres.find((g) => g.id === parseInt(selectedGenre))?.name} Movies`
            : "Latest Movies"}
        </h2>

        <div className="movie-grid">
          {movies.length > 0 ? (
            movies.map((movie) => (
              <div key={movie.id} className="movie-card">
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : "/images/no-poster.jpg"
                  }
                  alt={movie.title}
                  onClick={() => handleClick(movie)}
                />
                <h3>{movie.title}</h3>
                <p>⭐ {movie.vote_average}</p>
                <p className="genres">
                  🎭 {movie.genre_names?.join(", ") || "N/A"}
                </p>

                <button
                  onClick={() => toggleFavorite(movie)}
                  className={`like-button ${
                    favorites.includes(movie.id) ? "liked" : ""
                  }`}
                >
                  {favorites.includes(movie.id) ? "❤️ Liked" : "🤍 Like"}
                </button>
              </div>
            ))
          ) : (
            <p>No movies found.</p>
          )}
        </div>
      </section>

      <footer className="footer">© 2025 CineZone. All Rights Reserved.</footer>
    </div>
  );
};

export default Home;
