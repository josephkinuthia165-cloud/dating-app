import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { FiUser, FiLogOut, FiHeart, FiMenu, FiX } from "react-icons/fi";

const Navbar = ({
  onGenderFilter,
  onLocationFilter,
  activeGender,
  activeLocation,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const genders = ["All", "Male", "Female", "Trans"];
  const locations = ["All", "Nairobi", "Mombasa", "Kisumu"];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <FiHeart className="brand-icon" />
          <span>CoastEscorts</span>
        </Link>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <div className={`nav-center ${menuOpen ? "open" : ""}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            Home
          </Link>

          {/* Gender Dropdown */}
          <div className="filter-group">
            <label className="filter-label">Gender</label>

            <select
              className="filter-dropdown"
              value={activeGender}
              onChange={(e) => {
                onGenderFilter(e.target.value);
                setMenuOpen(false);
              }}
            >
              {genders.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Location Dropdown */}
          <div className="filter-group">
            <label className="filter-label">Location</label>

            <select
              className="filter-dropdown"
              value={activeLocation}
              onChange={(e) => {
                onLocationFilter(e.target.value);
                setMenuOpen(false);
              }}
            >
              {locations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="nav-right">
          {user ? (
            <>
              <Link to="/dashboard" className="profile-btn" title="Dashboard">
                <FiUser />
              </Link>
              <button className="logout-btn" onClick={handleLogout}>
                <FiLogOut /> <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                Login
              </Link>
              <Link to="/signup" className="btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
