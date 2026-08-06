import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function MobileLocationSender() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Initializing...");
  const [coords, setCoords] = useState({ lat: 22.6465, lng: 88.3684 });

  useEffect(() => {
    // Location Post Function
    const sendLocationData = async (latitude, longitude) => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/cars/${carId}/location/`, {
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

    // Location Handler Function
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
            // GPS Timeout / Error hone par saved fallback coordinates send kar do
            setStatus("⚠️ GPS Timed Out - Using Fallback Position");
            sendLocationData(coords.lat, coords.lng);
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
        );
      } else {
        sendLocationData(coords.lat, coords.lng);
      }
    };

    // Pehle hi second me call karo
    handleGPS();

    // Har 4 second me auto-trigger
    const interval = setInterval(handleGPS, 4000);

    return () => clearInterval(interval);
  }, [carId]);

  return (
    <div style={{ padding: "2rem", textAlign: "center", fontFamily: "Arial, sans-serif" }}>
      <h2>📱 Live Phone GPS Tracker</h2>
      <p style={{ fontSize: "1.2rem" }}>Car ID: <strong>{carId}</strong></p>
      
      <div style={{ margin: "1.5rem 0", padding: "1.5rem", border: "1px solid #ddd", borderRadius: "10px", backgroundColor: "#f9f9f9" }}>
        <h3>Current Position:</h3>
        <p style={{ fontSize: "1.1rem" }}><strong>Latitude:</strong> {coords.lat}</p>
        <p style={{ fontSize: "1.1rem" }}><strong>Longitude:</strong> {coords.lng}</p>
      </div>

      <p style={{ fontWeight: "bold", fontSize: "1.1rem", color: status.includes("🟢") ? "green" : "orange" }}>
        {status}
      </p>

      <button 
        onClick={() => navigate("/")} 
        style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}
      >
        ⬅️ Back Home
      </button>
    </div>
  );
}