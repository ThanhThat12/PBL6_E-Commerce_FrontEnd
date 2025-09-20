// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "bootstrap/dist/css/bootstrap.min.css";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    // Bọc toàn bộ app trong GoogleOAuthProvider
    <GoogleOAuthProvider clientId="675831796221-gv53a00leksrq5f08lbds5kej9jjlm4q.apps.googleusercontent.com">
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
