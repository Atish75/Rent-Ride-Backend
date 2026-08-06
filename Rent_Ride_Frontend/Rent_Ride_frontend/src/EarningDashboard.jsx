import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EarningsDashboard({ endpoint, title, sharePercent }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetch(`http://127.0.0.1:8000${endpoint}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error("Earnings fetch error:", err))
      .finally(() => setLoading(false));
  }, [endpoint]);

  if (loading) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading earnings...</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2>{title}</h2>
        <button onClick={() => navigate(-1)} style={{ padding: "0.5rem 1rem", backgroundColor: "#6c757d", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
          ⬅️ Back
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "200px", backgroundColor: "#28a745", color: "#fff", padding: "1.5rem", borderRadius: "10px", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>Total Earnings</p>
          <h1 style={{ margin: "0.3rem 0" }}>₹{data?.total_earnings}</h1>
          <p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.9 }}>Your share: {sharePercent}%</p>
        </div>
        <div style={{ flex: 1, minWidth: "200px", backgroundColor: "#007bff", color: "#fff", padding: "1.5rem", borderRadius: "10px", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>Completed Trips</p>
          <h1 style={{ margin: "0.3rem 0" }}>{data?.total_trips}</h1>
        </div>
      </div>

      {/* Trip-by-trip breakdown */}
      <h3>Trip Breakdown</h3>
      {data?.trips?.length === 0 ? (
        <p style={{ color: "#888" }}>No completed trips yet.</p>
      ) : (
        data.trips.map((t) => (
          <div key={t.booking_id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", marginBottom: "0.7rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{t.car_name}</strong> — {t.customer_name}<br />
              <span style={{ color: "#888", fontSize: "0.85rem" }}>{t.date}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, color: "#666", fontSize: "0.85rem" }}>Trip: ₹{t.trip_price}</p>
              <p style={{ margin: 0, color: "#28a745", fontWeight: "bold" }}>You earned: ₹{t.your_earning}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}