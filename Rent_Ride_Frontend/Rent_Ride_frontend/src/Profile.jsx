import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', phone: '' });

  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  // Profile details fetch karein
  useEffect(() => {
    fetch("http://127.0.0.1:8000/profile/", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => {
        if (res.status === 401) {
          alert("Session expired. Pehle login karein!");
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
      const res = await fetch("http://127.0.0.1:8000/profile/", {
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
        alert("Profile update fail ho gaya.");
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "3rem" }}>Loading profile...</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "2rem", border: "1px solid #e0e0e0", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", backgroundColor: "#fff", fontFamily: "Arial, sans-serif" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2>👤 User Profile</h2>
        <button onClick={() => navigate("/")} style={{ marginLeft:"6rem",padding: "0.5rem 1rem", backgroundColor: "#6c757d", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
          ⬅️ Back
        </button>
      </div>

      {!isEditing ? (
        /* READ ONLY VIEW */
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#007bff", color: "#fff", fontSize: "2rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.5rem auto", fontWeight: "bold" }}>
              {user?.username ? user.username[0].toUpperCase() : 'U'}
            </div>
            <h3>@{user?.username}</h3>
          </div>

          <div style={{ padding: "0.8rem", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
            <strong>Full Name:</strong> {user?.first_name || user?.last_name ? `${user.first_name} ${user.last_name}` : 'Not specified'}
          </div>
          <div style={{ padding: "0.8rem", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
            <strong>Email:</strong> {user?.email || 'Not specified'}
          </div>
          <div style={{ padding: "0.8rem", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
            <strong>Phone:</strong> {user?.phone || 'Not specified'}
          </div>

          <button 
            onClick={() => setIsEditing(true)} 
            style={{ marginTop: "1rem", padding: "0.7rem", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          >
            ✏️ Edit Profile
          </button>
        </div>
      ) : (
        /* EDIT FORM VIEW */
        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "bold" }}>First Name:</label>
            <input 
              type="text" 
              value={formData.first_name} 
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} 
              style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "bold" }}>Last Name:</label>
            <input 
              type="text" 
              value={formData.last_name} 
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} 
              style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "bold" }}>Email:</label>
            <input 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "bold" }}>Phone Number:</label>
            <input 
              type="text" 
              value={formData.phone} 
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
              style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button type="button" onClick={() => setIsEditing(false)} style={{ flex: 1, padding: "0.7rem", backgroundColor: "#6c757d", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" style={{ flex: 1, padding: "0.7rem", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
              Save Changes
            </button>
          </div>
        </form>
      )}

    </div>
  );
}