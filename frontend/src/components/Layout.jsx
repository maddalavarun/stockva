import React from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, LayoutDashboard, Plus, UserPlus, LogOut } from 'lucide-react';

const Layout = () => {
    const { user, loading, logoutUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent"></div>
        </div>
    );

    if (!user) return <Navigate to="/login" />;

    const isAdmin = user?.role === 'admin';

    const navItems = isAdmin ? [
        { path: '/admin', icon: LayoutDashboard, label: 'Home' },
        { path: '/admin/products', icon: Package, label: 'Products' },
        { path: '/admin/staff', icon: UserPlus, label: 'Staff' },
        { path: '/history', icon: Clock, label: 'History' },
    ] : [
        { path: '/staff', icon: Package, label: 'Stock' },
        { path: '/history', icon: Clock, label: 'History' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col max-w-screen overflow-x-hidden">
            {/* Top Header */}
            <header className="bg-white border-b border-gray-100 px-4 sm:px-5 py-3 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-500 rounded-xl flex items-center justify-center">
                        <Package size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-base sm:text-lg text-gray-900">StockPro</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={logoutUser} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Logout">
                        <LogOut size={16} />
                    </button>
                    <div className="relative">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs sm:text-sm border-2 border-white shadow-sm">
                            {user?.name ? user.name[0].toUpperCase() : '?'}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                </div>
            </header>

            {/* Main Content — padded for bottom nav */}
            <main className="flex-1 pb-20 overflow-x-hidden">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-1.5 z-30 flex justify-around safe-bottom">
                {navItems.map(item => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-0 ${isActive
                                    ? 'text-blue-500'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <item.icon size={18} />
                            <span className="text-[10px] font-semibold truncate">{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default Layout;
