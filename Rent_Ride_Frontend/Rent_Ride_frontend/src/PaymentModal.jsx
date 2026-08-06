import React, { useState } from 'react';

export default function PaymentModal({ booking, onClose, onConfirm }) {
  const [paying, setPaying] = useState(false);
  const token = localStorage.getItem('access_token');

  const upiString = `upi://pay?pa=rentride@upi&pn=RentRide&am=${booking.total_price}&cu=INR&tn=Trip${booking.id}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiString)}`;

  const handleConfirmPayment = async () => {
    setPaying(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/booked-cars/${booking.id}/pay/`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ " + data.message);
        onConfirm();
      } else {
        alert(data.error || "Payment confirmation failed.");
      }
    } catch (err) {
      console.error("Payment error:", err);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
      <div style={{ backgroundColor: "#fff", padding: "2rem", borderRadius: "12px", width: "320px", textAlign: "center", fontFamily: "Arial, sans-serif" }}>
        <h3>💳 Complete Payment</h3>
        <p style={{ color: "#666" }}>Trip for <strong>{booking.car?.name}</strong></p>

        <img src={qrImageUrl} alt="Payment QR" style={{ margin: "1rem 0", borderRadius: "8px" }} />

        <p style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#28a745" }}>₹{booking.total_price}</p>
        <p style={{ color: "#888", fontSize: "0.85rem" }}>Scan with any UPI app to pay</p>

        <button
          onClick={handleConfirmPayment}
          disabled={paying}
          style={{ marginTop: "1rem", width: "100%", padding: "0.7rem", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
        >
          {paying ? "Confirming..." : "✅ I've Paid"}
        </button>

        <button
          onClick={onClose}
          style={{ marginTop: "0.5rem", width: "100%", padding: "0.6rem", backgroundColor: "#f0f0f0", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}