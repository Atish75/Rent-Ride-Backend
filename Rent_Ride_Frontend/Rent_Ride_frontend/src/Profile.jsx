import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './config';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', phone: '' });
  const [driverDocs, setDriverDocs] = useState({ driver_photo: null, driver_license: null });  
  const [ownerDocs, setOwnerDocs] = useState({ owner_photo: null, owner_rc: null, owner_insurance: null, owner_puc: null });  
  const [showDriverDocs, setShowDriverDocs] = useState(false);
  const [showOwnerDocs, setShowOwnerDocs] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  // Profile details fetch karein
  useEffect(() => {
    fetch(`${API_BASE_URL}/profile/`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => {
        if (res.status === 401) {
          alert("Session expired. Login First!");
          navigate("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setUser(data);
          setFormData({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            email: data.email || '',
            phone: data.phone || ''
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Profile fetch error:", err);
        setLoading(false);
      });
  }, [navigate, token]);

  // Profile update submit Handler
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/profile/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert("Profile updated successfully!");
        setUser({ ...user, ...formData });
        setIsEditing(false);
      } else {
        alert("Profile update failed.");
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleToggleDriver = async () => {
  const res = await fetch(`${API_BASE_URL}/profile/toggle-driver/`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await res.json();

  if (res.ok) {
    alert(data.is_driver ? "You're now a registered driver!" : "Driver mode disabled.");
    setUser({ ...user, is_driver: data.is_driver });
    setShowDriverDocs(false);
  } else {
    alert(data.error || "Could not toggle driver mode.");
    setShowDriverDocs(true);  
  }
};
  const handleToggleOwner = async () => {
  const res = await fetch(`${API_BASE_URL}/profile/toggle-owner/`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await res.json();

  if (res.ok) {
    alert(data.is_owner ? "You're now a registered car owner!" : "Owner mode disabled.");
    setUser({ ...user, is_owner: data.is_owner });
    setShowOwnerDocs(false);
  } else {
    alert(data.error || "Could not toggle owner mode.");
    setShowOwnerDocs(true);  
  }
};

  if (loading) return (
    <div style={{ 
      backgroundColor: "#F8FAFC", 
      minHeight: "100vh", 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      color: "#64748B"
    }}>
      <p style={{ fontWeight: "300" }}>Loading profile...</p>
    </div>
  );


const handleUploadDriverDocs = async () => {
  const formData = new FormData();
  if (driverDocs.driver_photo) formData.append('driver_photo', driverDocs.driver_photo);
  if (driverDocs.driver_license) formData.append('driver_license', driverDocs.driver_license);

  try {
    const res = await fetch(`${API_BASE_URL}/profile/upload-driver-docs/`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (res.ok) {
      alert("Driver documents uploaded!");
      setUser({ ...user, driver_photo: data.driver_photo, driver_license: data.driver_license });
    } else {
      alert(data.error || "Upload failed.");
    }
  } catch (err) {
    console.error("Upload error:", err);
  }
};

const handleUploadOwnerDocs = async () => {
  const formData = new FormData();
  if (ownerDocs.owner_photo) formData.append('owner_photo', ownerDocs.owner_photo);

  try {
    const res = await fetch(`${API_BASE_URL}/profile/upload-owner-docs/`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (res.ok) {
      alert("Owner photo uploaded!");
      setUser({ ...user, owner_photo: data.owner_photo });
    } else {
      alert(data.error || "Upload failed.");
    }
  } catch (err) {
    console.error("Upload error:", err);
  }
};
const handleDeleteDoc = async (type, fieldName) => {
  if (!window.confirm("Delete this document?")) return;
  const endpoint = type === 'driver' ? 'delete-driver-doc' : 'delete-owner-doc';
  try {
    const res = await fetch(`${API_BASE_URL}/profile/${endpoint}/${fieldName}/`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
      alert("Deleted.");
      setUser({ ...user, [fieldName]: null });
    }
  } catch (err) {
    console.error("Delete error:", err);
  }
};
  return (
    <div style={{ 
      backgroundColor: "#F8FAFC", 
      minHeight: "100vh", 
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif", 
      color: "#0F172A",
      WebkitFontSmoothing: "antialiased",
      padding: "2rem 1.5rem"
    }}>
      <div style={{ 
        maxWidth: "550px", 
        margin: "0 auto", 
        padding: "2rem", 
        border: "1px solid #E2E8F0", 
        borderRadius: "14px", 
        backgroundColor: "#FFFFFF", 
        boxShadow: "0 4px 12px rgba(0,0,0,0.03)" 
      }}>
        
        {/* HEADER AREA */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "400", color: "#0F172A", letterSpacing: "-0.5px" }}>
            👤 User Profile
          </h2>
          <button 
            onClick={() => navigate("/")} 
            style={{ 
              padding: "0.5rem 0.9rem", 
              backgroundColor: "#F1F5F9", 
              color: "#334155", 
              border: "1px solid #CBD5E1", 
              borderRadius: "6px", 
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: "300",
              transition: "all 0.2s ease"
            }}
          >
            ⬅️ Back
          </button>
        </div>

        {!isEditing ? (
          /* READ ONLY VIEW */
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <div style={{ 
                width: "72px", 
                height: "72px", 
                borderRadius: "50%", 
                backgroundColor: "#2563EB", 
                color: "#FFFFFF", 
                fontSize: "1.75rem", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                margin: "0 auto 0.75rem auto", 
                fontWeight: "400" 
              }}>
                {user?.username ? user.username[0].toUpperCase() : 'U'}
              </div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "400", color: "#0F172A" }}>
                @{user?.username}
              </h3>
            </div>

            <div style={infoRowStyle}>
              <strong style={labelStyle}>Full Name:</strong> 
              <span style={valueStyle}>{user?.first_name || user?.last_name ? `${user.first_name} ${user.last_name}` : 'Not specified'}</span>
            </div>
            
            <div style={infoRowStyle}>
              <strong style={labelStyle}>Email:</strong> 
              <span style={valueStyle}>{user?.email || 'Not specified'}</span>
            </div>
            
            <div style={infoRowStyle}>
              <strong style={labelStyle}>Phone:</strong> 
              <span style={valueStyle}>{user?.phone || 'Not specified'}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "0.75rem" }}>
              <button 
                onClick={() => setIsEditing(true)} 
                style={actionButtonStyle("#2563EB", "#FFFFFF")}
              >
                ✏️ Edit Profile
              </button>

              <button 
  onClick={handleToggleDriver} 
  style={actionButtonStyle("#FEF3C7", "#92400E", "1px solid #FDE68A")}
>
   Toggle Driver Mode
</button>
<button
  onClick={() => setShowDriverDocs(!showDriverDocs)}
  style={{ background: "none", border: "none", color: "#2563EB", fontSize: "0.8rem", cursor: "pointer", padding: "0.3rem 0", textAlign: "left" }}
>
  {showDriverDocs ? "▲ Hide driver documents" : "📄 Manage driver documents"}
</button>
{showDriverDocs && (
  <div style={{ marginTop: "0.5rem", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
    <h4 style={{ margin: "0 0 0.8rem 0" }}>Driver Documents</h4>
    <p style={{ fontSize: "0.8rem", color: user?.driver_photo && user?.driver_license ? "#28a745" : "#dc3545" }}>
      {user?.driver_photo && user?.driver_license ? "✅ Both documents uploaded" : "⚠️ Required before enabling Driver mode"}
    </p>

    <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.3rem" }}>Photo:</label>
    {user?.driver_photo && (
     <div style={{ marginBottom: "0.5rem" }}>
    <img
      src={user.driver_photo}
      alt="Driver photo"
      style={{ width: "220px", height: "120px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ddd", display: "block", marginBottom: "0.35rem" }}
    />
    <button
      onClick={() => handleDeleteDoc('driver', 'driver_photo')}
      style={{ fontSize: "0.75rem", color: "#dc3545", background: "none", border: "none", cursor: "pointer", padding: 0 }}
    >
      🗑️ Delete photo
    </button>
  </div>
      
   )}
    <input type="file" accept="image/*" onChange={(e) => setDriverDocs({ ...driverDocs, driver_photo: e.target.files[0] })} style={{ marginBottom: "0.6rem", display: "block" }} />

    <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.3rem" }}>Driving License:</label>
    {user?.driver_license && (
  <div style={{ marginBottom: "0.5rem" }}>
    <img
      src={user.driver_license}
      alt="Driver license"
      style={{ width: "220px", height: "120px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ddd", display: "block", marginBottom: "0.35rem" }}
    />
    <button
      onClick={() => handleDeleteDoc('driver', 'driver_license')}
      style={{ fontSize: "0.75rem", color: "#dc3545", background: "none", border: "none", cursor: "pointer", padding: 0 }}
    >
      🗑️ Delete license
    </button>
  </div>
)}
    <input type="file" accept="image/*" onChange={(e) => setDriverDocs({ ...driverDocs, driver_license: e.target.files[0] })} style={{ marginBottom: "0.8rem", display: "block" }} />

    <button onClick={handleUploadDriverDocs} style={{ padding: "0.5rem 1rem", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
      Upload Driver Documents
    </button>
  </div>
)}

              <button 
  onClick={handleToggleOwner} 
  style={actionButtonStyle("#EEF2FF", "#3730A3", "1px solid #C7D2FE")}
>
   Toggle Car Owner Mode
</button>
<button
  onClick={() => setShowOwnerDocs(!showOwnerDocs)}
  style={{ background: "none", border: "none", color: "#2563EB", fontSize: "0.8rem", cursor: "pointer", padding: "0.3rem 0", textAlign: "left" }}
>
  {showOwnerDocs ? "▲ Hide owner documents" : "📄 Manage owner documents"}
</button>

{showOwnerDocs && (
  <div style={{ marginTop: "0.5rem", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
    <h4 style={{ margin: "0 0 0.8rem 0" }}> Owner Photo</h4>
    <p style={{ fontSize: "0.8rem", color: user?.owner_photo ? "#28a745" : "#dc3545" }}>
      {user?.owner_photo ? "✅ Photo uploaded" : "⚠️ Required before enabling Owner mode"}
    </p>
    <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.3rem" }}>Photo:</label>
   {user?.owner_photo && (
  <div style={{ marginBottom: "0.5rem" }}>
    <img
      src={user.owner_photo}
      alt="Owner photo"
      style={{ width: "220px", height: "120px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ddd", display: "block", marginBottom: "0.35rem" }}
    />
    <button
      onClick={() => handleDeleteDoc('owner', 'owner_photo')}
      style={{ fontSize: "0.75rem", color: "#dc3545", background: "none", border: "none", cursor: "pointer", padding: 0 }}
    >
      🗑️ Delete photo
    </button>
  </div>
)}
    <input type="file" accept="image/*" onChange={(e) => setOwnerDocs({ ...ownerDocs, owner_photo: e.target.files[0] })} style={{ marginBottom: "0.8rem", display: "block" }} />
    <button onClick={handleUploadOwnerDocs} style={{ padding: "0.5rem 1rem", backgroundColor: "#6f42c1", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
      Upload Owner Photo
    </button>
  </div>
)}

            </div>
          </div>
        ) : (
          /* EDIT FORM VIEW */
          <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <div>
              <label style={formLabelStyle}>First Name:</label>
              <input 
                type="text" 
                value={formData.first_name} 
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} 
                style={inputStyle}
              />
            </div>

            <div>
              <label style={formLabelStyle}>Last Name:</label>
              <input 
                type="text" 
                value={formData.last_name} 
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} 
                style={inputStyle}
              />
            </div>

            <div>
              <label style={formLabelStyle}>Email:</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                style={inputStyle}
              />
            </div>

            <div>
              <label style={formLabelStyle}>Phone Number:</label>
              <input 
                type="text" 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
              <button 
                type="button" 
                onClick={() => setIsEditing(false)} 
                style={{ flex: 1, padding: "0.7rem", backgroundColor: "#F1F5F9", color: "#475569", border: "1px solid #CBD5E1", borderRadius: "8px", cursor: "pointer", fontWeight: "300", fontSize: "0.9rem" }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                style={{ flex: 1, padding: "0.7rem", backgroundColor: "#047857", color: "#FFFFFF", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "300", fontSize: "0.9rem" }}
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

// Styling Helpers
const infoRowStyle = {
  padding: "0.85rem 1rem", 
  backgroundColor: "#F8FAFC", 
  borderRadius: "8px",
  border: "1px solid #E2E8F0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const labelStyle = {
  fontWeight: "300",
  color: "#64748B",
  fontSize: "0.9rem"
};

const valueStyle = {
  fontWeight: "400",
  color: "#0F172A",
  fontSize: "0.9rem"
};

const formLabelStyle = {
  display: "block", 
  marginBottom: "0.4rem", 
  fontWeight: "300",
  fontSize: "0.875rem",
  color: "#334155"
};

const inputStyle = {
  width: "100%", 
  padding: "0.65rem 0.85rem", 
  borderRadius: "8px", 
  border: "1px solid #CBD5E1",
  color: "#0F172A",
  backgroundColor: "#FFFFFF",
  outline: "none",
  boxSizing: "border-box",
  fontSize: "0.9rem",
  fontWeight: "300"
};

const actionButtonStyle = (bgColor, textColor, border = "none") => ({
  padding: "0.7rem",
  backgroundColor: bgColor,
  color: textColor,
  border: border,
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: "300",
  transition: "all 0.2s ease",
  width: "100%",
  textAlign: "center"
});