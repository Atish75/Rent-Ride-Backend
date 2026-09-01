import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentModal from './PaymentModal';
import { API_BASE_URL } from './config';

export default function BookedCars() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingBooking, setPayingBooking] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    fetch(`${API_BASE_URL}/booked-cars/`, {
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
    if (!window.confirm("Do you really want to delete/remove booking?")) return;
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(`${API_BASE_URL}/booked-cars/${bookingId}/`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        alert("Booking canceled!");
        setBookings(bookings.filter((item) => item.id !== bookingId));
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Booking not canceled !");
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("Network error. Try again.");
    }
  };

  const handleConfirmTrip = async (bookingId, confirmed) => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_BASE_URL}/booked-cars/${bookingId}/confirm-trip/`, {
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
    <div style={{ 
      backgroundColor: "#F8FAFC", 
      minHeight: "100vh", 
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif", 
      color: "#0F172A",
      WebkitFontSmoothing: "antialiased",
      padding: "2rem 1.5rem"
    }}>

      <div style={{ maxWidth: "950px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "400", color: "#0F172A", letterSpacing: "-0.5px" }}>
            📋 My Bookings History
          </h2>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button 
              onClick={() => navigate("/")} 
              style={actionButtonStyle("#F1F5F9", "#334155", "1px solid #CBD5E1")}
            >
              ⬅️ Back to Home
            </button>
            <button 
              onClick={() => navigate("/booking-history")} 
              style={actionButtonStyle("#EEF2FF", "#3730A3", "1px solid #C7D2FE")}
            >
              📜 View History
            </button>
          </div>
        </div>

        {/* CONTENT STATES */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <p style={{ color: "#64748B", fontSize: "1rem", fontWeight: "300" }}>Loading your bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "3.5rem 2rem", 
            backgroundColor: "#FFFFFF", 
            borderRadius: "14px", 
            border: "1px solid #E2E8F0",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
          }}>
            <h3 style={{ fontWeight: "300", color: "#0F172A", margin: "0 0 1rem 0" }}>
              Right now! You haven't booked any Car
            </h3>
            <button 
              onClick={() => navigate("/")} 
              style={actionButtonStyle("#2563EB", "#FFFFFF")}
            >
              Explore Cars Now
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {bookings.map((item) => {
              const days = calculateDays(item.start_date, item.end_date);
              return (
                <div 
                  key={item.id} 
                  style={{ 
                    display: "flex", 
                    flexWrap: "wrap", 
                    gap: "1.5rem", 
                    border: "1px solid #E2E8F0", 
                    borderRadius: "14px", 
                    padding: "1.25rem", 
                    backgroundColor: "#FFFFFF", 
                    alignItems: "center",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)"
                  }}
                >
                  {/* CAR IMAGE */}
                  {item.car?.image && (
                    <img 
                      src={item.car.image.startsWith("http") ? item.car.image : `${API_BASE_URL}${item.car.image}`} 
                      alt={item.car.name} 
                      style={{ width: "160px", height: "105px", objectFit: "cover", borderRadius: "10px", backgroundColor: "#F8FAFC" }} 
                    />
                  )}

                  {/* DETAILS */}
                  <div style={{ flex: 1, minWidth: "240px" }}>
                    <h3 style={{ margin: "0 0 0.5rem 0", color: "#0F172A", fontSize: "1.2rem", fontWeight: "400" }}>
                      {item.car?.name}
                    </h3>
                    <p style={{ margin: "0.25rem 0", color: "#475569", fontSize: "0.9rem", fontWeight: "300" }}>
                      👤 <strong>Customer:</strong> {item.customer_name}
                    </p>
                    {item.start_point && item.end_point && (
                      <p style={{ margin: "0.25rem 0", color: "#475569", fontSize: "0.9rem", fontWeight: "300" }}>
                        <strong>Route:</strong> {item.start_point} → {item.end_point}
                      </p>
                    )}
                    <p style={{ margin: "0.25rem 0", color: "#475569", fontSize: "0.9rem", fontWeight: "300" }}>
                       <strong>Dates:</strong> {item.start_date} ➔ {item.end_date}
                    </p>
                    <p style={{ margin: "0.25rem 0", color: "#475569", fontSize: "0.9rem", fontWeight: "300" }}>
                       <strong>Duration:</strong> {days} {days === 1 ? 'Day' : 'Days'}
                    </p>
                    <p style={{ margin: "0.5rem 0 0 0" }}>
                      <span style={{ 
                        display: "inline-block", 
                        padding: "0.25rem 0.65rem", 
                        backgroundColor: item.driver ? "#EFF6FF" : "#FEF3C7", 
                        color: item.driver ? "#1E40AF" : "#92400E", 
                        border: item.driver ? "1px solid #BFDBFE" : "1px solid #FDE68A",
                        borderRadius: "20px", 
                        fontSize: "0.8rem", 
                        fontWeight: "400" 
                      }}>
                        {item.driver ? ` Driver Assigned: ${item.driver_username || 'Yes'}` : ' Waiting for driver'}
                      </span>
                    </p>
                        {item.driver && item.status === "ACTIVE" && item.otp && (
  <p style={{ margin: "0.3rem 0", padding: "0.5rem", backgroundColor: "#FEF3C7", borderRadius: "6px", fontWeight: "bold", color: "#92400E" }}>
    🔑 Share this OTP with your driver: <strong>{item.otp}</strong>
  </p>
)}
                    {item.status === "AWAITING_CONFIRMATION" && (
                      <div style={{ marginTop: "1rem", padding: "0.85rem", backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "8px" }}>
                        <p style={{ margin: "0 0 0.6rem 0", fontWeight: "400", color: "#92400E", fontSize: "0.875rem" }}>
                           Your driver marked this trip as complete. Is that correct?
                        </p>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            onClick={() => handleConfirmTrip(item.id, true)}
                            style={{ flex: 1, padding: "0.45rem", backgroundColor: "#047857", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "300", fontSize: "0.85rem" }}
                          >
                            ✅ Yes, trip is complete
                          </button>
                          <button
                            onClick={() => handleConfirmTrip(item.id, false)}
                            style={{ flex: 1, padding: "0.45rem", backgroundColor: "#B91C1C", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "300", fontSize: "0.85rem" }}
                          >
                            ❌ No, still ongoing
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PRICE AND STATUS */}
                  <div style={{ 
                    textAlign: "right", 
                    borderLeft: "1px solid #E2E8F0", 
                    paddingLeft: "1.25rem", 
                    minWidth: "160px", 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "flex-end", 
                    gap: "0.4rem" 
                  }}>
                    <span style={{ fontSize: "0.85rem", color: "#64748B", fontWeight: "300" }}>
                      Rate: ₹{item.car?.price_per_day}/day
                    </span>
                    <h2 style={{ margin: "0", color: "#047857", fontSize: "1.4rem", fontWeight: "500" }}>
                      ₹{item.total_price}
                    </h2>

                    <span style={{
                      display: "inline-block", 
                      padding: "0.25rem 0.65rem", 
                      borderRadius: "20px", 
                      fontSize: "0.8rem", 
                      fontWeight: "400",
                      backgroundColor: item.status === "COMPLETED" ? "#ECFDF5" : item.status === "PENDING_PAYMENT" ? "#FFFBEB" : item.status === "AWAITING_CONFIRMATION" ? "#FEF3C7" : "#ECFDF5",
                      color: item.status === "COMPLETED" ? "#047857" : item.status === "PENDING_PAYMENT" ? "#B45309" : item.status === "AWAITING_CONFIRMATION" ? "#92400E" : "#047857",
                      border: item.status === "COMPLETED" ? "1px solid #A7F3D0" : item.status === "PENDING_PAYMENT" ? "1px solid #FDE68A" : item.status === "AWAITING_CONFIRMATION" ? "1px solid #FDE68A" : "1px solid #A7F3D0"
                    }}>
                      {item.status === "COMPLETED" ? "Completed ✅"
                      : item.status === "PENDING_PAYMENT" ? "Awaiting Payment "
                      : item.status === "AWAITING_CONFIRMATION" ? "Confirm Trip "
                      : "Confirmed ✅"}
                    </span>

                    {item.status === "PENDING_PAYMENT" && (
                      <button 
                        onClick={() => setPayingBooking(item)} 
                        style={cardButtonStyle("#D97706", "#FFFFFF")}
                      >
                        💳 Pay Now
                      </button>
                    )}

                    <button 
                      onClick={() => navigate(`/track/${item.car.id}`)} 
                      style={cardButtonStyle("#0284C7", "#FFFFFF")}
                    >
                      📍 Track Live
                    </button>

                    {(item.status === "BOOKED" || item.status === "ACTIVE") && (
                      <button
                        onClick={() => handleCancelBooking(item.id)}
                        style={cardButtonStyle("#B91C1C", "#FFFFFF")}
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
    </div>
  );
}

// Styling helper functions
const actionButtonStyle = (bgColor, textColor, border = "none") => ({
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

const cardButtonStyle = (bgColor, textColor) => ({
  marginTop: "0.35rem",
  padding: "0.45rem 0.75rem",
  backgroundColor: bgColor,
  color: textColor,
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "0.825rem",
  fontWeight: "300",
  width: "100%",
  textAlign: "center"
});