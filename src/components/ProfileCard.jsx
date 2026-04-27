import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMessageCircle } from 'react-icons/fi';

const ProfileCard = ({ profile }) => {
  const navigate = useNavigate();

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    const cleaned = profile.contact?.replace(/\D/g, '');
    window.open(`https://wa.me/${cleaned}`, '_blank');
  };

  const handleCall = (e) => {
    e.stopPropagation();
    window.location.href = `tel:${profile.contact}`;
  };

  const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=e8a0b4&color=fff&size=300`;

  return (
    <div className="profile-card" onClick={() => navigate(`/profile/${profile.id}`)}>
      <div className="card-image-wrapper">
        <img
          src={profile.profile_image || fallbackImage}
          alt={profile.name}
          className="card-image"
          onError={e => { e.target.src = fallbackImage; }}
        />
        <div className="card-overlay" />
        <span className={`gender-badge ${profile.gender?.toLowerCase()}`}>
          {profile.gender}
        </span>
      </div>

      <div className="card-body">
        <h3 className="card-name">{profile.name}</h3>
        <div className="card-meta">
          <span><FiMapPin /> {profile.location}</span>
          <span><FiPhone /> {profile.contact}</span>
        </div>

        <div className="card-actions">
          <button className="btn-whatsapp" onClick={handleWhatsApp}>
            <FiMessageCircle /> WhatsApp
          </button>
          <button className="btn-call" onClick={handleCall}>
            <FiPhone /> Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
