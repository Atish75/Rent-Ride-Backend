import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RoleSelect() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetch("http://127.0.0.1:8000/profile/", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProfile(data));
  }, []);

  const chooseRole = (role) => {
    localStorage.setItem('active_role', role);
    if (role === 'driver') navigate('/driver-dashboard');
    else if (role === 'owner') navigate('/owner-dashboard');
    else navigate('/');
  };

  if (!profile) return <p style={{ textAlign: "center", marginTop: "3rem" }}>Loading...</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "4rem auto", textAlign: "center", fontFamily: "Arial, sans-serif" }}>
      <h2>Welcome back! 👋</h2>
      <p style={{ color: "#666", marginBottom: "2rem" }}>How do you want to continue?</p>
      <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={() => chooseRole('customer')} style={{ flex: 1, minWidth: "160px", padding: "1.5rem", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "1.1rem", fontWeight: "bold" }}>
          🚘 Continue as Customer
        </button>

        {profile.is_driver && (
          <button onClick={() => chooseRole('driver')} style={{ flex: 1, minWidth: "160px", padding: "1.5rem", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "1.1rem", fontWeight: "bold" }}>
            🚕 Continue as Driver
          </button>
        )}

        {profile.is_owner && (
          <button onClick={() => chooseRole('owner')} style={{ flex: 1, minWidth: "160px", padding: "1.5rem", backgroundColor: "#6f42c1", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "1.1rem", fontWeight: "bold" }}>
            🚙 Continue as Car Owner
          </button>
        )}
      </div>
    </div>
  );
}