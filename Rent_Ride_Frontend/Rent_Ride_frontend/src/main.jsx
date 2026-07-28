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