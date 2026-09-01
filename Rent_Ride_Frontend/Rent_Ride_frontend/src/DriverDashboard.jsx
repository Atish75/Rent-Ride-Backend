import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './config';

export default function DriverDashboard() {
  const [available, setAvailable] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otpInputs, setOtpInputs] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const gpsIntervalsRef = useRef({}); // track active GPS intervals per carId

  const authHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };

  const fetchAll = async () => {
    try {
      const [availRes, mineRes] = await Promise.all([
        fetch(`${API_BASE_URL}/driver/available-bookings/`, { headers: authHeaders }),
        fetch(`${API_BASE_URL}/driver/my-bookings/`, { headers: authHeaders }),
      ]);

      if (availRes.status === 403 || mineRes.status === 403) {
        alert("You're not registered as a driver yet. Enable it from your Profile page.");
        navigate("/profile");
        return;
      }

      setAvailable(await availRes.json());
      setMyBookings(await mineRes.json());
    } catch (err) {
      console.error("Error loading driver data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const refresh = setInterval(fetchAll, 5000); // refresh available list every 5s
    return () => clearInterval(refresh);
  }, []);

  const handleAccept = async (bookingId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/driver/bookings/${bookingId}/accept/`, {
        method: "POST",
        headers: authHeaders,
      });
      const data = await res.json();
      if (res.ok) {
        alert("Booking accepted! Starting live location sharing.");
        fetchAll();
      } else {
        alert(data.error || "Could not accept booking.");
      }
    } catch (err) {
      console.error("Accept error:", err);
    }
  };

  const handleCancelAssignment = async (bookingId) => {
    if (!window.confirm("Cancel this ride? It will go back to the available pool for other drivers.")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/driver/bookings/${bookingId}/cancel/`, {
        method: "POST",
        headers: authHeaders,
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchAll();
      } else {
        alert(data.error || "Could not cancel.");
      }
    } catch (err) {
      console.error("Cancel error:", err);
    }
  };

  // Auto-start GPS broadcasting for every car this driver is assigned to
  useEffect(() => {
    myBookings.forEach((booking) => {
      const carId = booking.car.id;
      if (gpsIntervalsRef.current[carId]) return;

      const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
      const wsUrl = `${wsProtocol}://${API_BASE_URL.replace(/^https?:\/\//, '')}/ws/location/${carId}/`;
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        const sendLocation = () => {
          if (!navigator.geolocation) return;
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              socket.send(JSON.stringify({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
              }));
            },
            (err) => console.warn(`GPS error for car ${carId}:`, err.message),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 2000 }
          );
        };

        sendLocation();
        gpsIntervalsRef.current[carId] = { interval: setInterval(sendLocation, 4000), socket };
      };
    });

    return () => {
      Object.keys(gpsIntervalsRef.current).forEach((carId) => {
        const stillActive = myBookings.some((b) => String(b.car.id) === carId);
        if (!stillActive) {
          clearInterval(gpsIntervalsRef.current[carId].interval);
          gpsIntervalsRef.current[carId].socket.close();
          delete gpsIntervalsRef.current[carId];
        }
      });
    };
  }, [myBookings]);

  const handleCompleteTrip = async (bookingId) => {
    if (!window.confirm("Mark this trip as completed? Customer will be asked to pay.")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/driver/bookings/${bookingId}/complete/`, {
        method: "POST",
        headers: authHeaders,
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchAll();
      } else {
        alert(data.error || "Could not complete trip.");
      }
    } catch (err) {
      console.error("Complete trip error:", err);
    }
  };

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
      <p style={{ fontWeight: "300" }}>Loading driver dashboard...</p>
    </div>
  );


const handleStartRide = async (bookingId) => {
  const otp = otpInputs[bookingId];
  if (!otp) {
    alert("Please enter the OTP the customer gave you.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/driver/bookings/${bookingId}/start-ride/`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ otp })
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      fetchAll();
    } else {
      alert(data.error || "Could not start ride.");
    }
  } catch (err) {
    console.error("Start ride error:", err);
  }
};
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
        
        {/* HEADER & TOP BUTTONS */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "400", color: "#0F172A", letterSpacing: "-0.5px" }}>
             Driver Dashboard
          </h2>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button 
              onClick={() => navigate("/driver-history")} 
              style={topButtonStyle("#EEF2FF", "#3730A3", "1px solid #C7D2FE")}
            >
              📜 View Completed Rides
            </button>
            <button 
              onClick={() => navigate("/driver-earnings")} 
              style={topButtonStyle("#ECFDF5", "#047857", "1px solid #A7F3D0")}
            >
              💰 My Earnings
            </button>
          </div>
        </div>

        {/* SECTION 1: AVAILABLE BOOKINGS */}
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.2rem", fontWeight: "400", color: "#334155" }}>
           Available Bookings
        </h3>

        {available.length === 0 ? (
          <div style={{ 
            padding: "2rem", 
            backgroundColor: "#FFFFFF", 
            borderRadius: "12px", 
            border: "1px solid #E2E8F0", 
            textAlign: "center",
            marginBottom: "2.5rem"
          }}>
            <p style={{ color: "#64748B", margin: 0, fontWeight: "300", fontSize: "0.95rem" }}>
              No pending bookings right now.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "2.5rem" }}>
            {available.map((b) => (
              <div 
                key={b.id} 
                style={{ 
                  backgroundColor: "#FFFFFF", 
                  border: "1px solid #E2E8F0", 
                  borderRadius: "12px", 
                  padding: "1.25rem", 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
                }}
              >
                <div style={{ flex: 1, minWidth: "240px" }}>
                  <strong style={{ fontSize: "1.1rem", fontWeight: "400", color: "#0F172A" }}>
                    {b.car.name}
                  </strong> 
                  <span style={{ color: "#475569", fontWeight: "300", fontSize: "0.95rem" }}> — {b.customer_name}</span>
                  <br />

                  {b.trip_type === 'POINT_TO_POINT' ? (
                  <span style={{ color: "#475569", fontSize: "0.875rem", fontWeight: "300" }}>
                   One-way trip{b.distance_km && ` — ${b.distance_km} km`}
                  </span>
                  ) : (
                  <span style={{ color: "#64748B", fontSize: "0.875rem", fontWeight: "300" }}>
                    {b.start_date} → {b.end_date}
                  </span>
                  )}
                  <br />
                  {b.start_point && b.end_point && (
                  <span style={{ color: "#475569", fontSize: "0.875rem", fontWeight: "300" }}>
                  📍 {b.start_point} → {b.end_point}
                  </span>
                  )}

                  <br />
                  <span style={{ color: "#047857", fontWeight: "500", fontSize: "1rem", marginTop: "0.25rem", display: "inline-block" }}>
                     ₹{b.total_price}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => handleAccept(b.id)}
                    style={cardActionStyle("#ECFDF5", "#047857", "1px solid #A7F3D0")}
                  >
                    ✅ Accept
                  </button>
                  <button
                    onClick={() => handleCancelAssignment(b.id)}
                    style={cardActionStyle("#FEF2F2", "#991B1B", "1px solid #FCA5A5")}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECTION 2: MY ACTIVE RIDES */}
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.2rem", fontWeight: "400", color: "#334155" }}>
           My Active Rides (Sharing Live Location)
        </h3>

        {myBookings.length === 0 ? (
          <div style={{ 
            padding: "2rem", 
            backgroundColor: "#FFFFFF", 
            borderRadius: "12px", 
            border: "1px solid #E2E8F0", 
            textAlign: "center" 
          }}>
            <p style={{ color: "#64748B", margin: 0, fontWeight: "300", fontSize: "0.95rem" }}>
              No active rides yet.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {myBookings.map((b) => (
              <div 
                key={b.id} 
                style={{ 
                  backgroundColor: "#FFFFFF", 
                  border: "1px solid #BAE6FD", 
                  borderRadius: "12px", 
                  padding: "1.25rem", 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
                }}
              >
                <div style={{ flex: 1, minWidth: "240px" }}>
                  <strong style={{ fontSize: "1.1rem", fontWeight: "400", color: "#0F172A" }}>
                    {b.car.name}
                  </strong> 
                  <span style={{ color: "#475569", fontWeight: "300", fontSize: "0.95rem" }}> — {b.customer_name}</span><br />
                  
                  {b.trip_type === 'POINT_TO_POINT' ? (
                    <span style={{ color: "#475569", fontSize: "0.875rem", fontWeight: "300" }}>
                       One-way trip{b.distance_km && ` — ${b.distance_km} km`}
                    </span>
                  ) : (
                    <span style={{ color: "#475569", fontSize: "0.875rem", fontWeight: "300" }}>
                       {b.start_date} → {b.end_date}
                    </span>
                  )}
                  <br />
                  <span style={{ color: "#047857", fontWeight: "500", fontSize: "1rem" }}>
                    💰 ₹{b.total_price}
                  </span><br />
                  <span style={{ color: "#0284C7", fontWeight: "400", fontSize: "0.85rem", marginTop: "0.2rem", display: "inline-block" }}>
                    🟢 Broadcasting live location
                  </span>
                </div>
                    <span style={{ color: "#0284C7", fontWeight: "400", fontSize: "0.85rem", marginTop: "0.2rem", display: "inline-block" }}>
  {b.status === "ACTIVE" ? "⏳ Waiting for OTP to start ride" : "🟢 Ride in progress — Broadcasting live location"}
</span>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
  {b.status === "ACTIVE" ? (
    <>
      <input
        type="text"
        placeholder="Enter OTP"
        maxLength={4}
        value={otpInputs[b.id] || ''}
        onChange={(e) => setOtpInputs({ ...otpInputs, [b.id]: e.target.value })}
        style={{ padding: "0.45rem", borderRadius: "6px", border: "1px solid #CBD5E1", width: "100px" }}
      />
      <button
        onClick={() => handleStartRide(b.id)}
        style={cardActionStyle("#EFF6FF", "#1E40AF", "1px solid #BFDBFE")}
      >
        ▶️ Start Ride
      </button>
    </>
  ) : (
    <button
      onClick={() => handleCompleteTrip(b.id)}
      style={cardActionStyle("#EFF6FF", "#1E40AF", "1px solid #BFDBFE")}
    >
      🏁 Complete Trip
    </button>
  )}
                  <button
                    onClick={() => handleCancelAssignment(b.id)}
                    style={cardActionStyle("#FEF2F2", "#991B1B", "1px solid #FCA5A5")}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// Styling Helpers
const topButtonStyle = (bgColor, textColor, border = "none") => ({
  padding: "0.5rem 0.9rem",
  backgroundColor: bgColor,
  color: textColor,
  border: border,
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "0.85rem",
  fontWeight: "300",
  transition: "all 0.2s ease"
});

const cardActionStyle = (bgColor, textColor, border = "none") => ({
  padding: "0.45rem 0.85rem",
  backgroundColor: bgColor,
  color: textColor,
  border: border,
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "300",
  fontSize: "0.85rem",
  whiteSpace: "nowrap"
});