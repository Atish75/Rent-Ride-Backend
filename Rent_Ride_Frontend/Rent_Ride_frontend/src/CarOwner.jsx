import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OwnerDashboard() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetch("http://127.0.0.1:8000/owner/my-cars/", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setCars(data))
      .catch((err) => console.error("Owner cars fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ textAlign: "center", marginTop: "3rem" }}>Loading your cars...</p>;
const handleToggleAvailability = async (carId) => {
  try {
    const res = await fetch(`http://127.0.0.1:8000/owner/cars/${carId}/toggle-availability/`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      setCars(cars.map(c => c.id === carId ? { ...c, available: data.available } : c));
    } else {
      alert(data.error || "Could not update availability.");
    }
  } catch (err) {
    console.error("Toggle availability error:", err);
  }
};
const handleDeleteCar = async (carId) => {
  if (!window.confirm("Delete this car permanently? This can't be undone.")) return;

  try {
    const res = await fetch(`http://127.0.0.1:8000/cars/${carId}/`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (res.status === 204) {
      alert("Car deleted successfully.");
      setCars(cars.filter(c => c.id !== carId));
    } else {
      const data = await res.json();
      alert(data.error || "Could not delete car.");
    }
  } catch (err) {
    console.error("Delete car error:", err);
  }
};
  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h2>🚙 My Cars (Owner Dashboard)</h2>
        <button onClick={() => navigate("/owner-history")} style={{ marginBottom: "1rem", padding: "0.5rem 1rem", backgroundColor: "#6f42c1", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
        📜 View Rental History
        </button>
        <button onClick={() => navigate("/owner-earnings")} style={{ marginBottom: "1rem", marginLeft: "0.5rem", padding: "0.5rem 1rem", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
        💰 My Earnings
        </button>
      {cars.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", border: "1px dashed #ccc", borderRadius: "10px" }}>
          <p>You haven't added any cars yet.</p>
          <button
            onClick={() => navigate("/add-cars")}
            style={{ padding: "0.6rem 1.2rem", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            ➕ Add a Car
          </button>
        </div>
      ) : (
        cars.map((car) => (
          <div key={car.id} style={{ border: "1px solid #ddd", borderRadius: "10px", padding: "1.2rem", marginBottom: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
           {car.image && (
      <img
        src={car.image.startsWith("http") ? car.image : `http://127.0.0.1:8000${car.image}`}
        alt={car.name}
        style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "8px", marginBottom: "0.8rem" }}
      />
    )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>{car.brand} {car.name}</h3>
              <span style={{
                padding: "0.2rem 0.7rem",
                borderRadius: "12px",
                fontSize: "0.85rem",
                fontWeight: "bold",
                backgroundColor: car.booking ? "#fff3cd" : "#d4edda",
                color: car.booking ? "#856404" : "#155724"
              }}>
                {car.booking ? "Currently Rented" : "Available"}
              </span>
            </div>
              
            <p style={{ color: "#666", margin: "0.3rem 0" }}>₹{car.price_per_day}/day</p>
            {!car.booking && (
  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem" }}>
    <button
      onClick={() => handleToggleAvailability(car.id)}
      style={{
        padding: "0.4rem 0.8rem",
        backgroundColor: car.available ? "#dc3545" : "#28a745",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "0.85rem"
      }}
    >
      {car.available ? "🚫 Mark Unavailable" : "✅ Mark Available"}
    </button>

    <button
      onClick={() => handleDeleteCar(car.id)}
      style={{
        padding: "0.4rem 0.8rem",
        backgroundColor: "#6c757d",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "0.85rem"
      }}
    >
      🗑️ Delete Car
    </button>
  </div>
)}
            {car.booking ? (
              <div style={{ marginTop: "0.8rem", padding: "0.8rem", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                <p style={{ margin: "0.2rem 0" }}>👤 <strong>Booked by:</strong> {car.booking.customer_name}</p>
                <p style={{ margin: "0.2rem 0" }}>📧 <strong>Contact:</strong> {car.booking.customer_email || 'N/A'}</p>
                {car.booking.start_point && car.booking.end_point && (
                <p style={{ margin: "0.2rem 0" }}>🛣️ <strong>Route:</strong> {car.booking.start_point} → {car.booking.end_point}</p> )}
                <p style={{ margin: "0.2rem 0" }}>📅 <strong>Dates:</strong> {car.booking.start_date} → {car.booking.end_date}</p>
                <p style={{ margin: "0.2rem 0" }}>💰 <strong>Trip Price:</strong> ₹{car.booking.total_price}</p>
                <p style={{ margin: "0.2rem 0" }}>
                  🚕 <strong>Driver:</strong> {car.booking.driver_username || <span style={{ color: "#dc3545" }}>Not assigned yet</span>}
                </p>
                <p style={{ margin: "0.2rem 0" }}>📊 <strong>Status:</strong> {car.booking.status}</p>

                <button
                  onClick={() => navigate(`/track/${car.id}`)}
                  style={{ marginTop: "0.6rem", padding: "0.5rem 1rem", backgroundColor: "#17a2b8", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                >
                  📍 View Live Location
                </button>
              </div>
            ) : (
              <p style={{ color: "#888", marginTop: "0.5rem" }}>No active booking right now.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}