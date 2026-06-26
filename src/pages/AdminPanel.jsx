import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/useAuth";
import {
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiMapPin,
  FiPhone,
  FiUser,
  FiEye,
  FiTrash2,
} from "react-icons/fi";

const TABS = ["pending", "approved", "denied"];

const StatusChip = ({ status }) => {
  const cfg = {
    pending: { color: "#92400e", bg: "#fef3c7", label: "Pending" },
    approved: { color: "#166534", bg: "#dcfce7", label: "Approved" },
    denied: { color: "#9f1239", bg: "#ffe4e6", label: "Denied" },
  };
  const c = cfg[status] || cfg.pending;
  return (
    <span className="status-chip" style={{ color: c.color, background: c.bg }}>
      {status === "pending" && <FiClock />}
      {status === "approved" && <FiCheckCircle />}
      {status === "denied" && <FiXCircle />}
      {c.label}
    </span>
  );
};

const AdminPanel = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [denyNote, setDenyNote] = useState("");
  const [showDenyModal, setShowDenyModal] = useState(null);
  const [saving, setSaving] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) {
      navigate("/");
      return;
    }
    fetchProfiles();
  }, [user, isAdmin, authLoading, activeTab]);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("status", activeTab)
      .order("created_at", { ascending: false });
    setProfiles(data || []);
    setLoading(false);
  };

  const updateStatus = async (id, status, note = null) => {
    setSaving(id);
    const update = { status };
    if (note !== null) update.admin_note = note;
    await supabase.from("profiles").update(update).eq("id", id);
    setProfiles((prev) => prev.filter((profile) => profile.id !== id));
    if (selectedProfile?.id === id) setSelectedProfile(null);
    setShowDenyModal(null);
    setDenyNote("");
    setSaving("");
  };
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this profile?",
      )
    )
      return;
    setSaving(id);

    // delete storage images first
    const p = selectedProfile;
    const imageFields = [
      p.profile_image,
      p.photo_1,
      p.photo_2,
      p.photo_3,
    ].filter(Boolean);
    const paths = imageFields
      .map((url) => url.split("/profile-images/")[1])
      .filter(Boolean)
      .map((path) => decodeURIComponent(path));
    if (paths.length > 0) {
      await supabase.storage.from("profile-images").remove(paths);
    }

    // delete the profile row
    await supabase.from("profiles").delete().eq("id", id);

    setProfiles((prev) => prev.filter((p) => p.id !== id));
    setSelectedProfile(null);
    setSaving("");
  };

  const counts = async () => {
    // just refetch on tab change; counts shown in tabs
  };

  const fallback = (name) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=e8a0b4&color=fff&size=120`;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-title">
          <FiShield className="admin-shield" />
          <div>
            <h1>Admin Panel</h1>
            <p>Review and manage profile submissions</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`admin-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => {
              setActiveTab(tab);
              setSelectedProfile(null);
            }}
          >
            {tab === "pending" && <FiClock />}
            {tab === "approved" && <FiCheckCircle />}
            {tab === "denied" && <FiXCircle />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="admin-body">
        {/* List */}
        <div className="admin-list">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
            </div>
          ) : profiles.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 20px" }}>
              <p>No {activeTab} profiles</p>
            </div>
          ) : (
            profiles.map((profile) => (
              <div
                key={profile.id}
                className={`admin-list-item ${selectedProfile?.id === profile.id ? "selected" : ""}`}
                onClick={() => setSelectedProfile(profile)}
              >
                <img
                  src={profile.profile_image || fallback(profile.name)}
                  alt={profile.name}
                  className="admin-list-avatar"
                  onError={(e) => {
                    e.target.src = fallback(profile.name);
                  }}
                />
                <div className="admin-list-info">
                  <strong>{profile.name}</strong>
                  <span>
                    <FiMapPin /> {profile.location}
                  </span>
                  <span>
                    {profile.gender} ·{" "}
                    {profile.age ? `${profile.age} yrs` : "—"}
                  </span>
                </div>
                <StatusChip status={profile.status} />
              </div>
            ))
          )}
        </div>

        {/* Detail pane */}
        <div className="admin-detail">
          {!selectedProfile ? (
            <div className="admin-detail-empty">
              <FiEye />
              <p>Select a profile to review</p>
            </div>
          ) : (
            <div className="admin-detail-content">
              {/* Photos */}
              <div className="admin-photos">
                <img
                  src={
                    selectedProfile.profile_image ||
                    fallback(selectedProfile.name)
                  }
                  alt={selectedProfile.name}
                  className="admin-main-photo"
                  onError={(e) => {
                    e.target.src = fallback(selectedProfile.name);
                  }}
                />
                <div className="admin-extra-photos">
                  {[
                    selectedProfile.photo_1,
                    selectedProfile.photo_2,
                    selectedProfile.photo_3,
                  ]
                    .filter(Boolean)
                    .map((p, i) => (
                      <img
                        key={i}
                        src={p}
                        alt={`Extra ${i + 1}`}
                        className="admin-thumb"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ))}
                </div>
              </div>

              {/* Info */}
              <div className="admin-info-grid">
                <div className="admin-info-row">
                  <FiUser />
                  <span>Name</span>
                  <strong>{selectedProfile.name}</strong>
                </div>
                <div className="admin-info-row">
                  <FiMapPin />
                  <span>Location</span>
                  <strong>{selectedProfile.location}</strong>
                </div>
                <div className="admin-info-row">
                  <FiPhone />
                  <span>Contact</span>
                  <strong>{selectedProfile.contact}</strong>
                </div>
                <div className="admin-info-row">
                  <span>Age</span>
                  <strong>{selectedProfile.age || "—"}</strong>
                </div>
                <div className="admin-info-row">
                  <span>Gender</span>
                  <strong>{selectedProfile.gender}</strong>
                </div>
                <div className="admin-info-row full">
                  <span>Services</span>
                  <strong>{selectedProfile.services_offered || "—"}</strong>
                </div>
                <div className="admin-info-row full">
                  <span>Submitted</span>
                  <strong>
                    {new Date(selectedProfile.created_at).toLocaleString()}
                  </strong>
                </div>
                {selectedProfile.admin_note && (
                  <div className="admin-info-row full deny-note-display">
                    <span>Previous denial reason</span>
                    <strong>{selectedProfile.admin_note}</strong>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="admin-actions">
                {selectedProfile.status !== "approved" && (
                  <button
                    className="btn-approve"
                    disabled={saving === selectedProfile.id}
                    onClick={() =>
                      updateStatus(selectedProfile.id, "approved", null)
                    }
                  >
                    {saving === selectedProfile.id ? (
                      <span className="spinner small" />
                    ) : (
                      <FiCheckCircle />
                    )}
                    Approve
                  </button>
                )}
                {selectedProfile.status !== "denied" && (
                  <button
                    className="btn-deny"
                    disabled={saving === selectedProfile.id}
                    onClick={() => setShowDenyModal(selectedProfile)}
                  >
                    <FiXCircle /> Deny
                  </button>
                )}
                {selectedProfile.status === "approved" && (
                  <button
                    className="btn-deny"
                    disabled={saving === selectedProfile.id}
                    onClick={() =>
                      updateStatus(selectedProfile.id, "pending", null)
                    }
                  >
                    <FiClock /> Move to Pending
                  </button>
                )}
                <button
                  className="btn-delete"
                  disabled={saving === selectedProfile.id}
                  onClick={() => handleDelete(selectedProfile.id)}
                >
                  <FiTrash2 /> Delete Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deny Modal */}
      {showDenyModal && (
        <div className="modal-overlay" onClick={() => setShowDenyModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>
              <FiXCircle /> Deny Profile
            </h3>
            <p>
              Optionally explain why this profile was denied. The user will see
              this message.
            </p>
            <textarea
              className="deny-textarea"
              placeholder="Reason for denial (optional)…"
              value={denyNote}
              onChange={(e) => setDenyNote(e.target.value)}
              rows={4}
            />
            <div className="modal-actions">
              <button
                className="btn-ghost"
                onClick={() => {
                  setShowDenyModal(null);
                  setDenyNote("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn-deny"
                onClick={() =>
                  updateStatus(showDenyModal.id, "denied", denyNote || null)
                }
              >
                <FiXCircle /> Confirm Deny
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
