import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Users,
    History,
    LogOut,
    PlusCircle,
    BarChart,
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logoutUser } = useAuth();

    const adminLinks = [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/products', icon: Package, label: 'Products' },
        { to: '/admin/staff', icon: Users, label: 'Staff' },
        { to: '/history', icon: History, label: 'History' },
    ];

    const staffLinks = [
        { to: '/staff', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/staff/add-stock', icon: PlusCircle, label: 'Add Stock' },
        { to: '/history', icon: History, label: 'History' },
    ];

    const links = user?.role === 'admin' ? adminLinks : staffLinks;

    return (
        <>
            {/* Backdrop for mobile */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            <aside className={cn(
                "fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-primary-600 flex items-center gap-2">
                            <BarChart size={28} />
                            StockPro
                        </h1>
                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">
                            {user?.role} Management
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 mt-4 space-y-1 overflow-y-auto">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={() => window.innerWidth < 1024 && onClose()}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-primary-50 text-primary-600 font-semibold"
                                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                            )}
                        >
                            <link.icon size={20} className="transition-colors group-hover:text-primary-500" />
                            <span className="font-medium">{link.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold shrink-0">
                            {user?.name ? user.name[0].toUpperCase() : '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logoutUser}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
