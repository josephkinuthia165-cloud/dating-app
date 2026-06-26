import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/useAuth";
import {
  FiUser,
  FiMapPin,
  FiPhone,
  FiSave,
  FiUpload,
  FiHeart,
  FiCamera,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from "react-icons/fi";

const LOCATIONS = ["Nairobi", "Mombasa", "Kisumu"];
const GENDERS = ["Male", "Female", "Trans"];

const StatusBanner = ({ status, adminNote }) => {
  if (!status) return null;
  const config = {
    pending: {
      icon: <FiClock />,
      bg: "#fffbeb",
      border: "#fcd34d",
      color: "#92400e",
      label: "Pending Review",
      msg: "Your profile has been submitted and is awaiting admin approval. It will appear on the homepage once approved.",
    },
    approved: {
      icon: <FiCheckCircle />,
      bg: "#f0fdf4",
      border: "#86efac",
      color: "#166534",
      label: "Approved",
      msg: "Your profile is live and visible on the homepage!",
    },
    denied: {
      icon: <FiXCircle />,
      bg: "#fff1f2",
      border: "#fda4af",
      color: "#9f1239",
      label: "Not Approved",
      msg: adminNote
        ? `Reason: ${adminNote}`
        : "Your profile was not approved. Please update it and save again to resubmit.",
    },
  };
  const c = config[status];
  if (!c) return null;
  return (
    <div
      className="status-banner"
      style={{ background: c.bg, borderColor: c.border, color: c.color }}
    >
      <span className="status-icon">{c.icon}</span>
      <div>
        <strong>{c.label}</strong>
        <p>{c.msg}</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const photoRefs = [useRef(null), useRef(null), useRef(null)];

  const [form, setForm] = useState({
    name: "",
    location: "",
    contact: "",
    age: "",
    gender: "",
    services_offered: "",
    profile_image: "",
    photo_1: "",
    photo_2: "",
    photo_3: "",
  });
  const [profileStatus, setProfileStatus] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (data) {
      setForm({
        name: data.name || "",
        location: data.location || "",
        contact: data.contact || "",
        age: data.age || "",
        gender: data.gender || "",
        services_offered: data.services_offered || "",
        profile_image: data.profile_image || "",
        photo_1: data.photo_1 || "",
        photo_2: data.photo_2 || "",
        photo_3: data.photo_3 || "",
      });
      setProfileStatus(data.status);
      setAdminNote(data.admin_note || "");
    }
    setLoading(false);
  };

  const uploadImage = async (file, field) => {
    // hard limit — reject anything over 10MB immediately
    if (file.size > 5 * 1024 * 1024) {
      setError("Image is too large. Please choose a file under 5MB.");
      return;
    }

    setUploading(field);

    // silently compress before uploading
    let fileToUpload = file;
    try {
      fileToUpload = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      });
    } catch {
      // if compression fails for any reason, just use original file
      fileToUpload = file;
    }

    // --- delete old image from storage before uploading ---
    const oldUrl = form[field];
    if (oldUrl) {
      const oldPath = oldUrl.split("/profile-images/")[1];
      if (oldPath) {
        await supabase.storage
          .from("profile-images")
          .remove([decodeURIComponent(oldPath)]);
      }
    }
    // ------------------------------------------------------

    const ext = file.name.split(".").pop();
    const path = `${user.id}/${field}_${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("profile-images")
      .upload(path, fileToUpload, { upsert: true }); // <-- fileToUpload not file
    if (uploadErr) {
      setError("Upload failed: " + uploadErr.message);
      setUploading("");
      return;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-images").getPublicUrl(path);
    setForm((prev) => ({ ...prev, [field]: publicUrl }));
    setUploading("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    // When a denied profile is re-edited and saved, reset to pending for re-review
    const newStatus =
      profileStatus === "denied" ? "pending" : profileStatus || "pending";

    const payload = {
      ...form,
      user_id: user.id,
      age: form.age ? parseInt(form.age) : null,
      status: newStatus,
      admin_note: profileStatus === "denied" ? null : adminNote,
    };

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();
    let err;
    if (existing) {
      ({ error: err } = await supabase
        .from("profiles")
        .update(payload)
        .eq("user_id", user.id));
    } else {
      ({ error: err } = await supabase.from("profiles").insert([payload]));
    }

    if (err) setError(err.message);
    else {
      setProfileStatus(newStatus);
      setSuccess(
        newStatus === "pending"
          ? "Profile submitted for review!"
          : "Profile saved!",
      );
    }
    setSaving(false);
  };

  const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || "User")}&background=e8a0b4&color=fff&size=200`;

  if (loading)
    return (
      <div className="loading-state full-page">
        <div className="spinner" />
      </div>
    );

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <FiHeart className="dash-icon" />
          <div>
            <h1>My Profile</h1>
            <p>Manage how you appear to others</p>
          </div>
        </div>

        <StatusBanner status={profileStatus} adminNote={adminNote} />

        {success && <div className="success-msg">{success}</div>}
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSave} className="dashboard-form">
          {/* Main Photo */}
          <div className="photo-upload-section">
            <div className="main-photo-upload">
              <img
                src={form.profile_image || fallbackImage}
                alt="Profile"
                className="profile-preview"
                onError={(e) => {
                  e.target.src = fallbackImage;
                }}
              />
              <button
                type="button"
                className="photo-upload-btn"
                onClick={() => fileRef.current.click()}
              >
                <FiCamera />{" "}
                <span>
                  {uploading === "profile_image"
                    ? "Uploading…"
                    : "Profile Photo"}
                </span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  e.target.files[0] &&
                  uploadImage(e.target.files[0], "profile_image")
                }
              />
            </div>

            <div className="extra-photos">
              <p className="photos-label">Additional Photos (up to 3)</p>
              <div className="extra-photos-grid">
                {["photo_1", "photo_2", "photo_3"].map((field, i) => (
                  <div key={field} className="extra-photo-slot">
                    {form[field] ? (
                      <img
                        src={form[field]}
                        alt={`Photo ${i + 1}`}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="photo-placeholder">
                        <FiCamera />
                      </div>
                    )}
                    <button
                      type="button"
                      className="extra-upload-btn"
                      onClick={() => photoRefs[i].current.click()}
                    >
                      {uploading === field ? (
                        <span className="spinner small" />
                      ) : (
                        <FiUpload />
                      )}
                    </button>
                    <input
                      ref={photoRefs[i]}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) =>
                        e.target.files[0] &&
                        uploadImage(e.target.files[0], field)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>
                <FiUser /> Name
              </label>
              <input
                type="text"
                placeholder="Your display name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>
                <FiPhone /> Contact
              </label>
              <input
                type="tel"
                placeholder="+254 7XX XXX XXX"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                placeholder="Age"
                min="18"
                max="99"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                required
              >
                <option value="">Select gender</option>
                {GENDERS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>
                <FiMapPin /> Location
              </label>
              <input
                type="text"
                placeholder="e.g. Nairobi,westlands"
                value={form.location}
                onChange={(e) => {
                  // sanitize: strip special characters, allow only letters, spaces, commas, hyphens
                  const sanitized = e.target.value.replace(
                    /[^a-zA-Z\s,'-]/g,
                    "",
                  );
                  setForm({ ...form, location: sanitized });
                }}
                maxLength={100}
                required
              />
            </div>
            <div className="form-group full-width">
              <label>
                <FiHeart /> Services Offered
              </label>
              <textarea
                placeholder="e.g. Dinner dates, Travel companion (comma separated)"
                value={form.services_offered}
                onChange={(e) =>
                  setForm({ ...form, services_offered: e.target.value })
                }
                rows={3}
              />
              <span className="field-hint">Separate services with commas</span>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary save-btn"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner small" /> Saving...
              </>
            ) : (
              <>
                <FiSave />{" "}
                {profileStatus === "denied"
                  ? "Resubmit for Review"
                  : "Save Profile"}
              </>
            )}
          </button>

          {profileStatus === "denied" && (
            <p className="resubmit-hint">
              <FiAlertCircle /> Saving will resubmit your profile for admin
              review.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
