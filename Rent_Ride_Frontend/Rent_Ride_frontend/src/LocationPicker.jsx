import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function LocationPicker({ label, onSelect }) {
  const [position, setPosition] = useState(null);
  const [placeName, setPlaceName] = useState('');
  const [loadingName, setLoadingName] = useState(false);

  const reverseGeocode = async (lat, lng) => {
    setLoadingName(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      const name = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setPlaceName(name);
      onSelect(lat, lng, name);
    } catch (err) {
      console.error("Reverse geocode failed:", err);
      const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setPlaceName(fallback);
      onSelect(lat, lng, fallback);
    } finally {
      setLoadingName(false);
    }
  };

  const handlePick = (lat, lng) => {
    setPosition({ lat, lng });
    reverseGeocode(lat, lng);
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "bold" }}>{label}</label>
      <div style={{ height: "200px", borderRadius: "8px", overflow: "hidden" }}>
        <MapContainer center={[22.6139, 88.2090]} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
          <ClickHandler onPick={handlePick} />
          {position && <Marker position={[position.lat, position.lng]} />}
        </MapContainer>
      </div>
      {loadingName && <p style={{ fontSize: "0.8rem", color: "#888", margin: "0.3rem 0 0 0" }}>Looking up place name...</p>}
      {placeName && !loadingName && (
        <p style={{ fontSize: "0.85rem", color: "#333", margin: "0.3rem 0 0 0", fontWeight: "500" }}>
          📍 {placeName}
        </p>
      )}
    </div>
  );
}