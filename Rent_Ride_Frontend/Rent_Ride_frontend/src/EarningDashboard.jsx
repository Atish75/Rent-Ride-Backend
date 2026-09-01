import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './config';

export default function EarningsDashboard({ endpoint, title, sharePercent }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error("Earnings fetch error:", err))
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
      <p style={{ fontWeight: "300" }}>Loading earnings...</p>
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
      <div style={{ maxWidth: "850px", margin: "0 auto" }}>
        
        {/* HEADER & BACK BUTTON */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "2rem" 
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

        {/* SUMMARY CARDS */}
        <div style={{ display: "flex", gap: "1.25rem", marginBottom: "2.5rem", flexWrap: "wrap" }}>
          
          {/* TOTAL EARNINGS CARD */}
          <div style={{ 
            flex: 1, 
            minWidth: "220px", 
            backgroundColor: "#ECFDF5", 
            color: "#047857", 
            border: "1px solid #A7F3D0",
            padding: "1.5rem", 
            borderRadius: "12px", 
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)"
          }}>
            <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: "300", color: "#065F46" }}>Total Earnings</p>
            <h1 style={{ margin: "0.3rem 0", fontSize: "2.2rem", fontWeight: "500", color: "#047857" }}>
              ₹{data?.total_earnings}
            </h1>
            <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: "300", color: "#065F46" }}>
              Your share: {sharePercent}%
            </p>
          </div>

          {/* COMPLETED TRIPS CARD */}
          <div style={{ 
            flex: 1, 
            minWidth: "220px", 
            backgroundColor: "#EFF6FF", 
            color: "#1E40AF", 
            border: "1px solid #BFDBFE",
            padding: "1.5rem", 
            borderRadius: "12px", 
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)"
          }}>
            <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: "300", color: "#1E3A8A" }}>Completed Trips</p>
            <h1 style={{ margin: "0.3rem 0", fontSize: "2.2rem", fontWeight: "500", color: "#1E40AF" }}>
              {data?.total_trips}
            </h1>
          </div>

        </div>

        {/* TRIP-BY-TRIP BREAKDOWN */}
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.2rem", fontWeight: "400", color: "#334155" }}>
          Trip Breakdown
        </h3>

        {data?.trips?.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "3rem", 
            backgroundColor: "#FFFFFF", 
            borderRadius: "12px", 
            border: "1px solid #E2E8F0" 
          }}>
            <p style={{ color: "#64748B", fontWeight: "300", margin: 0 }}>No completed trips yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {data.trips.map((t) => (
              <div 
                key={t.booking_id} 
                style={{ 
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0", 
                  borderRadius: "12px", 
                  padding: "1.15rem", 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  flexWrap: "wrap",
                  gap: "0.75rem"
                }}
              >
                <div>
                  <strong style={{ fontSize: "1.05rem", fontWeight: "400", color: "#0F172A" }}>
                    {t.car_name}
                  </strong> 
                  <span style={{ color: "#475569", fontWeight: "300", fontSize: "0.95rem" }}> — {t.customer_name}</span>
                  <br />
                  <span style={{ color: "#64748B", fontSize: "0.85rem", fontWeight: "300" }}>{t.date}</span>
                </div>

                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, color: "#64748B", fontSize: "0.85rem", fontWeight: "300" }}>
                    Trip: ₹{t.trip_price}
                  </p>
                  <p style={{ margin: "0.1rem 0 0 0", color: "#047857", fontWeight: "500", fontSize: "1rem" }}>
                    You earned: ₹{t.your_earning}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}