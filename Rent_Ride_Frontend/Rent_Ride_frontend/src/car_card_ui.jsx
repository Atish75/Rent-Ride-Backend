import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 👈 1. Router Navigation Import
import './car_card_ui.css';

function Addcar() {
  const [cars, setCars] = useState([]);
  const navigate = useNavigate(); // 👈 2. Navigate hook initialize

  const [newCar, setNewCar] = useState({
    name: "",
    brand: "",
    model_year: "",
    seats: 4,
    transmission: "Automatic",
    fuel_type: "Petrol",
    price_per_day: "",
    image: null,
    available: true
  });

  useEffect(() => {
    fetch("http://127.0.0.1:8000/cars/")
      .then((res) => res.json())
      .then((data) => setCars(data));
  }, []);

  const addCar = async (carData) => {
    try {
      const token = localStorage.getItem('access_token'); // 👈 3. Token Read Karein

      if (!token) {
        alert("Pehle login kijiye!");
        navigate("/login");
        return;
      }

      const formData = new FormData();
      Object.keys(carData).forEach((key) => {
        formData.append(key, carData[key]);
      });

      const response = await fetch("http://127.0.0.1:8000/cars/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}` // 👈 4. JWT Authorization Header
        },
        body: formData
      });

      const data = await response.json();

      if (response.status === 201) {
        alert("Car added successfully! 🎉");
        setCars((prevCars) => [...prevCars, data]);
        navigate("/"); // 👈 5. Direct Home Page redirect
      } else if (response.status === 401) {
        alert("Session expired. Dobara login karein.");
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
      image: null,
      available: true
    });
  };

  return (
    <div className="addcar">
      {/* Back Button to Home */}
      <button 
        onClick={() => navigate("/")} 
        style={{ marginBottom: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}
      >
        ⬅️ Back to Home
      </button>

      <h2 className="title">🚗 Car Management Dashboard</h2>

      {/* Add Car Form */}
      <form className="car-form" onSubmit={handleAddCar}>
        <div className="form-row">
          <input 
            type="text" 
            placeholder="Car Name" 
            value={newCar.name}
            onChange={(e) => setNewCar({ ...newCar, name: e.target.value })} 
            required 
          />
          <input 
            type="text" 
            placeholder="Brand" 
            value={newCar.brand}
            onChange={(e) => setNewCar({ ...newCar, brand: e.target.value })} 
            required 
          />
        </div>

        <div className="form-row">
          <input 
            type="number" 
            placeholder="Model Year" 
            value={newCar.model_year}
            onChange={(e) => setNewCar({ ...newCar, model_year: e.target.value })} 
            required 
          />
          <input 
            type="number" 
            placeholder="Seats" 
            value={newCar.seats}
            onChange={(e) => setNewCar({ ...newCar, seats: e.target.value })} 
          />
        </div>

        <div className="form-row">
          <select 
            value={newCar.transmission}
            onChange={(e) => setNewCar({ ...newCar, transmission: e.target.value })}
          >
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>

          <select 
            value={newCar.fuel_type}
            onChange={(e) => setNewCar({ ...newCar, fuel_type: e.target.value })}
          >
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <div className="form-row">
          <input 
            type="number" 
            step="0.01" 
            placeholder="Price per day"
            value={newCar.price_per_day}
            onChange={(e) => setNewCar({ ...newCar, price_per_day: e.target.value })} 
            required 
          />
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setNewCar({ ...newCar, image: e.target.files[0] })} 
            required 
          />
        </div>

        <label className="checkbox">
          <input 
            type="checkbox" 
            checked={newCar.available}
            onChange={(e) => setNewCar({ ...newCar, available: e.target.checked })} 
          />
          Available
        </label>

        <button type="submit" className="btn">➕ Add Car</button>
      </form>

      {/* Car Grid */}
      <div className="car-grid">
        {cars.map((car) => (
          <div key={car.id} className="car-card">
            <img src={car.image} alt={car.name} />
            <h3>{car.name} ({car.brand})</h3>
            <p>{car.model_year} • {car.transmission} • {car.fuel_type}</p>
            <p>Seats: {car.seats} • ₹{car.price_per_day}/day</p>
            <p className={car.available ? "available" : "not-available"}>
              {car.available ? "Available" : "Not Available"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Addcar;