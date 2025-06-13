import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerDashboard from "./pages/CustomerDashboard";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import "./index.css"; // Add this import

const App = () => (
      <AuthProvider>
        <div className="font-ios">
          <Toaster position="top-center" />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/customer-dashboard" element={<CustomerDashboard />} />
              <Route path="/delivery-dashboard" element={<DeliveryDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </AuthProvider>
);

export default App;