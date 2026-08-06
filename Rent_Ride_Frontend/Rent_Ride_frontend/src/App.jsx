import './App.css'
import { useEffect, useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext.jsx';

function HomePage() {
  const [cars, setCars] = useState([]);
  
  
  const [selectedCar, setSelectedCar] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const navigate = useNavigate();
  const { isAuthenticated, logoutUser } = useContext(AuthContext);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/cars/")
      .then((res) => res.json())
      .then((data) => setCars(data));
  }, []);

  //Price calculate karne ka logic
  const calculateTotalPrice = () => {
    if (!startDate || !endDate || !selectedCar) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days * selectedCar.price_per_day : 0;
  };

  
  const handleBookSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!selectedCar) {
      alert("Pehle koi car select karein.");
      return;
    }

    if (!startDate || !endDate || calculateTotalPrice() <= 0) {
      alert("choose correct date and time");
      return;
    }

    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch("http://127.0.0.1:8000/book-car/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          car: selectedCar.id, 
          start_date: startDate,
          end_date: endDate,
          start_point: startPoint,   
          end_point: endPoint    
        })
      });

      if (response.status === 201) {
        alert("Booking successful! 🎉");
        setSelectedCar(null); // Modal reset
        setStartPoint('');   
        setEndPoint('');   
        navigate("/booked-cars");
      } else if (response.status === 401) {
        alert("Please Login First!");
        navigate("/login");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Booking failed.");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error while booking.");
    }
  };
const [searchTerm, setSearchTerm] = useState('');

  // Cars array me se name, brand, fuel_type, transmission filter karega
  const filteredCars = cars.filter((car) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true; // Search input khali hai toh saari cars dikhayega

    return (
      car.name?.toLowerCase().includes(query) ||
      car.brand?.toLowerCase().includes(query) ||
      car.fuel_type?.toLowerCase().includes(query) ||
      car.transmission?.toLowerCase().includes(query)
    );
  });
const [isOwner, setIsOwner] = useState(false);
const [isDriver, setIsDriver] = useState(false);
useEffect(() => {
  if (!isAuthenticated) return;
  const token = localStorage.getItem('access_token');
  fetch("http://127.0.0.1:8000/profile/", {
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then((res) => res.json())
    .then((data) => {
      setIsDriver(data.is_driver);
      setIsOwner(data.is_owner);
    })
    .catch((err) => console.error("Profile fetch error:", err));
}, [isAuthenticated]);
const [startPoint, setStartPoint] = useState('');
const [endPoint, setEndPoint] = useState('');
  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      
      {/* NAVBAR */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
        <h2>Rent Ride </h2>
        <div>
          {isAuthenticated ? (
            <>
            
              <button onClick={() => navigate("/booked-cars")} style={{ marginRight: "1rem" }}>My Bookings</button>
              <button onClick={logoutUser} style={{marginRight:"1rem", backgroundColor: "#dc3545", color: "#fff" }}>Logout</button>
              {isDriver && (
              <button 
              onClick={() => navigate("/driver-dashboard")} 
              style={{ marginRight: "1rem", padding: "0.5rem 1rem", backgroundColor: "#ffc107", color: "#000", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
              >
              🚕 Driver Dashboard
              </button>
              )}
              {isOwner && (
                <button 
                 onClick={() => navigate("/owner-dashboard")} 
                 style={{ marginRight: "1rem", padding: "0.5rem 1rem", backgroundColor: "#6f42c1", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
                 >
                🚙 My Cars
              </button>
              )}
              <button onClick={() => navigate("/profile")} style={{ marginRight: "1rem"}}>
                Profile 👤
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")} style={{ padding: "0.5rem 1rem", backgroundColor: "#3daa34", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>Login</button>
              <button onClick={() => navigate("/register")} style={{ padding: "0.5rem 1rem", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>Sign Up</button>
            </>
            
          )}
        </div>
      </div>

      <h1>Welcome to Rent Ride</h1>

      {/* 🔍 SEARCH BAR FIELD */}
      <div style={{ margin: "1.5rem 0 2rem 0", display: "flex", justifyContent: "center" }}>
        <input
          type="text"
          placeholder="🔍 Search cars..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            background: "#fff",
            color:"#000",
            width: "100%",
            maxWidth: "500px",
            padding: "12px 20px",
            fontSize: "1rem",
            borderRadius: "25px",
            border: "1px solid #ccc",
            outline: "none",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)"
          }}
          
        />
        <>
        {isOwner && (
          <button 
          onClick={() => navigate("/add-cars")} 
          style={{ padding: "0.5rem 1rem", backgroundColor: "#4bb965", color: "#fff", border: "none", borderRadius: "25px", cursor: "pointer", marginRight: "1rem" }}
            >
          ➕ Add Car
            </button>
          )}
        </>
      </div>

      {/* CAR CARDS GRID */}
      {filteredCars.length === 0 ? (
        <p style={{ textAlign: "center", color: "#777", marginTop: "2rem" }}>Car Not Found</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
          {filteredCars.map((car) => (
            <div key={car.id} style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "8px" }}>
              <img src={car.image} alt={car.name} style={{ width: "100%", height: "150px", objectFit: "cover" }} />
              <h3>{car.name}</h3>
              <p>₹{car.price_per_day} / day</p>
              <button 
                onClick={() => {
                  if (!isAuthenticated) {
                    alert("Pehle login kijiye!");
                    navigate("/login");
                  } else {
                    setSelectedCar(car);
                  }
                }}
                style={{ padding: "0.5rem 1rem", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 📅 DATE SELECTOR MODAL / POPUP */}
      {selectedCar && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ backgroundColor: "#fff", padding: "2rem", borderRadius: "8px", width: "300px" }}>
            <h3>Book {selectedCar.name}</h3>
            <form onSubmit={handleBookSubmit}>
              <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block" }}>Pickup Location:</label>
          <input
            type="text"
            value={startPoint}
            onChange={(e) => setStartPoint(e.target.value)}
            placeholder="Where should we pick you up?"
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block" }}>Final Destination:</label>
          <input
            type="text"
            value={endPoint}
            onChange={(e) => setEndPoint(e.target.value)}
            placeholder="Where are you headed?"
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block" }}>Start Date:</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required style={{ width: "100%" }} />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block" }}>End Date:</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required style={{ width: "100%" }} />
              </div>

              <div style={{ marginBottom: "1rem", fontWeight: "bold", color: "#28a745" }}>
                Total: ₹{calculateTotalPrice()}
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="button" onClick={() => setSelectedCar(null)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, backgroundColor: "#28a745", color: "#fff", border: "none" }}>Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default HomePage;