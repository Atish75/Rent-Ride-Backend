import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // 👈 1. useParams aur useNavigate import karein
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

//  Map view ko live coordinates par center karne ke liye
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export default function CarTracker() {
  const { carId } = useParams(); //  URL se carId extract karein
  const navigate = useNavigate();

  const [location, setLocation] = useState({ lat: 22.6139, lng: 88.2090, name: "Car Loading..." });
  const [loading, setLoading] = useState(true);

  // Live Location polling (Har 3 seconds me position fetch karega)
  useEffect(() => {
    if (!carId) return;

    const fetchLocation = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/cars/${carId}/location/`);
        if (res.ok) {
          const data = await res.json();
          setLocation({
            lat: Number(data.latitude),
            lng: Number(data.longitude),
            name: data.name || "Tracked Car"
          });
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching live location:", err);
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 3000); // ⏱️ Har 3 sec me auto-refresh

    return () => clearInterval(interval);
  }, [carId]);

  return (
    <div style={{ padding: "1rem", maxWidth: "100%", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      
      {/* ⬅️ Back Button */}
      <button 
        onClick={() => navigate("/booked-cars")}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#6c757d",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "1rem"
        }}
      >
        ⬅️ Back to Bookings
      </button>

      <h2 style={{ textAlign: "center" }}>📍 Live Tracking: {location.name}</h2>
      <p style={{ textAlign: "center", color: "#666" }}>
        Lat: {location.lat.toFixed(4)} | Lng: {location.lng.toFixed(4)}
      </p>

      {/* 🗺️ MAP DISPLAY */}
      {loading ? (
        <p style={{ textAlign: "center", marginTop: "2rem" }}>Fetching live GPS signal... 📡</p>
      ) : (
        <div style={{ height: "400px", width: "160%", borderRadius: "12px",  boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
          <MapContainer 
            center={[location.lat, location.lng]} 
            zoom={14} 
            scrollWheelZoom={true} 
            style={{ height: "150%", width: "200%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/*  Auto-recenter map view whenever lat/lng changes */}
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
  );
}