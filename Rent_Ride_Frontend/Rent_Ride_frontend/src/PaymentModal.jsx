import React, { useState } from 'react';
import { API_BASE_URL } from './config';

export default function PaymentModal({ booking, onClose, onConfirm }) {
  const [paying, setPaying] = useState(false);
  const token = localStorage.getItem('access_token');

  const upiString = `upi://pay?pa=rentride@upi&pn=RentRide&am=${booking.total_price}&cu=INR&tn=Trip${booking.id}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiString)}`;

  const handleConfirmPayment = async () => {
    setPaying(true);
    try {
      const res = await fetch(`${API_BASE_URL}/booked-cars/${booking.id}/pay/`, {
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
    <div style={{ 
      position: "fixed", 
      top: 0, 
      left: 0, 
      width: "100%", 
      height: "100%", 
      backgroundColor: "rgba(15, 23, 42, 0.5)", 
      backdropFilter: "blur(3px)",
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      zIndex: 1000 
    }}>
      <div style={{ 
        backgroundColor: "#FFFFFF", 
        padding: "2rem", 
        borderRadius: "14px", 
        width: "90%",
        maxWidth: "340px", 
        textAlign: "center", 
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: "#0F172A",
        WebkitFontSmoothing: "antialiased",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        border: "1px solid #E2E8F0"
      }}>
        {/* HEADER AREA */}
        <h3 style={{ 
          margin: "0 0 0.35rem 0", 
          fontSize: "1.25rem", 
          fontWeight: "400", 
          color: "#0F172A",
          letterSpacing: "-0.5px"
        }}>
          💳 Complete Payment
        </h3>
        
        <p style={{ margin: "0 0 1.25rem 0", color: "#64748B", fontSize: "0.875rem", fontWeight: "300" }}>
          Trip for <strong style={{ fontWeight: "400", color: "#334155" }}>{booking.car?.name}</strong>
        </p>

        {/* QR CODE CONTAINER */}
        <div style={{ 
          display: "inline-block",
          padding: "0.75rem", 
          backgroundColor: "#F8FAFC", 
          borderRadius: "12px", 
          border: "1px solid #E2E8F0",
          marginBottom: "1rem"
        }}>
          <img 
            src={qrImageUrl} 
            alt="Payment QR" 
            style={{ width: "190px", height: "190px", display: "block", borderRadius: "6px" }} 
          />
        </div>

        {/* PRICE DISPLAY */}
        <p style={{ 
          margin: "0 0 0.2rem 0", 
          fontSize: "1.5rem", 
          fontWeight: "500", 
          color: "#047857" 
        }}>
          ₹{booking.total_price}
        </p>
        
        <p style={{ margin: "0 0 1.5rem 0", color: "#64748B", fontSize: "0.825rem", fontWeight: "300" }}>
          Scan with any UPI app to pay
        </p>

        {/* ACTION BUTTONS */}
        <button
          onClick={handleConfirmPayment}
          disabled={paying}
          style={{ 
            width: "100%", 
            padding: "0.75rem", 
            backgroundColor: "#047857", 
            color: "#FFFFFF", 
            border: "none", 
            borderRadius: "6px", 
            cursor: paying ? "not-allowed" : "pointer", 
            fontWeight: "300",
            fontSize: "0.9rem",
            opacity: paying ? 0.7 : 1,
            transition: "all 0.2s ease"
          }}
        >
          {paying ? "Confirming..." : "✅ I've Paid"}
        </button>

        <button
          onClick={onClose}
          style={{ 
            marginTop: "0.5rem", 
            width: "100%", 
            padding: "0.65rem", 
            backgroundColor: "#F1F5F9", 
            color: "#475569", 
            border: "1px solid #CBD5E1", 
            borderRadius: "6px", 
            cursor: "pointer",
            fontWeight: "300",
            fontSize: "0.875rem",
            transition: "all 0.2s ease"
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}