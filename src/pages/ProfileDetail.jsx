import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FiMapPin, FiPhone, FiMessageCircle, FiArrowLeft, FiUser, FiHeart } from 'react-icons/fi';

const ProfileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (!error) setProfile(data);
    setLoading(false);
  };

  if (loading) return (
    <div className="loading-state full-page">
      <div className="spinner" />
    </div>
  );

  if (!profile) return (
    <div className="error-state full-page">
      <p>Profile not found.</p>
      <button onClick={() => navigate('/')} className="btn-primary">Go Home</button>
    </div>
  );

  const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=e8a0b4&color=fff&size=400`;

  // Collect all photos: main + up to 3 extras
  const extraPhotos = [profile.photo_1, profile.photo_2, profile.photo_3].filter(Boolean);
  const allPhotos = [profile.profile_image || fallbackImage, ...extraPhotos].slice(0, 4);

  const handleWhatsApp = () => {
    const cleaned = profile.contact?.replace(/\D/g, '');
    window.open(`https://wa.me/${cleaned}`, '_blank');
  };

  const services = profile.services_offered
    ? profile.services_offered.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FiArrowLeft /> Back
      </button>

      <div className="detail-container">
        {/* Photos Gallery */}
        <div className="detail-gallery">
          <div className="main-photo-wrapper">
            <img
              src={allPhotos[activePhoto]}
              alt={profile.name}
              className="main-photo"
              onError={e => { e.target.src = fallbackImage; }}
            />
            <span className={`gender-badge large ${profile.gender?.toLowerCase()}`}>{profile.gender}</span>
          </div>
          {allPhotos.length > 1 && (
            <div className="photo-thumbs">
              {allPhotos.map((photo, i) => (
                <button
                  key={i}
                  className={`thumb ${activePhoto === i ? 'active' : ''}`}
                  onClick={() => setActivePhoto(i)}
                >
                  <img src={photo} alt={`Photo ${i + 1}`} onError={e => { e.target.src = fallbackImage; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="detail-info">
          <div className="detail-header">
            <h1 className="detail-name">{profile.name}</h1>
            <div className="detail-meta">
              <span><FiMapPin /> {profile.location}</span>
              {profile.age && <span><FiUser /> {profile.age} years old</span>}
            </div>
          </div>

          <div className="detail-contact">
            <p className="contact-number"><FiPhone /> {profile.contact}</p>
          </div>

          {services.length > 0 && (
            <div className="services-section">
              <h3><FiHeart /> Services Offered</h3>
              <div className="services-tags">
                {services.map((s, i) => (
                  <span key={i} className="service-tag">{s}</span>
                ))}
              </div>
            </div>
          )}

          <div className="detail-actions">
            <button className="btn-whatsapp large" onClick={handleWhatsApp}>
              <FiMessageCircle /> Chat on WhatsApp
            </button>
            <button className="btn-call large" onClick={() => window.location.href = `tel:${profile.contact}`}>
              <FiPhone /> Call Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;
