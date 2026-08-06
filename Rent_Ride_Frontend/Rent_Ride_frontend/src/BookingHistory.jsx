import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BookingHistory({ endpoint, title }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetch(`http://127.0.0.1:8000${endpoint}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .catch((err) => console.error("History fetch error:", err))
      .finally(() => setLoading(false));
  }, [endpoint]);

  if (loading) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading history...</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2>{title}</h2>
        <button onClick={() => navigate(-1)} style={{ padding: "0.5rem 1rem", backgroundColor: "#6c757d", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
          ⬅️ Back
        </button>
      </div>

      {history.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888" }}>No completed trips yet.</p>
      ) : (
        history.map((item) => (
          <div key={item.id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", marginBottom: "0.8rem" }}>
            <strong>{item.car?.name}</strong> — {item.customer_name}<br />
            <span style={{ color: "#666", fontSize: "0.9rem" }}>{item.start_date} → {item.end_date}</span><br />
            {item.start_point && item.end_point && (
              <span style={{ color: "#495057", fontSize: "0.9rem" }}>
                🛣️ {item.start_point} → {item.end_point}
              </span>
            )}
            <br />
            <span style={{ color: "#28a745", fontWeight: "bold" }}>₹{item.total_price}</span>{' '}
            <span style={{ color: "#155724", backgroundColor: "#d4edda", padding: "0.1rem 0.5rem", borderRadius: "10px", fontSize: "0.8rem", fontWeight: "bold" }}>
              Completed ✅
            </span>
          </div>
        ))
      )}
    </div>
  );
}