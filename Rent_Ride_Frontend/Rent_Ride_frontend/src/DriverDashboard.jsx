import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DriverDashboard() {
  const [available, setAvailable] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
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
        fetch("http://127.0.0.1:8000/driver/available-bookings/", { headers: authHeaders }),
        fetch("http://127.0.0.1:8000/driver/my-bookings/", { headers: authHeaders }),
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
      const res = await fetch(`http://127.0.0.1:8000/driver/bookings/${bookingId}/accept/`, {
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
    const res = await fetch(`http://127.0.0.1:8000/driver/bookings/${bookingId}/cancel/`, {
      method: "POST",
      headers: authHeaders,
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      fetchAll(); // refresh both lists — moves it back to Available Bookings
    } else {
      alert(data.error || "Could not cancel.");
    }
  } catch (err) {
    console.error("Cancel error:", err);
  }
};

  //  Auto-start GPS broadcasting for every car this driver is assigned to
  useEffect(() => {
    myBookings.forEach((booking) => {
      const carId = booking.car.id;
      if (gpsIntervalsRef.current[carId]) return; // already broadcasting for this car

      const sendLocation = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
              await fetch(`http://127.0.0.1:8000/cars/${carId}/location/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ latitude, longitude }),
              });
            } catch (err) {
              console.error(`Failed to send location for car ${carId}:`, err);
            }
          },
          (err) => console.warn(`GPS error for car ${carId}:`, err.message),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 2000 }
        );
      };

      sendLocation(); // send immediately
      gpsIntervalsRef.current[carId] = setInterval(sendLocation, 4000);
    });

    // cleanup: stop broadcasting for cars no longer in myBookings
    return () => {
      Object.keys(gpsIntervalsRef.current).forEach((carId) => {
        const stillActive = myBookings.some((b) => String(b.car.id) === carId);
        if (!stillActive) {
          clearInterval(gpsIntervalsRef.current[carId]);
          delete gpsIntervalsRef.current[carId];
        }
      });
    };
  }, [myBookings]);

  if (loading) return <p style={{ textAlign: "center", marginTop: "3rem" }}>Loading driver dashboard...</p>;
const handleCompleteTrip = async (bookingId) => {
  if (!window.confirm("Mark this trip as completed? Customer will be asked to pay.")) return;

  try {
    const res = await fetch(`http://127.0.0.1:8000/driver/bookings/${bookingId}/complete/`, {
      method: "POST",
      headers: authHeaders,
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      fetchAll(); // this booking will now drop out of myBookings once status != BOOKED/ACTIVE, GPS auto-stops
    } else {
      alert(data.error || "Could not complete trip.");
    }
  } catch (err) {
    console.error("Complete trip error:", err);
  }
};
  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h2>🚕 Driver Dashboard</h2>
        <button onClick={() => navigate("/driver-history")} style={{ marginBottom: "1rem", padding: "0.5rem 1rem", backgroundColor: "#6f42c1", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
          📜 View Completed Rides
        </button>
        <button onClick={() => navigate("/driver-earnings")} style={{ marginBottom: "1rem", marginLeft: "0.5rem", padding: "0.5rem 1rem", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
        💰 My Earnings
        </button>
      <h3 style={{ marginTop: "2rem" }}>📋 Available Bookings</h3>
      {available.length === 0 ? (
        <p style={{ color: "#888" }}>No pending bookings right now.</p>
      ) : (
        available.map((b) => (
          <div key={b.id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", marginBottom: "0.8rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
                <strong>{b.car.name}</strong> — {b.customer_name}<br />
                  <span style={{ color: "#666", fontSize: "0.9rem" }}>{b.start_date} → {b.end_date}</span><br />
                  {b.start_point && b.end_point && (
                  <span style={{ color: "#495057", fontSize: "0.9rem" }}>
                 <strong>{b.start_point}</strong> → <strong>{b.end_point}</strong>
                  </span>)}
                 <span style={{ color: "#28a745", fontWeight: "bold" }}> - ₹{b.total_price}</span>
            </div>
            <button
              onClick={() => handleAccept(b.id)}
              style={{ padding: "0.5rem 1rem", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
            >
              ✅ Accept
            </button>
            <button
        onClick={() => handleCancelAssignment(b.id)}
        style={{ padding: "0.5rem 1rem", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
      >
        ❌ Cancel
      </button>
          </div>
        ))
      )}

      <h3 style={{ marginTop: "2rem" }}>🚗 My Active Rides (Sharing Live Location)</h3>
      {myBookings.length === 0 ? (
  <p style={{ color: "#888" }}>No active rides yet.</p>
) : (
  myBookings.map((b) => (
    <div key={b.id} style={{ border: "1px solid #17a2b8", borderRadius: "8px", padding: "1rem", marginBottom: "0.8rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <strong>{b.car.name}</strong> — {b.customer_name}<br />
        <span style={{ color: "#17a2b8", fontWeight: "bold" }}>🟢 Broadcasting live location</span>
      </div>
      <button
    onClick={() => handleCompleteTrip(b.id)}
    style={{ padding: "0.5rem 1rem", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
  >
    🏁 Complete Trip
  </button>
      <button
        onClick={() => handleCancelAssignment(b.id)}
        style={{ padding: "0.5rem 1rem", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
      >
        ❌ Cancel
      </button>
    </div>
  ))
)}
    </div>
  );
}