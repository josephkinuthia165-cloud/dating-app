import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiLogOut, FiHeart, FiMenu, FiX } from 'react-icons/fi';

const Navbar = ({ onGenderFilter, onLocationFilter, activeGender, activeLocation }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const genders = ['All', 'Male', 'Female', 'Trans'];
  const locations = ['All', 'Nairobi', 'Mombasa', 'Kisumu'];

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

        <div className={`nav-center ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link>

          <div className="filter-group">
            <span className="filter-label">Gender</span>
            <div className="filter-pills">
              {genders.map(g => (
                <button
                  key={g}
                  className={`pill ${activeGender === g ? 'active' : ''}`}
                  onClick={() => { onGenderFilter(g); setMenuOpen(false); }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Location</span>
            <div className="filter-pills">
              {locations.map(l => (
                <button
                  key={l}
                  className={`pill ${activeLocation === l ? 'active' : ''}`}
                  onClick={() => { onLocationFilter(l); setMenuOpen(false); }}
                >
                  {l}
                </button>
              ))}
            </div>
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
              <Link to="/login" className="btn-ghost">Login</Link>
              <Link to="/signup" className="btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
