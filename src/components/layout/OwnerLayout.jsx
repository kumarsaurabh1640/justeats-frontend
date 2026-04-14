import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ClipboardList, LayoutDashboard, LogOut, Menu, User, UtensilsCrossed, X } from 'lucide-react';

const navCls = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-orange-100 text-orange-600'
      : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
  }`;

export default function OwnerLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-56 bg-white border-r border-gray-200 flex flex-col shrink-0 h-screen transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
          <Link to="/owner/dashboard" className="flex items-center gap-2 font-bold text-orange-500 text-xl">
            <UtensilsCrossed className="w-6 h-6" />
            JustEats
          </Link>
          <button onClick={closeSidebar} className="lg:hidden text-gray-400 hover:text-gray-600 p-1" aria-label="Close sidebar">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavLink to="/owner/dashboard" className={navCls} onClick={closeSidebar}>
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </NavLink>
          <NavLink to="/owner/menu" className={navCls} onClick={closeSidebar}>
            <Menu className="w-4 h-4" /> Menu Manager
          </NavLink>
          <NavLink to="/owner/orders" className={navCls} onClick={closeSidebar}>
            <ClipboardList className="w-4 h-4" /> Orders
          </NavLink>
          <NavLink to="/owner/profile" className={navCls} onClick={closeSidebar}>
            <User className="w-4 h-4" /> Profile
          </NavLink>
        </nav>
        <div className="p-3 border-t border-gray-200 shrink-0">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-red-500 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content with mobile top bar */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-3 sticky top-0 z-30 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:text-orange-500 hover:bg-orange-50"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/owner/dashboard" className="flex items-center gap-2 font-bold text-orange-500 text-lg">
            <UtensilsCrossed className="w-5 h-5" />
            JustEats
          </Link>
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
