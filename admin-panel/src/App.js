import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import SignIn from "./pages/Login/SignIn";
import Home from "./pages/Dashboard/Home";
import UserProfiles from "./pages/Admins/UserProfiles";
import AppLayout from "./layout/AppLayout";
import ChefPage from "./pages/Dashboard/ChefPage";
import Configuration from "./pages/Configuration";
import ContactItemsPage from "./pages/Contact/Items";
import ContactTypesPage from "./pages/Contact/Types";
import SliderImages from "./pages/SliderImages";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("authToken");
  });

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
          <Route path="contact/types" element={<ContactTypesPage />} />
          <Route path="contact/items" element={<ContactItemsPage />} />
          <Route path="configuration" element={<Configuration />} />
          <Route path="slider-images" element={<SliderImages />} />
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
