import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/useAuth";
import {
  FiUser,
  FiLogOut,
  FiHeart,
  FiMenu,
  FiX,
  FiShield,
  FiMapPin,
} from "react-icons/fi";

const LocationSearch = ({ onLocationFilter, activeLocation }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeLocation === "All") setQuery("");
  }, [activeLocation]);

  const fetchSuggestions = async (value) => {
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("location")
      .ilike("location", `%${value}%`)
      .eq("status", "approved");
    const unique = [...new Set(data?.map((p) => p.location).filter(Boolean))];
    setSuggestions(unique);
    setShowDropdown(unique.length > 0);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (!value) {
      onLocationFilter("All");
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    fetchSuggestions(value);
  };

  const handleSelect = (location) => {
    setQuery(location);
    onLocationFilter(location);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setQuery("");
    onLocationFilter("All");
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div className="location-search-wrapper" ref={wrapperRef}>
      <div className="location-search-input-wrap">
        <FiMapPin className="location-search-icon" />
        <input
          type="text"
          className="location-search-input"
          placeholder="Search location..."
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        />
        {query && (
          <button className="location-clear-btn" onClick={handleClear}>
            <FiX />
          </button>
        )}
      </div>
      {showDropdown && (
        <ul className="location-suggestions">
          {suggestions.map((loc, i) => (
            <li key={i} onClick={() => handleSelect(loc)}>
              <FiMapPin /> {loc}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Navbar = ({
  onGenderFilter,
  onLocationFilter,
  activeGender,
  activeLocation,
}) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const genders = ["All", "Male", "Female", "Trans"];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <FiHeart className="brand-icon" />
          <span>Coast Escorts</span>
        </Link>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <div className={`nav-center ${menuOpen ? "open" : ""}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            Home
          </Link>

          {/* Gender filter */}
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

          {/* Location search */}
          <LocationSearch
            onLocationFilter={onLocationFilter}
            activeLocation={activeLocation}
          />
        </div>

        <div className="nav-right">
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="admin-nav-btn" title="Admin Panel">
                  <FiShield /> <span>Admin</span>
                </Link>
              )}
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
