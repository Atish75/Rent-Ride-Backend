import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './config';

export default function MobileLocationSender() {
  const { carId } = useParams();
  const navigate = useNavigate();
  
  // States remain identical
  const [status, setStatus] = useState("Initializing...");
  const [coords, setCoords] = useState({ lat: 22.6465, lng: 88.3684 });

  useEffect(() => {
    // Location Post Function (Logic identical)
    const sendLocationData = async (latitude, longitude) => {
      try {
        const response = await fetch(`${API_BASE_URL}/cars/${carId}/location/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude, longitude })
        });

        if (response.ok) {
          setStatus("🟢 Live Location Sent Successfully!");
        } else {
          setStatus(`🔴 Backend Error: Status ${response.status}`);
        }
      } catch (err) {
        setStatus("❌ Network error connecting to Django API.");
      }
    };

    // Geolocation Handler Function (Logic identical)
    const handleGPS = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const currentLat = position.coords.latitude;
            const currentLng = position.coords.longitude;
            setCoords({ lat: currentLat, lng: currentLng });
            sendLocationData(currentLat, currentLng);
          },
          (error) => {
            // GPS Timeout / Error handling is identical
            setStatus("⚠️ GPS Timed Out - Using Fallback Position");
            sendLocationData(coords.lat, coords.lng);
          },
          // Configuration remains same
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
        );
      } else {
        // Fallback execution remains same
        sendLocationData(coords.lat, coords.lng);
      }
    };

    // Immediately trigger on load
    handleGPS();

    // Setup interval pooling every 4 seconds
    const interval = setInterval(handleGPS, 4000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [carId, coords.lat, coords.lng]);

  // Derived styling for status based on content
  const isErrorOrWarning = status.includes("❌") || status.includes("🔴") || status.includes("⚠️");

  return (
    <div style={{
      backgroundColor: "#F8FAFC",
      minHeight: "100vh",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      color: "#0F172A",
      WebkitFontSmoothing: "antialiased",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "1.5rem"
    }}>
      <div style={{ 
        width: "100%",
        maxWidth: '380px', 
        backgroundColor: '#FFFFFF',
        padding: '2.25rem 2rem', 
        border: '1px solid #E2E8F0', 
        borderRadius: '14px', 
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
        textAlign: "center"
      }}>
        
        {/* HEADER AREA */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '1.4rem', 
            fontWeight: '400', 
            color: '#0F172A',
            letterSpacing: '-0.5px',
            marginBottom: '0.25rem'
          }}>
            📱 Phone GPS Tracker
          </h2>
          <p style={{ margin: 0, color: "#64748B", fontSize: "0.95rem", fontWeight: "300" }}>
            Currently Tracking: <strong>{carId}</strong>
          </p>
        </div>
        
        {/* COORDINATES DISPLAY CARD */}
        <div style={{ 
          margin: "1.5rem 0", 
          padding: "1.25rem", 
          border: "1px solid #E2E8F0", 
          borderRadius: "10px", 
          backgroundColor: "#F8FAFC",
          textAlign: "left"
        }}>
          <h4 style={{ 
            margin: "0 0 0.75rem 0", 
            fontSize: "1rem", 
            fontWeight: "500", 
            color: "#334155" 
          }}>
            Current Position:
          </h4>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
            <span style={coordinateLabelStyle}>Latitude</span>
            <span style={coordinateValueStyle}>{coords.lat.toFixed(6)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={coordinateLabelStyle}>Longitude</span>
            <span style={coordinateValueStyle}>{coords.lng.toFixed(6)}</span>
          </div>
        </div>

        {/* STATUS DISPLAY */}
        <div style={{
          backgroundColor: isErrorOrWarning ? "#FEF2F2" : "#ECFDF5",
          border: isErrorOrWarning ? "1px solid #FCA5A5" : "1px solid #A7F3D0",
          color: isErrorOrWarning ? "#B91C1C" : "#047857",
          padding: "0.75rem",
          borderRadius: "8px",
          fontSize: "0.9rem",
          textAlign: "center",
          marginBottom: "1.5rem",
          fontWeight: isErrorOrWarning ? "300" : "400",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "0.4rem"
        }}>
          {status}
        </div>

        {/* BACK BUTTON */}
        <button 
          onClick={() => navigate("/")} 
          style={{ 
            width: '100%',
            padding: '0.75rem', 
            backgroundColor: '#F1F5F9', 
            color: '#334155', 
            border: '1px solid #CBD5E1', 
            borderRadius: '8px', 
            fontWeight: '300', 
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          ⬅️ Back Home
        </button>
      </div>
    </div>
  );
}

// Styling objects for reuse and cleaner code
const coordinateLabelStyle = {
  fontSize: "0.9rem",
  fontWeight: "300",
  color: "#64748B"
};

const coordinateValueStyle = {
  fontSize: "0.9rem",
  fontWeight: "400",
  color: "#0F172A",
  fontFamily: "monospace" // Better formatting for numbers
};