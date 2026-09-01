import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './config';

export default function OwnerDashboard() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDocs, setExpandedDocs] = useState({});
  const [carDocEdits, setCarDocEdits] = useState({});

  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetch(`${API_BASE_URL}/owner/my-cars/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setCars(data))
      .catch((err) => console.error("Owner cars fetch error:", err))
      .finally(() => setLoading(false));
  }, [token]);

  const handleToggleAvailability = async (carId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/owner/cars/${carId}/toggle-availability/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCars(cars.map(c => c.id === carId ? { ...c, available: data.available } : c));
      } else {
        alert(data.error || "Could not update availability.");
      }
    } catch (err) {
      console.error("Toggle availability error:", err);
    }
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm("Delete this car permanently? This can't be undone.")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/cars/${carId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 204) {
        alert("Car deleted successfully.");
        setCars(cars.filter(c => c.id !== carId));
      } else {
        const data = await res.json();
        alert(data.error || "Could not delete car.");
      }
    } catch (err) {
      console.error("Delete car error:", err);
    }
  };

  const handleDocFileChange = (carId, fieldName, file) => {
    setCarDocEdits({
      ...carDocEdits,
      [carId]: { ...(carDocEdits[carId] || {}), [fieldName]: file }
    });
  };

  const handleUpdateCarDoc = async (carId, fieldName) => {
    const file = carDocEdits[carId]?.[fieldName];
    if (!file) {
      alert("Please choose a file first.");
      return;
    }

    const formData = new FormData();
    formData.append(fieldName, file);

    try {
      const res = await fetch(`${API_BASE_URL}/cars/${carId}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        alert("Document updated!");
        const updated = await res.json();
        setCars(cars.map(c => c.id === carId ? { ...c, [fieldName]: updated[fieldName] } : c));
        setCarDocEdits({ ...carDocEdits, [carId]: { ...(carDocEdits[carId] || {}), [fieldName]: null } });
      } else {
        alert("Could not update document.");
      }
    } catch (err) {
      console.error("Update doc error:", err);
    }
  };

  const handleDeleteCarDoc = async (carId, fieldName) => {
    if (!window.confirm("Delete this document?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/cars/${carId}/delete_document/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ field_name: fieldName })
      });
      if (res.ok) {
        alert("Document deleted.");
        setCars(cars.map(c => c.id === carId ? { ...c, [fieldName]: null } : c));
      } else {
        alert("Could not delete document.");
      }
    } catch (err) {
      console.error("Delete doc error:", err);
    }
  };

  const toggleDocsView = (carId) => {
    setExpandedDocs({ ...expandedDocs, [carId]: !expandedDocs[carId] });
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
      <p style={{ fontWeight: "300" }}>Loading your cars...</p>
    </div>
  );

  return (
    <div style={{ 
      backgroundColor: "#F8FAFC", 
      minHeight: "100vh", 
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif", 
      color: "#0F172A",
      WebkitFontSmoothing: "antialiased",
      padding: "1.25rem 1rem"
    }}>
      <style>{`
        .owner-car-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          align-items: stretch;
        }
        @media (min-width: 640px) {
          .owner-car-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem;
          }
        }
      `}</style>

      <div style={{ maxWidth: "950px", margin: "0 auto" }}>
        
        {/* HEADER & TOP BUTTONS */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "0.75rem"
        }}>
          <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: "500", color: "#0F172A", letterSpacing: "-0.5px" }}>
             My Cars
          </h2>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button 
              onClick={() => navigate("/owner-history")} 
              style={topButtonStyle("#EEF2FF", "#3730A3", "1px solid #C7D2FE")}
            >
              📜 History
            </button>
            <button 
              onClick={() => navigate("/owner-earnings")} 
              style={topButtonStyle("#ECFDF5", "#047857", "1px solid #A7F3D0")}
            >
              💰 Earnings
            </button>
          </div>
        </div>

        {/* CONTENT */}
        {cars.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "3rem 1rem", 
            backgroundColor: "#FFFFFF", 
            borderRadius: "14px", 
            border: "1px solid #E2E8F0",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
          }}>
            <p style={{ color: "#64748B", fontWeight: "300", fontSize: "0.95rem", margin: "0 0 1rem 0" }}>
              You haven't added any cars yet.
            </p>
            <button
              onClick={() => navigate("/add-cars")}
              style={{
                padding: "0.6rem 1.25rem",
                backgroundColor: "#2563EB",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "300",
                fontSize: "0.9rem"
              }}
            >
              ➕ Add a Car
            </button>
          </div>
        ) : (
          <div className="owner-car-grid">
            {cars.map((car) => {
              const isDocsOpen = !!expandedDocs[car.id];

              return (
                <div 
                  key={car.id} 
                  style={{ 
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0", 
                    borderRadius: "14px", 
                    padding: "1rem", 
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxSizing: "border-box",
                    height: "100%"
                  }}
                >
                  <div>
                    {/* IMAGE CONTAINER */}
                    {car.image && (
                      <div style={{ 
                        width: "100%", 
                        height: "150px", 
                        backgroundColor: "#F8FAFC", 
                        borderRadius: "10px", 
                        overflow: "hidden", 
                        marginBottom: "0.85rem",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "1px solid #F1F5F9"
                      }}>
                        <img
                          src={car.image.startsWith("http") ? car.image : `${API_BASE_URL}${car.image}`}
                          alt={car.name}
                          style={{ 
                            width: "100%", 
                            height: "100%", 
                            objectFit: "contain", 
                            padding: "0.4rem"
                          }}
                        />
                      </div>
                    )}

                    {/* TITLE & AVAILABILITY BADGE */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                      <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "500", color: "#0F172A" }}>
                        {car.brand} {car.name}
                      </h3>
                      <span style={{
                        padding: "0.2rem 0.6rem",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: "300",
                        backgroundColor: car.booking ? "#FEF3C7" : "#ECFDF5",
                        color: car.booking ? "#92400E" : "#047857",
                        border: car.booking ? "1px solid #FDE68A" : "1px solid #A7F3D0",
                        whiteSpace: "nowrap"
                      }}>
                        {car.booking ? "Currently Rented" : "Available"}
                      </span>
                    </div>
                      
                    <p style={{ color: "#64748B", margin: "0.25rem 0 0.75rem 0", fontSize: "0.9rem", fontWeight: "400" }}>
                      ₹{car.price_per_day}/day
                    </p>
                  </div>

                  {/* BOTTOM CONTROLS & DOCS DRAWER */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "auto" }}>
                    
                    {/* ACTION BUTTONS ROW */}
                    {!car.booking && (
                      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "0.4rem" }}>
                        <button
                          onClick={() => handleToggleAvailability(car.id)}
                          style={{
                            padding: "0.45rem 0.3rem",
                            backgroundColor: car.available ? "#FEF2F2" : "#ECFDF5",
                            color: car.available ? "#991B1B" : "#047857",
                            border: car.available ? "1px solid #FCA5A5" : "1px solid #A7F3D0",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "400",
                            fontSize: "0.78rem",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {car.available ? "🚫 Unavailable" : "✅ Available"}
                        </button>

                        <button
                          onClick={() => toggleDocsView(car.id)}
                          style={{
                            padding: "0.45rem 0.3rem",
                            backgroundColor: isDocsOpen ? "#E2E8F0" : "#F1F5F9",
                            color: "#1E293B",
                            border: "1px solid #CBD5E1",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.78rem",
                            fontWeight: "400",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {isDocsOpen ? "▲ Hide Docs" : "📄 Docs"}
                        </button>

                        <button
                          onClick={() => handleDeleteCar(car.id)}
                          style={{
                            padding: "0.45rem 0.3rem",
                            backgroundColor: "#F1F5F9",
                            color: "#475569",
                            border: "1px solid #CBD5E1",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "400",
                            fontSize: "0.78rem",
                            whiteSpace: "nowrap"
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}

                    {/* EXPANDED DOCUMENTS DRAWER */}
                    {isDocsOpen && (
                      <div style={{ 
                        marginTop: "0.5rem", 
                        padding: "0.85rem", 
                        backgroundColor: "#F8FAFC", 
                        borderRadius: "8px", 
                        border: "1px solid #E2E8F0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem"
                      }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#334155" }}>
                          Vehicle Documents
                        </span>

                        {[
                          { field: "rc_document", label: "RC Certificate" },
                          { field: "insurance_document", label: "Insurance Policy" },
                          { field: "puc_document", label: "PUC Certificate" },
                        ].map(({ field, label }) => (
                          <div 
                            key={field} 
                            style={{ 
                              borderBottom: "1px solid #E2E8F0", 
                              paddingBottom: "0.6rem" 
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                              <span style={{ fontSize: "0.78rem", fontWeight: "500", color: "#475569" }}>
                                {label}
                              </span>
                              {car[field] && (
                                <button
                                  onClick={() => handleDeleteCarDoc(car.id, field)}
                                  style={{ fontSize: "0.72rem", color: "#DC2626", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                                >
                                  🗑️ Delete
                                </button>
                              )}
                            </div>

                            {car[field] ? (
                              <div style={{ marginBottom: "0.4rem" }}>
                                <a href={car[field]} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={car[field]}
                                    alt={label}
                                    style={{ width: "80px", height: "50px", objectFit: "cover", borderRadius: "5px", border: "1px solid #CBD5E1", display: "block" }}
                                  />
                                </a>
                              </div>
                            ) : (
                              <p style={{ fontSize: "0.75rem", color: "#DC2626", margin: "0 0 0.35rem 0" }}>⚠️ Not uploaded</p>
                            )}

                            <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleDocFileChange(car.id, field, e.target.files[0])}
                                style={{ fontSize: "0.72rem", maxWidth: "160px" }}
                              />
                              <button
                                onClick={() => handleUpdateCarDoc(car.id, field)}
                                style={{ 
                                  padding: "0.25rem 0.55rem", 
                                  backgroundColor: "#2563EB", 
                                  color: "#FFFFFF", 
                                  border: "none", 
                                  borderRadius: "4px", 
                                  cursor: "pointer", 
                                  fontSize: "0.72rem",
                                  fontWeight: "400"
                                }}
                              >
                                {car[field] ? "Replace" : "Upload"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* BOOKING DETAILS / FALLBACK STATUS */}
                    {car.booking ? (
                      <div style={{ padding: "0.75rem", backgroundColor: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                        <p style={detailTextStyle}>👤 <strong>Booked by:</strong> {car.booking.customer_name}</p>
                        <p style={detailTextStyle}>📧 <strong>Contact:</strong> {car.booking.customer_email || 'N/A'}</p>
                        {car.booking.start_point && car.booking.end_point && (
                          <p style={detailTextStyle}>📍 <strong>Route:</strong> {car.booking.start_point} → {car.booking.end_point}</p>
                        )}
                        <p style={detailTextStyle}>📅 <strong>Dates:</strong> {car.booking.start_date} → {car.booking.end_date}</p>
                        <p style={detailTextStyle}>💰 <strong>Trip Price:</strong> ₹{car.booking.total_price}</p>
                        <p style={detailTextStyle}>
                          🚗 <strong>Driver:</strong> {car.booking.driver_username || <span style={{ color: "#B91C1C" }}>Not assigned yet</span>}
                        </p>
                        <p style={detailTextStyle}>📌 <strong>Status:</strong> {car.booking.status}</p>

                        <button
                          onClick={() => navigate(`/track/${car.id}`)}
                          style={{ 
                            width: "100%",
                            marginTop: "0.5rem", 
                            padding: "0.45rem 0.75rem", 
                            backgroundColor: "#0284C7", 
                            color: "#FFFFFF", 
                            border: "none", 
                            borderRadius: "6px", 
                            cursor: "pointer", 
                            fontWeight: "300",
                            fontSize: "0.825rem"
                          }}
                        >
                          📍 View Live Location
                        </button>
                      </div>
                    ) : (
                      <p style={{ color: "#94A3B8", margin: "0.25rem 0 0 0", fontSize: "0.825rem", fontWeight: "300", textAlign: "center" }}>
                        No active booking right now.
                      </p>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

const topButtonStyle = (bgColor, textColor, border = "none") => ({
  padding: "0.45rem 0.85rem",
  backgroundColor: bgColor,
  color: textColor,
  border: border,
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "0.825rem",
  fontWeight: "400",
  transition: "all 0.2s ease"
});

const detailTextStyle = {
  margin: "0.2rem 0",
  fontSize: "0.8rem",
  color: "#334155",
  fontWeight: "300"
};