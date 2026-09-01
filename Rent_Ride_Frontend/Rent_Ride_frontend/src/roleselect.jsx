import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './config';

export default function RoleSelect() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetch(`${API_BASE_URL}/profile/`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProfile(data));
  }, [token]);

  const chooseRole = (role) => {
    localStorage.setItem('active_role', role);
    if (role === 'driver') navigate('/driver-dashboard');
    else if (role === 'owner') navigate('/owner-dashboard');
    else navigate('/');
  };

  if (!profile) return (
    <div style={{ 
      backgroundColor: "#F8FAFC", 
      minHeight: "100vh", 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      color: "#64748B"
    }}>
      <p style={{ fontWeight: "300" }}>Loading...</p>
    </div>
  );

  return (
    <div style={{
      backgroundColor: "#F8FAFC",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      color: "#0F172A",
      WebkitFontSmoothing: "antialiased",
      padding: "1.5rem"
    }}>
      <div style={{ 
        width: "100%",
        maxWidth: '520px', 
        backgroundColor: '#FFFFFF',
        padding: '2.5rem 2rem', 
        border: '1px solid #E2E8F0', 
        borderRadius: '16px', 
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
        textAlign: "center"
      }}>
        <h2 style={{ 
          margin: "0 0 0.5rem 0", 
          fontSize: '1.6rem', 
          fontWeight: '400', 
          color: '#0F172A',
          letterSpacing: '-0.5px'
        }}>
          Welcome back! 👋
        </h2>
        
        <p style={{ 
          color: "#64748B", 
          marginBottom: "2rem", 
          fontSize: "0.95rem", 
          fontWeight: "300",
          margin: "0 0 2rem 0"
        }}>
          How do you want to continue?
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          
          {/* CUSTOMER ROLE BUTTON */}
          <button 
            onClick={() => chooseRole('customer')} 
            style={roleButtonStyle("#2563EB", "#FFFFFF")}
          >
             Continue as Customer
          </button>

          {/* DRIVER ROLE BUTTON */}
          {profile.is_driver && (
            <button 
              onClick={() => chooseRole('driver')} 
              style={roleButtonStyle("#FEF3C7", "#92400E", "1px solid #FDE68A")}
            >
               Continue as Driver
            </button>
          )}

          {/* OWNER ROLE BUTTON */}
          {profile.is_owner && (
            <button 
              onClick={() => chooseRole('owner')} 
              style={roleButtonStyle("#EEF2FF", "#3730A3", "1px solid #C7D2FE")}
            >
              Continue as Car Owner
            </button>
          )}

        </div>
      </div>
    </div>
  );
}

// Button styling helper function
const roleButtonStyle = (bgColor, textColor, border = "none") => ({
  width: "100%",
  padding: "1rem 1.25rem",
  backgroundColor: bgColor,
  color: textColor,
  border: border,
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "1rem",
  fontWeight: "300",
  transition: "all 0.2s ease",
  textAlign: "center"
});