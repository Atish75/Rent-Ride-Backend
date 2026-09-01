import './App.css'
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext.jsx';
import LocationPicker from './LocationPicker.jsx';
import { API_BASE_URL } from './config';

function HomePage() {
  const [cars, setCars] = useState([]);
  
  const [selectedCar, setSelectedCar] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [tripType, setTripType] = useState('DATE_RANGE');
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logoutUser } = useContext(AuthContext);

  useEffect(() => {
    fetch(`${API_BASE_URL}/cars/`)
      .then((res) => res.json())
      .then((data) => setCars(data))
      .catch((err) => console.error("Error fetching cars:", err));
  }, []);

  // Price calculate karne ka logic (Fixed syntax error)
  const calculateTotalPrice = () => {
    if (!startDate || !endDate || !selectedCar) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return days > 0 ? days * Number(selectedCar.price_per_day) : 0;
  };

  const haversineEstimate = (a, b) => {
    const R = 6371;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLon = (b.lng - a.lng) * Math.PI / 180;
    const x = Math.sin(dLat/2)**2 + Math.cos(a.lat * Math.PI/180) * Math.cos(b.lat * Math.PI/180) * Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
  };

  const handleBookSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!selectedCar) {
      alert("fisrt select any car.");
      return;
    }

    if (tripType === 'POINT_TO_POINT') {
      if (!startCoords || !endCoords) {
        alert("Select location of both Pickup and drop-off .");
        return;
      }
    } else {
      if (!startDate || !endDate || calculateTotalPrice() <= 0) {
        alert("choose correct date and time");
        return;
      }
    }

    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(`${API_BASE_URL}/book-car/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          car: selectedCar.id,
          trip_type: tripType,
          ...(tripType === 'POINT_TO_POINT' ? {
            start_lat: startCoords?.lat,
            start_lng: startCoords?.lng,
            end_lat: endCoords?.lat,
            end_lng: endCoords?.lng,
            start_point: startCoords?.name || '',
            end_point: endCoords?.name || '',
          } : {
            start_date: startDate,
            end_date: endDate,
            start_point: startPoint,
            end_point: endPoint,
          })
        })
      });

      if (response.status === 201) {
        alert("Booking successful! 🎉");
        setSelectedCar(null);
        setStartPoint('');
        setEndPoint('');
        setTripType('DATE_RANGE');
        setStartCoords(null);
        setEndCoords(null);
        navigate("/booked-cars");
      } else if (response.status === 401) {
        alert("Login First To Book !");
        navigate("/login");
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Booking failed.');
      }
    } catch (error) {
      console.error('Booking network failure:', error);
      alert('Network communication error.');
    }
  };

  const [searchTerm, setSearchTerm] = useState('');

  // Cars array me se name, brand, fuel_type, transmission filter karega
  const filteredCars = cars.filter((car) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;

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
    fetch(`${API_BASE_URL}/profile/`, {
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

  const todayStr = new Date().toISOString().split('T')[0];

  const mobileNavButtonStyle = (bgColor, textColor) => ({
  width: "100%",
  padding: "0.65rem 1rem",
  backgroundColor: bgColor,
  color: textColor,
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: "400",
  textAlign: "left"
});
  return (
    <div style={{ 
      backgroundColor: "#F8FAFC", 
      minHeight: "100vh", 
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif", 
      color: "#0F172A",
      WebkitFontSmoothing: "antialiased" 
    }}>
      
      {/* ☀️ CLEAN WHITE LIGHT NAVBAR */}
      <nav style={{ 
  backgroundColor: "#FFFFFF", 
  padding: "0.85rem 1.5rem", 
  display: "flex", 
  justifyContent: "space-between", 
  alignItems: "center",
  borderBottom: "1px solid #E2E8F0",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  position: "sticky",
  top: 0,
  zIndex: 100
}}>
  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
    <h2 style={{ color: "#0F172A", margin: 0, fontSize: "1.35rem", fontWeight: "400", letterSpacing: "0.5px" }}>
      Rent Ride
    </h2>
  </div>

  {/* Desktop nav — hidden on mobile */}
  <div className="navbar-desktop" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
    {isAuthenticated ? (
      <>
        <button onClick={() => navigate("/booked-cars")} style={navButtonStyle("#F1F5F9", "#334155", "1px solid #CBD5E1")}>My Bookings</button>
        {isDriver && (
          <button onClick={() => navigate("/driver-dashboard")} style={navButtonStyle("#FEF3C7", "#92400E", "1px solid #FDE68A")}>Driver Dashboard</button>
        )}
        {isOwner && (
          <button onClick={() => navigate("/owner-dashboard")} style={navButtonStyle("#EEF2FF", "#3730A3", "1px solid #C7D2FE")}>My Cars</button>
        )}
        <button onClick={() => navigate("/profile")} style={navButtonStyle("#F1F5F9", "#334155", "1px solid #CBD5E1")}>Profile 👤</button>
        <button onClick={logoutUser} style={navButtonStyle("#FEF2F2", "#991B1B", "1px solid #FCA5A5")}>Logout</button>
      </>
    ) : (
      <>
        <button onClick={() => navigate("/login")} style={navButtonStyle("#F8FAFC", "#334155", "1px solid #CBD5E1")}>Login</button>
        <button onClick={() => navigate("/register")} style={navButtonStyle("#2563EB", "#FFFFFF")}>Sign Up</button>
      </>
    )}
  </div>

  {/* Hamburger button — shown on mobile only */}
  <button
    className="navbar-hamburger"
    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
    style={{
      display: "none",
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "0.4rem",
      fontSize: "1.5rem",
      color: "#334155"
    }}
    aria-label="Toggle menu"
  >
    {mobileMenuOpen ? "✕" : "☰"}
  </button>
</nav>

{/* Mobile dropdown menu */}
{mobileMenuOpen && (
  <div className="navbar-mobile-dropdown" style={{
    backgroundColor: "#FFFFFF",
    borderBottom: "1px solid #E2E8F0",
    display: "none",
    flexDirection: "column",
    padding: "0.5rem 1.5rem 1rem 1.5rem",
    gap: "0.5rem",
    position: "sticky",
    top: "60px",
    zIndex: 99
  }}>
    {isAuthenticated ? (
      <>
        <button onClick={() => { navigate("/booked-cars"); setMobileMenuOpen(false); }} style={mobileNavButtonStyle("#F1F5F9", "#334155")}>My Bookings</button>
        {isDriver && (
          <button onClick={() => { navigate("/driver-dashboard"); setMobileMenuOpen(false); }} style={mobileNavButtonStyle("#FEF3C7", "#92400E")}>Driver Dashboard</button>
        )}
        {isOwner && (
          <button onClick={() => { navigate("/owner-dashboard"); setMobileMenuOpen(false); }} style={mobileNavButtonStyle("#EEF2FF", "#3730A3")}>My Cars</button>
        )}
        <button onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }} style={mobileNavButtonStyle("#F1F5F9", "#334155")}>Profile 👤</button>
        <button onClick={() => { logoutUser(); setMobileMenuOpen(false); }} style={mobileNavButtonStyle("#FEF2F2", "#991B1B")}>Logout</button>
      </>
    ) : (
      <>
        <button onClick={() => { navigate("/login"); setMobileMenuOpen(false); }} style={mobileNavButtonStyle("#F8FAFC", "#334155")}>Login</button>
        <button onClick={() => { navigate("/register"); setMobileMenuOpen(false); }} style={mobileNavButtonStyle("#2563EB", "#FFFFFF")}>Sign Up</button>
      </>
    )}
  </div>
)}


      {/* MAIN CONTENT */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 1.5rem 1rem 1.5rem" }}>
        
        <h1 style={{ textAlign: "center", fontSize: "2rem", fontWeight: "400", color: "#0F172A", margin: "0 0 1.5rem 0", letterSpacing: "-0.5px" }}>
          Welcome to Rent Ride
        </h1>

        {/* 🔍 SEARCH BAR FIELD */}
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", alignItems: "center", flexWrap: "wrap", marginBottom: "3rem" }}>
          <div style={{ position: "relative", flex: "1", maxWidth: "480px" }}>
            <input
              type="text"
              placeholder="Search cars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1.25rem",
                fontSize: "0.95rem",
                fontWeight: "400",
                color: "#0F172A",
                backgroundColor: "#FFFFFF",
                borderRadius: "50px",
                border: "1.5px solid #CBD5E1",
                outline: "none",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
                boxSizing: "border-box"
              }}
            />
          </div>

          {isOwner && (
            <button 
              onClick={() => navigate("/add-cars")} 
              style={{
                padding: "0.75rem 1.25rem",
                backgroundColor: "#49b99a",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "50px",
                cursor: "pointer",
                fontWeight: "400",
                fontSize: "0.9rem"
              }}
            >
              ➕ Add Car
            </button>
          )}
        </div>

        {/* CAR CARDS GRID */}
        {filteredCars.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
            <p style={{ color: "#64748B", fontSize: "1rem", fontWeight: "300", margin: 0 }}>Car Not Found</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "1.75rem" }}>
            {filteredCars.map((car) => (
              <div 
                key={car.id} 
                style={{ 
                  backgroundColor: "#FFFFFF", 
                  borderRadius: "12px", 
                  overflow: "hidden", 
                  border: "1px solid #E2E8F0",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ height: "170px", width: "100%", backgroundColor: "#F8FAFC", overflow: "hidden" }}>
                    <img 
                      src={car.image} 
                      alt={car.name} 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                  </div>
                  <div style={{ padding: "1.25rem" }}>
                    <h3 style={{ margin: "0 0 0.4rem 0", fontSize: "1.15rem", fontWeight: "400", color: "#0F172A" }}>
                      {car.name}
                    </h3>
                    <p style={{ margin: 0, color: "#047857", fontWeight: "500", fontSize: "1rem" }}>
                      ₹{car.price_per_day} <span style={{ fontSize: "0.85rem", color: "#64748B", fontWeight: "300" }}>/ day</span>
                    </p>
                  </div>
                </div>

                <div style={{ padding: "0 1.25rem 1.25rem 1.25rem" }}>
                  <button 
                    onClick={() => {
                      if (!isAuthenticated) {
                        alert("Do Login First!");
                        navigate("/login");
                      } else {
                        setSelectedCar(car);
                      }
                    }}
                    style={{ 
                      width: "100%",
                      padding: "0.65rem", 
                      backgroundColor: "#1D4ED8", 
                      color: "#FFFFFF", 
                      border: "none", 
                      borderRadius: "6px", 
                      cursor: "pointer",
                      fontWeight: "400",
                      fontSize: "0.9rem"
                    }}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📅 BOOKING MODAL */}
      {selectedCar && (
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
            padding: "1.75rem", 
            borderRadius: "14px", 
            width: "90%",
            maxWidth: "400px", 
            maxHeight: "85vh", 
            overflowY: "auto",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ margin: "0 0 1.25rem 0", fontSize: "1.2rem", fontWeight: "400", color: "#0F172A", borderBottom: "1px solid #E2E8F0", paddingBottom: "0.75rem" }}>
              Book {selectedCar.name}
            </h3>

            <form onSubmit={handleBookSubmit}>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "300", fontSize: "0.85rem", color: "#475569" }}>
                  Trip Type:
                </label>
                <select 
                  value={tripType} 
                  onChange={(e) => setTripType(e.target.value)} 
                  style={modalInputStyle}
                >
                  <option value="DATE_RANGE">Multi-day Rental (per day)</option>
                  <option value="POINT_TO_POINT">One-way Trip (by distance)</option>
                </select>
              </div>

              {tripType === 'POINT_TO_POINT' ? (
                <>
                  <div style={{ marginBottom: "1rem" }}>
                    <LocationPicker label="Pickup Location (click map)" onSelect={(lat, lng, name) => setStartCoords({ lat, lng, name })} />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <LocationPicker label="Drop-off Location (click map)" onSelect={(lat, lng, name) => setEndCoords({ lat, lng, name })} />
                  </div>
                  {startCoords && endCoords && (
                    <p style={{ color: "#047857", fontWeight: "400", backgroundColor: "#ECFDF5", padding: "0.75rem", borderRadius: "6px", margin: "1rem 0", fontSize: "0.9rem" }}>
                      Estimated: {haversineEstimate(startCoords, endCoords).toFixed(2)} km × ₹{selectedCar.price_per_km}/km = ₹{(haversineEstimate(startCoords, endCoords) * selectedCar.price_per_km).toFixed(2)}
                    </p>
                  )}
                </>
              ) : (
                <div style={{ backgroundColor: "#F8FAFC", padding: "1rem", borderRadius: "10px", border: "1px solid #E2E8F0", marginBottom: "1.25rem" }}>
                  {/* START DESTINATION */}
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "400", fontSize: "0.85rem", color: "#334155" }}>
                       Pickup Location / Start Destination:
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Kolkata Airport / City Center" 
                      value={startPoint} 
                      onChange={(e) => setStartPoint(e.target.value)} 
                      style={textInputStyle} 
                    />
                  </div>

                  {/* END DESTINATION */}
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "400", fontSize: "0.85rem", color: "#334155" }}>
                       Drop-off Location / End Destination:
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Digha / Hotel Sunrise" 
                      value={endPoint} 
                      onChange={(e) => setEndPoint(e.target.value)} 
                      style={textInputStyle} 
                    />
                  </div>

                  {/* CALENDAR DATE SELECTORS */}
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "400", fontSize: "0.85rem", color: "#334155" }}>
                       Start Date:
                    </label>
                    <input 
                      type="date" 
                      value={startDate} 
                      min={todayStr}
                      onChange={(e) => setStartDate(e.target.value)} 
                      required 
                      style={datePickerStyle} 
                    />
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "400", fontSize: "0.85rem", color: "#334155" }}>
                       End Date:
                    </label>
                    <input 
                      type="date" 
                      value={endDate} 
                      min={startDate || todayStr}
                      onChange={(e) => setEndDate(e.target.value)} 
                      required 
                      style={datePickerStyle} 
                    />
                  </div>

                  <div style={{ fontWeight: "500", color: "#047857", fontSize: "1rem", backgroundColor: "#ECFDF5", padding: "0.65rem", borderRadius: "6px", border: "1px solid #A7F3D0" }}>
                    Total: ₹{calculateTotalPrice()}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
                <button 
                  type="button" 
                  onClick={() => setSelectedCar(null)} 
                  style={{ flex: 1, padding: "0.65rem", backgroundColor: "#F1F5F9", color: "#475569", border: "1px solid #CBD5E1", borderRadius: "6px", fontWeight: "300", cursor: "pointer", fontSize: "0.9rem" }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ flex: 1, padding: "0.65rem", backgroundColor: "#047857", color: "#FFFFFF", border: "none", borderRadius: "6px", fontWeight: "300", cursor: "pointer", fontSize: "0.9rem" }}
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const navButtonStyle = (bgColor, textColor, border = "none") => ({
  padding: "0.45rem 0.85rem",
  backgroundColor: bgColor,
  color: textColor,
  border: border,
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "0.825rem",
  fontWeight: "300",
  transition: "all 0.2s ease"
});

const modalInputStyle = {
  width: "100%",
  padding: "0.6rem",
  borderRadius: "6px",
  border: "1px solid #CBD5E1",
  color: "#0F172A",
  backgroundColor: "#FFFFFF",
  outline: "none",
  boxSizing: "border-box",
  fontSize: "0.9rem",
  fontWeight: "300"
};

const textInputStyle = {
  width: "100%",
  padding: "0.65rem 0.75rem",
  borderRadius: "6px",
  border: "1px solid #CBD5E1",
  color: "#0F172A",
  backgroundColor: "#FFFFFF",
  outline: "none",
  boxSizing: "border-box",
  fontSize: "0.9rem",
  fontWeight: "300"
};

const datePickerStyle = {
  width: "100%",
  padding: "0.65rem 0.75rem",
  borderRadius: "6px",
  border: "1px solid #CBD5E1",
  color: "#0F172A",
  backgroundColor: "#FFFFFF",
  outline: "none",
  boxSizing: "border-box",
  fontSize: "0.9rem",
  fontWeight: "400",
  fontFamily: "inherit",
  colorScheme: "light",
  cursor: "pointer"
};

export default HomePage;