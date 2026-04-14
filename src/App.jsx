import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerLayout from './components/layout/CustomerLayout';
import OwnerLayout from './components/layout/OwnerLayout';

import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';

import Home from './pages/customer/Home';
import RestaurantDetail from './pages/customer/RestaurantDetail';
import Cart from './pages/customer/Cart';
import Orders from './pages/customer/Orders';
import Profile from './pages/customer/Profile';

import Dashboard from './pages/owner/Dashboard';
import MenuManager from './pages/owner/MenuManager';
import OrderManager from './pages/owner/OrderManager';
import OwnerProfile from './pages/owner/Profile';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Customer */}
      <Route element={<ProtectedRoute role="customer" />}>
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Owner */}
      <Route element={<ProtectedRoute role="owner" />}>
        <Route element={<OwnerLayout />}>
          <Route path="/owner/dashboard" element={<Dashboard />} />
          <Route path="/owner/menu" element={<MenuManager />} />
          <Route path="/owner/orders" element={<OrderManager />} />
          <Route path="/owner/profile" element={<OwnerProfile />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

