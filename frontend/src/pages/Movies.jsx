// src/pages/Movies.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const movies = [
  {
    title: "HIT-The Third Case",
    cast: "Nani, Srinidhi Shetty",
    genre: "Thriller",
    synopsis: "A gripping crime thriller.",
    directedBy: "Sailesh Kolanu",
    writtenBy: "Sailesh Kolanu",
    producedBy: "Prashanti Tipirneni, Nani",
    musicBy: "Mickey J. Meyer",
    runningTime: "157 minutes",
    country: "India",
    language: "Telugu",
    img: "/images/HIT3.jpg",
  },
  // 👉 Add other movies here in the same format
];

function Movies() {
  const navigate = useNavigate();

  const handleClick = (movie) => {
    navigate(`/movie/${movie.title}`, { state: { movie } });
  };

  return (
    <section className="latest-section">
      <h2>All Movies</h2>
      <div className="movie-grid">
        {movies.map((movie, index) => (
          <div
            key={index}
            className="movie-card"
            onClick={() => handleClick(movie)}
          >
            <img src={movie.img} alt={movie.title} />
            <h3>{movie.title}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Movies;
