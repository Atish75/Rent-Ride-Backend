import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import BookedCars from './booked.jsx'
import Addcar from './car_card_ui.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx';
import ProfilePage from './Profile.jsx';
import CarTracker from './CarTracker.jsx';
import MobileLocationSender from './mobilelocationsender.jsx';
// 🔑 Dono ko same file se ek sath import karein (Path: same folder)
import { AuthProvider, ProtectedRoute } from './AuthContext.jsx'; 
import TransactionHistory from './Transaction_history.jsx';
import DriverDashboard from './DriverDashboard.jsx';
import RoleSelect from './roleselect.jsx';
import OwnerDashboard from './CarOwner.jsx';
import BookingHistory from './BookingHistory.jsx';
import EarningsDashboard from './EarningDashboard.jsx';
import { API_BASE_URL } from './config';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/add-cars" element={<Addcar />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/track/:carId" element={<CarTracker />} />
          <Route path="/send-location/:carId" element={<MobileLocationSender />} />
          <Route path="/role-select" element={<ProtectedRoute><RoleSelect /></ProtectedRoute>} />
          <Route path="/driver-dashboard" element={<ProtectedRoute><DriverDashboard /></ProtectedRoute>} />          
          <Route path="/owner-dashboard" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/booking-history" element={<ProtectedRoute><BookingHistory endpoint="/booking-history/" title="📜 My Trip History" /></ProtectedRoute>} />
          <Route path="/driver-history" element={<ProtectedRoute><BookingHistory endpoint="/driver/booking-history/" title="📜 Completed Rides" /></ProtectedRoute>} />
          <Route path="/owner-history" element={<ProtectedRoute><BookingHistory endpoint="/owner/booking-history/" title="📜 Rental History" /></ProtectedRoute>} />
          <Route path="/driver-earnings" element={<ProtectedRoute><EarningsDashboard endpoint="/driver/earnings/" title="💰 Driver Earnings" sharePercent={25} /></ProtectedRoute>} />
          <Route path="/owner-earnings" element={<ProtectedRoute><EarningsDashboard endpoint="/owner/earnings/" title="💰 Owner Earnings" sharePercent={67} /></ProtectedRoute>} />

          {/* Secure/Protected Route */}
          <Route 
            path="/booked-cars" 
            element={
              <ProtectedRoute>
                <BookedCars />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)