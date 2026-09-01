import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { API_BASE_URL } from './config';

// Default Marker Icon fix for Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Map view ko live coordinates par center karne ke liye
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export default function CarTracker() {
  const { carId } = useParams();
  const navigate = useNavigate();

  const [location, setLocation] = useState({ lat: 22.6139, lng: 88.2090, name: "Car Loading..." });
  const [loading, setLoading] = useState(true);

  // Live Location polling
  useEffect(() => {
    if (!carId) return;

    const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
    const wsUrl = `${wsProtocol}://${API_BASE_URL.replace(/^https?:\/\//, '')}/ws/location/${carId}/`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("Connected to live tracking");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLocation({
        lat: Number(data.latitude),
        lng: Number(data.longitude),
        name: data.name || "Tracked Car"
      });
      setLoading(false);
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => socket.close();
  }, [carId]);

  return (
    <div style={{ 
      backgroundColor: "#F8FAFC", 
      minHeight: "100vh", 
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif", 
      color: "#0F172A",
      WebkitFontSmoothing: "antialiased",
      padding: "2rem 1.5rem"
    }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        
        {/* HEADER AREA */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "400", color: "#0F172A", letterSpacing: "-0.5px" }}>
              📍 Live Tracking: {location.name}
            </h2>
            <p style={{ margin: "0.25rem 0 0 0", color: "#64748B", fontSize: "0.875rem", fontWeight: "300" }}>
              Lat: {location.lat.toFixed(4)} | Lng: {location.lng.toFixed(4)}
            </p>
          </div>

          <button 
            onClick={() => navigate("/booked-cars")}
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
            ⬅️ Back to Bookings
          </button>
        </div>

        {/* MAP CONTAINER CARD */}
        <div style={{ 
          backgroundColor: "#FFFFFF", 
          borderRadius: "14px", 
          border: "1px solid #E2E8F0", 
          padding: "1rem", 
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
        }}>
          {loading ? (
            <div style={{ padding: "3rem 1rem", textAlign: "center" }}>
              <p style={{ color: "#64748B", fontWeight: "300", margin: 0 }}>
                Fetching live GPS signal... 📡
              </p>
            </div>
          ) : (
            <div style={{ 
              height: "450px", 
              width: "100%", 
              borderRadius: "10px", 
              overflow: "hidden",
              border: "1px solid #E2E8F0"
            }}>
              <MapContainer 
                center={[location.lat, location.lng]} 
                zoom={14} 
                scrollWheelZoom={true} 
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <RecenterMap lat={location.lat} lng={location.lng} />

                <Marker position={[location.lat, location.lng]}>
                  <Popup>
                    🚗 <strong>{location.name}</strong> <br /> Live Position
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}