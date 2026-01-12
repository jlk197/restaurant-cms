import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import SignIn from "./pages/Login/SignIn";
import Home from "./pages/Dashboard/Home";
import UserProfiles from "./pages/Admins/UserProfiles";
import AppLayout from "./layout/AppLayout";
import ChefPage from "./pages/Dashboard/ChefPage";
import ContactPage from "./pages/Contact/Items/index";
import Configuration from "./pages/Configuration/index";
import PagesPage from "./pages/Dashboard/PagesPage";
import MenuPage from "./pages/Dashboard/MenuPage";
import PageItemPage from "./pages/Dashboard/PageItemPage";
import ContentPage from "./pages/Dashboard/ContentPage";
import CurrencyPage from "./pages/Dashboard/CurrencyPage";

function App() {
  const isTokenValid = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      console.log("Token expiration time:", decoded.exp);
      console.log("Current time:", currentTime);
      console.log("Token is valid:", decoded.exp > currentTime);
      if (decoded.exp < currentTime) {
        localStorage.removeItem("authToken");
        setIsLoggedIn(false);
      }
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem("authToken");
    return token && isTokenValid(token);
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token || !isTokenValid(token)) {
      localStorage.removeItem("authToken");
      setIsLoggedIn(false);
    }
  }, []);

  const handleLoginSuccess = (token) => {
    localStorage.setItem("authToken", token);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
  };

  const ProtectedRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" replace />;
  };

  return (
    <BrowserRouter basename="/admin">
      <Routes>
        <Route
          path="/login"
          element={
            !isLoggedIn ? (
              <SignIn onLoginSuccess={handleLoginSuccess} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Home onLogout={handleLogout} />} />
          <Route path="administrators" element={<UserProfiles />} />
          <Route path="chef" element={<ChefPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="configuration" element={<Configuration/>} />
          <Route path="pages" element={<PagesPage/>} />
          <Route path="menu" element={<MenuPage/>} />
          <Route path="page-item" element={<PageItemPage/>} />
          <Route path="page-content" element={<ContentPage/>} />
          <Route path="currency" element={<CurrencyPage/>} />



        </Route>

        <Route
          path="*"
          element={
            <Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
