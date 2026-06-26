import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import ProfileCard from "../components/ProfileCard";
import { FiHeart } from "react-icons/fi";

// ── Home Page ──────────────────────────────────────────────
const Home = ({ genderFilter, locationFilter }) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfiles();
  }, [genderFilter, locationFilter]);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("profiles")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (genderFilter && genderFilter !== "All") {
        query = query.ilike("gender", genderFilter);
      }
      if (locationFilter && locationFilter !== "All") {
        query = query.ilike("location", `%${locationFilter}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      setError("Failed to load profiles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const activeFilters = genderFilter !== "All" || locationFilter !== "All";

  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero-content">
          <p className="hero-subtitle">
            Discover genuine connections with real people near you
          </p>
        </div>
        <div className="hero-bg" />
      </section>

      <section className="profiles-section">
        <div className="section-header">
          <h2>
            {activeFilters
              ? `Showing: ${genderFilter !== "All" ? genderFilter : ""}${genderFilter !== "All" && locationFilter !== "All" ? " " : ""}${locationFilter !== "All" ? `in ${locationFilter}` : ""}`
              : "Featured Profiles"}
          </h2>
          <div className="section-header-right">
            <span className="profile-count">{profiles.length} profiles</span>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading profiles...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchProfiles} className="btn-primary">
              Retry
            </button>
          </div>
        ) : profiles.length === 0 ? (
          <div className="empty-state">
            <FiHeart className="empty-icon" />
            <h3>No profiles found</h3>
            <p>
              {activeFilters
                ? "Try a different location or filter"
                : "No approved profiles yet"}
            </p>
          </div>
        ) : (
          <div className="profiles-grid">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Home;
