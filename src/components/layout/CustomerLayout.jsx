import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Home, LogOut, Menu, Package, ShoppingCart, UtensilsCrossed, User, X } from 'lucide-react';

const navCls = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-orange-100 text-orange-600'
      : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
  }`;

export default function CustomerLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const close = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-orange-500 text-xl">
            <UtensilsCrossed className="w-6 h-6" />
            JustEats
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={navCls}>
              <Home className="w-4 h-4" /> Home
            </NavLink>
            <NavLink to="/cart" className={navCls}>
              <ShoppingCart className="w-4 h-4" /> Cart
            </NavLink>
            <NavLink to="/orders" className={navCls}>
              <Package className="w-4 h-4" /> Orders
            </NavLink>
            <NavLink to="/profile" className={navCls}>
              <User className="w-4 h-4" /> Profile
            </NavLink>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-red-500 hover:bg-red-50 ml-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-orange-500 hover:bg-orange-50"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            <NavLink to="/" end className={navCls} onClick={close}>
              <Home className="w-4 h-4" /> Home
            </NavLink>
            <NavLink to="/cart" className={navCls} onClick={close}>
              <ShoppingCart className="w-4 h-4" /> Cart
            </NavLink>
            <NavLink to="/orders" className={navCls} onClick={close}>
              <Package className="w-4 h-4" /> Orders
            </NavLink>
            <NavLink to="/profile" className={navCls} onClick={close}>
              <User className="w-4 h-4" /> Profile
            </NavLink>
            <button
              onClick={() => { close(); handleLogout(); }}
              className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-red-500 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        )}
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
