import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './car_card_ui.css';
import { API_BASE_URL } from './config';

function Addcar() {
  const [cars, setCars] = useState([]);
  const navigate = useNavigate();

  const [newCar, setNewCar] = useState({
    name: "",
    brand: "",
    model_year: "",
    seats: 4,
    transmission: "Automatic",
    fuel_type: "Petrol",
    price_per_day: "",
    price_per_km: "",
    image: null,
    rc_document: null,        
    insurance_document: null, 
    puc_document: null,  
    available: true
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/cars/`)
      .then((res) => res.json())
      .then((data) => setCars(data));
  }, []);

  const addCar = async (carData) => {
    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        alert("Login First!");
        navigate("/login");
        return;
      }

      const formData = new FormData();
      Object.keys(carData).forEach((key) => {
        formData.append(key, carData[key]);
      });

      const response = await fetch(`${API_BASE_URL}/cars/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.status === 201) {
        alert("Car added successfully! 🎉");
        setCars((prevCars) => [...prevCars, data]);
        navigate("/");
      } else if (response.status === 401) {
        alert("Session expired. Login Again.");
        navigate("/login");
      } else {
        alert("Error: " + JSON.stringify(data));
      }
    } catch (error) {
      console.error("Error adding car:", error);
      alert("Network error while adding car.");
    }
  };

  const handleAddCar = (e) => {
    e.preventDefault();
    addCar(newCar);
    setNewCar({
      name: "",
      brand: "",
      model_year: "",
      seats: 4,
      transmission: "Automatic",
      fuel_type: "Petrol",
      price_per_day: "",
      price_per_km: "",
      image: null,
      available: true
    });
  };

  return (
    <div style={{
      backgroundColor: "#F8FAFC",
      minHeight: "100vh",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      color: "#0F172A",
      WebkitFontSmoothing: "antialiased",
      padding: "2rem 1.5rem"
    }} className="addcar">

      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        
        {/* TOP NAVIGATION & HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "400", color: "#0F172A", letterSpacing: "-0.5px" }} className="title">
            Car Management Dashboard
          </h2>
          <button
            onClick={() => navigate("/")}
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
            ⬅️ Back to Home
          </button>
        </div>

        {/* FORM CONTAINER */}
        <div style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "14px",
          border: "1px solid #E2E8F0",
          padding: "1.75rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          marginBottom: "2.5rem"
        }}>
          <form className="car-form" onSubmit={handleAddCar} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            <div className="form-row" style={formRowStyle}>
              <input
                type="text"
                placeholder="Car Name"
                value={newCar.name}
                onChange={(e) => setNewCar({ ...newCar, name: e.target.value })}
                required
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Brand"
                value={newCar.brand}
                onChange={(e) => setNewCar({ ...newCar, brand: e.target.value })}
                required
                style={inputStyle}
              />
            </div>

            <div className="form-row" style={formRowStyle}>
              <input
                type="number"
                placeholder="Model Year"
                value={newCar.model_year}
                onChange={(e) => setNewCar({ ...newCar, model_year: e.target.value })}
                required
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="Seats"
                value={newCar.seats}
                onChange={(e) => setNewCar({ ...newCar, seats: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div className="form-row" style={formRowStyle}>
              <select
                value={newCar.transmission}
                onChange={(e) => setNewCar({ ...newCar, transmission: e.target.value })}
                style={inputStyle}
              >
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>

              <select
                value={newCar.fuel_type}
                onChange={(e) => setNewCar({ ...newCar, fuel_type: e.target.value })}
                style={inputStyle}
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="form-row" style={formRowStyle}>
              <input
                type="number"
                step="0.01"
                placeholder="Price per day"
                value={newCar.price_per_day}
                onChange={(e) => setNewCar({ ...newCar, price_per_day: e.target.value })}
                required
                style={inputStyle}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price per KM (for one-way trips)"
                value={newCar.price_per_km}
                onChange={(e) => setNewCar({ ...newCar, price_per_km: e.target.value })}
                required
                style={inputStyle}
              />
            </div>

            <div className="form-row" style={formRowStyle}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewCar({ ...newCar, image: e.target.files[0] })}
                required
                style={{ ...inputStyle, padding: "0.45rem" }}
              />
            </div>
            <div className="form-row">
  <div>
    <label style={{ fontSize: "0.85rem", display: "block", marginBottom: "0.3rem" }}>RC Document:</label>
    <input type="file" accept="image/*" onChange={(e) => setNewCar({ ...newCar, rc_document: e.target.files[0] })} required />
  </div>
  <div>
    <label style={{ fontSize: "0.85rem", display: "block", marginBottom: "0.3rem" }}>Insurance:</label>
    <input type="file" accept="image/*" onChange={(e) => setNewCar({ ...newCar, insurance_document: e.target.files[0] })} required />
  </div>
</div>
<div className="form-row">
  <div>
    <label style={{ fontSize: "0.85rem", display: "block", marginBottom: "0.3rem" }}>PUC Certificate:</label>
    <input type="file" accept="image/*" onChange={(e) => setNewCar({ ...newCar, puc_document: e.target.files[0] })} required />
  </div>
</div>
            <label className="checkbox" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", color: "#475569", fontWeight: "300", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={newCar.available}
                onChange={(e) => setNewCar({ ...newCar, available: e.target.checked })}
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              Available
            </label>

            <button 
              type="submit" 
              className="btn"
              style={{
                padding: "0.75rem",
                backgroundColor: "#047857",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "300",
                fontSize: "0.95rem",
                marginTop: "0.5rem",
                transition: "all 0.2s ease"
              }}
            >
              ➕ Add Car
            </button>
          </form>
        </div>

        {/* CAR GRID (EXACTLY 2 COLUMNS) */}
        <div 
          className="car-grid" 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(2, 1fr)", 
            gap: "1.5rem" 
          }}
        >
          {cars.map((car) => (
            <div 
              key={car.id} 
              className="car-card"
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid #E2E8F0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <div style={{ height: "180px", width: "100%", backgroundColor: "#F8FAFC", overflow: "hidden" }}>
                <img 
                  src={car.image} 
                  alt={car.name} 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div style={{ padding: "1.25rem", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ margin: "0 0 0.3rem 0", fontSize: "1.15rem", fontWeight: "400", color: "#0F172A" }}>
                    {car.name} <span style={{ fontSize: "0.85rem", color: "#64748B", fontWeight: "300" }}>({car.brand})</span>
                  </h3>
                  <p style={{ margin: "0.25rem 0", color: "#475569", fontSize: "0.85rem", fontWeight: "300" }}>
                    {car.model_year} • {car.transmission} • {car.fuel_type}
                  </p>
                  <p style={{ margin: "0.25rem 0", color: "#475569", fontSize: "0.85rem", fontWeight: "300" }}>
                    Seats: {car.seats} • ₹{car.price_per_day}/day • ₹{car.price_per_km}/km
                  </p>
                </div>

                <div style={{ marginTop: "0.75rem" }}>
                  <span 
                    className={car.available ? "available" : "not-available"}
                    style={{
                      display: "inline-block",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                      fontWeight: "300",
                      backgroundColor: car.available ? "#ECFDF5" : "#FEF2F2",
                      color: car.available ? "#047857" : "#991B1B",
                      border: car.available ? "1px solid #A7F3D0" : "1px solid #FCA5A5"
                    }}
                  >
                    {car.available ? "Available" : "Not Available"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

// Styling helper objects
const formRowStyle = {
  display: "flex",
  gap: "1rem",
  flexWrap: "wrap"
};

const inputStyle = {
  flex: 1,
  minWidth: "200px",
  padding: "0.65rem 0.85rem",
  borderRadius: "6px",
  border: "1px solid #CBD5E1",
  color: "#0F172A",
  backgroundColor: "#FFFFFF",
  outline: "none",
  boxSizing: "border-box",
  fontSize: "0.9rem",
  fontWeight: "300"
};

export default Addcar;