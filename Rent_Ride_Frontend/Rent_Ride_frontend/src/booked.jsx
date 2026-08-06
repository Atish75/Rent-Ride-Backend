import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentModal from './PaymentModal';

export default function BookedCars() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingBooking, setPayingBooking] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    fetch("http://127.0.0.1:8000/booked-cars/", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => {
        if (res.status === 401) {
          alert("Session expired. Pehle login karein!");
          navigate("/login");
          return [];
        }
        return res.json();
      })
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setLoading(false);
      });
  }, [navigate]);

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const diff = new Date(end) - new Date(start);
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Kya aap sach me ye booking cancel/remove karna chahte hain?")) return;
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(`http://127.0.0.1:8000/booked-cars/${bookingId}/`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        alert("Booking cancel ho gayi hai!");
        setBookings(bookings.filter((item) => item.id !== bookingId));
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Booking cancel nahi ho paayi.");
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("Network error. Kripya firse try karein.");
    }
  };
const handleConfirmTrip = async (bookingId, confirmed) => {
  const token = localStorage.getItem('access_token');
  try {
    const res = await fetch(`http://127.0.0.1:8000/booked-cars/${bookingId}/confirm-trip/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ confirmed })
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      setBookings(bookings.map(b =>
        b.id === bookingId ? { ...b, status: confirmed ? "PENDING_PAYMENT" : "ACTIVE" } : b
      ));
    } else {
      alert(data.error || "Could not update trip status.");
    }
  } catch (err) {
    console.error("Confirm trip error:", err);
  }
};

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: "900px", margin: "0 auto" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h2>📋 My Bookings History</h2>
        <button onClick={() => navigate("/")} style={{ padding: "0.5rem 1rem", backgroundColor: "#6c757d", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
          ⬅️ Back to Home
        </button>
        <button onClick={() => navigate("/booking-history")} style={{ padding: "0.5rem 1rem", backgroundColor: "#6f42c1", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
          📜 View History
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading your bookings...</p>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", border: "1px dashed #ccc", borderRadius: "10px" }}>
          <h3>Aapne abhi tak koi car book nahi ki hai 🚗</h3>
          <button onClick={() => navigate("/")} style={{ marginTop: "1rem", padding: "0.6rem 1.2rem", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Explore Cars Now
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {bookings.map((item) => {
            const days = calculateDays(item.start_date, item.end_date);
            return (
              <div key={item.id} style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", border: "1px solid #e0e0e0", borderRadius: "12px", padding: "1.2rem", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", backgroundColor: "#fff", alignItems: "center" }}>

                {item.car?.image && (
                  <img src={item.car.image.startsWith("http") ? item.car.image : `http://127.0.0.1:8000${item.car.image}`} alt={item.car.name} style={{ width: "150px", height: "100px", objectFit: "cover", borderRadius: "8px" }} />
                )}

                <div style={{ flex: 1, minWidth: "220px" }}>
                  <h3 style={{ margin: "0 0 0.5rem 0", color: "#333" }}>{item.car?.name}</h3>
                  <p style={{ margin: "0.3rem 0", color: "#666", fontSize: "0.95rem" }}>👤 <strong>Customer:</strong> {item.customer_name}</p>
                  {item.start_point && item.end_point && (
                  <p style={{ margin: "0.3rem 0", color: "#666", fontSize: "0.95rem" }}>
                  <strong>Route:</strong> {item.start_point} → {item.end_point}</p>)}
                  <p style={{ margin: "0.3rem 0", color: "#666", fontSize: "0.95rem" }}>📅 <strong>Dates:</strong> {item.start_date} ➔ {item.end_date}</p>
                  <p style={{ margin: "0.3rem 0", color: "#666", fontSize: "0.95rem" }}>⏳ <strong>Duration:</strong> {days} {days === 1 ? 'Day' : 'Days'}</p>
                  <p style={{ margin: "0.3rem 0" }}>
                    <span style={{ display: "inline-block", padding: "0.2rem 0.6rem", backgroundColor: item.driver ? "#e3f2fd" : "#fff3cd", color: item.driver ? "#1565c0" : "#856404", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold" }}>
                      {item.driver ? `🚕 Driver Assigned: ${item.driver_username || 'Yes'}` : '⏳ Waiting for driver'}
                    </span>
                  </p>
                  {item.status === "AWAITING_CONFIRMATION" && (
                  <div style={{ marginTop: "0.8rem", padding: "0.8rem", backgroundColor: "#fff3cd", border: "1px solid #ffc107", borderRadius: "8px" }}>
                  <p style={{ margin: "0 0 0.6rem 0", fontWeight: "bold", color: "#856404" }}>
                  🏁 Your driver marked this trip as complete. Is that correct?
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                  onClick={() => handleConfirmTrip(item.id, true)}
                  style={{ flex: 1, padding: "0.5rem", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                  >
                 ✅ Yes, trip is complete
                  </button>
                <button
                onClick={() => handleConfirmTrip(item.id, false)}
                  style={{ flex: 1, padding: "0.5rem", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                >
                ❌ No, still ongoing
                </button>
                </div>
                  </div>
                )}
                </div>

                <div style={{ textAlign: "right", borderLeft: "1px solid #eee", paddingLeft: "1.5rem", minWidth: "150px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.85rem", color: "#888" }}>Rate: ₹{item.car?.price_per_day}/day</span>
                <h2 style={{ margin: "0", color: "#28a745" }}>₹{item.total_price}</h2>

               {/* 👇 THIS badge goes right here */}
              <span style={{
              display: "inline-block", padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold",
              backgroundColor: item.status === "COMPLETED" ? "#d4edda" : item.status === "PENDING_PAYMENT" ? "#fff3cd" : item.status === "AWAITING_CONFIRMATION" ? "#ffe5b4" : "#e8f5e9",
              color: item.status === "COMPLETED" ? "#155724" : item.status === "PENDING_PAYMENT" ? "#856404" : item.status === "AWAITING_CONFIRMATION" ? "#854d0e" : "#2e7d32"
               }}>
              {item.status === "COMPLETED" ? "Completed ✅"
              : item.status === "PENDING_PAYMENT" ? "Awaiting Payment 💳"
              : item.status === "AWAITING_CONFIRMATION" ? "Confirm Trip 🏁"
              : "Confirmed ✅"}
              </span>

                  {item.status === "PENDING_PAYMENT" && (
                    <button onClick={() => setPayingBooking(item)} style={{ marginTop: "0.5rem", padding: "0.4rem 0.8rem", backgroundColor: "#ffc107", color: "#000", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                      💳 Pay Now
                    </button>
                  )}

                  <button onClick={() => navigate(`/track/${item.car.id}`)} style={{ marginTop: "0.5rem", padding: "0.4rem 0.8rem", backgroundColor: "#17a2b8", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                    📍 Track Live
                  </button>

                  {(item.status === "BOOKED" || item.status === "ACTIVE") && (
                  <button
                  onClick={() => handleCancelBooking(item.id)}
                  style={{
                  marginTop: "0.5rem",
                  padding: "0.4rem 0.8rem",
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: "bold"
                  }}
                  >
                 Cancel Booking
              </button>
                )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {payingBooking && (
        <PaymentModal
          booking={payingBooking}
          onClose={() => setPayingBooking(null)}
          onConfirm={() => {
            setPayingBooking(null);
            setBookings(bookings.map(b => b.id === payingBooking.id ? { ...b, status: "COMPLETED" } : b));
          }}
        />
      )}

    </div>
  );
}