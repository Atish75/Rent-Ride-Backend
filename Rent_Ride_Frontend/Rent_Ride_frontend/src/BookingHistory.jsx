import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './config';

export default function BookingHistory({ endpoint, title }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .catch((err) => console.error("History fetch error:", err))
      .finally(() => setLoading(false));
  }, [endpoint]);

  if (loading) return (
    <div style={{ 
      backgroundColor: "#F8FAFC", 
      minHeight: "100vh", 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      color: "#64748B"
    }}>
      <p style={{ fontWeight: "300" }}>Loading history...</p>
    </div>
  );

  return (
    <div style={{ 
      backgroundColor: "#F8FAFC", 
      minHeight: "100vh", 
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif", 
      color: "#0F172A",
      WebkitFontSmoothing: "antialiased",
      padding: "2rem 1.5rem"
    }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "1.75rem" 
        }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "400", color: "#0F172A", letterSpacing: "-0.5px" }}>
            {title}
          </h2>
          <button 
            onClick={() => navigate(-1)} 
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
            ⬅️ Back
          </button>
        </div>

        {/* CONTENT STATES */}
        {history.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "3.5rem 2rem", 
            backgroundColor: "#FFFFFF", 
            borderRadius: "14px", 
            border: "1px solid #E2E8F0",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
          }}>
            <p style={{ margin: 0, color: "#64748B", fontWeight: "300", fontSize: "1rem" }}>
              No completed trips yet.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {history.map((item) => (
              <div 
                key={item.id} 
                style={{ 
                  backgroundColor: "#FFFFFF", 
                  border: "1px solid #E2E8F0", 
                  borderRadius: "12px", 
                  padding: "1.25rem", 
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <strong style={{ fontSize: "1.1rem", fontWeight: "400", color: "#0F172A" }}>
                      {item.car?.name}
                    </strong>
                    <span style={{ color: "#475569", fontWeight: "300", fontSize: "0.95rem" }}> — {item.customer_name}</span>
                  </div>
                  <span style={{ 
                    color: "#047857", 
                    backgroundColor: "#ECFDF5", 
                    border: "1px solid #A7F3D0",
                    padding: "0.2rem 0.6rem", 
                    borderRadius: "20px", 
                    fontSize: "0.8rem", 
                    fontWeight: "400" 
                  }}>
                    Completed ✅
                  </span>
                </div>

                <div style={{ color: "#64748B", fontSize: "0.9rem", fontWeight: "300" }}>
                  {item.start_date} → {item.end_date}
                </div>

                {item.start_point && item.end_point && (
                  <div style={{ color: "#334155", fontSize: "0.9rem", fontWeight: "300", marginTop: "0.15rem" }}>
                    🛣️ {item.start_point} → {item.end_point}
                  </div>
                )}

                <div style={{ marginTop: "0.25rem" }}>
                  <span style={{ color: "#047857", fontWeight: "500", fontSize: "1.1rem" }}>
                    ₹{item.total_price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}