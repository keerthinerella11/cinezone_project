import { Link } from "react-router-dom";


function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <img src="/images/logo2.jpeg" alt="CineZone Logo" />
        <h1>CineZone</h1>
      </div>

      <ul className="nav-links">
        <li><Link to="/home">🏠 Home</Link></li>
        <li><Link to="/movies">🎬 Movies</Link></li>
        <li><Link to="/favourite">❤️ Favourites</Link></li> {/* ✅ New Link */}
      </ul>
    </nav>
  );
}

export default Navbar;
