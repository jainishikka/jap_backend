import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./auth/Login";
import Signup from "./auth/Signup";
import LLogin from "./auth/LLogin";

import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import RegisteredUsersData from "./pages/RegisteredUsersData";
import FinalData from "./pages/FinalData";
import BookAppoEntry from "./pages/BookAppoEntry";

import ProtectedRoute from "./ProtectedRoute";

import "./index.css";

const App = () => {
  const [regisNumber, setRegistrationNumber] = useState(localStorage.getItem("registrationNumber"));

  return (
    <div>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LLogin />} />
        {/* <ProtectedRoute> */}
          <Route path="/signup" element={<ProtectedRoute><Signup /></ProtectedRoute>} />
          <Route path="/finalData" element={<FinalData />} />
          <Route path="/bookAppointment" element={<BookAppoEntry />} />
          {/* Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route
            path="/user-dashboard"
            element={<UserDashboard registrationNumber={regisNumber} />}
          />
          <Route
            path="/registered-users-data"
            element={<RegisteredUsersData />}
          />
        {/* </ProtectedRoute> */}
        {/* Catch-All Redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastContainer />
    </div>
  );
};

export default App;
