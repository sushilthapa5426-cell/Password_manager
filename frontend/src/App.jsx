import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import AddPassword from "./pages/AddPassword/AddPassword";
import MyPassword from "./pages/MyPassword/MyPassword";
import PasswordHistory from "./pages/PasswordHistory/PasswordHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout/Layout";
import { isLoggedIn } from "./utils/api";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate to={isLoggedIn() ? "/dashboard" : "/login"} replace />
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Protected — Layout adds Sidebar to all child routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-password" element={<AddPassword />} />
          <Route path="/my-password" element={<MyPassword />} />
          <Route path="/password-history" element={<PasswordHistory />} />
        </Route>
      </Routes>
      <Toaster position="top-center" />
    </BrowserRouter>
  );
}
