import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { FaHome, FaBox, FaHistory, FaUserCog, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Top Bar for Desktop */}
            <header className="hidden md:flex bg-white shadow-sm px-6 py-4 justify-between items-center z-20 border-b border-gray-100">
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FaBox className="text-blue-600" /> Stock Manager
                </h1>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-gray-700">{user.username}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">{user.role}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Logout"
                    >
                        <FaSignOutAlt size={18} />
                    </button>
                </div>
            </header>

            {/* Top Bar for Mobile */}
            <header className="md:hidden bg-white shadow-sm px-4 py-3 flex justify-between items-center z-20 border-b border-gray-100 fixed top-0 w-full">
                <h1 className="text-lg font-bold text-gray-800">Stock App</h1>
                <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase font-bold">{user.role}</span>
                    <button onClick={handleLogout} className="text-gray-500 hover:text-red-500"><FaSignOutAlt /></button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden pt-14 md:pt-0">
                {/* Sidebar (Desktop) */}
                <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col overflow-y-auto shadow-sm">
                    <nav className="p-4 space-y-1 flex-1">
                        <DesktopNavLink to="/" icon={<FaHome />} label="Dashboard" active={isActive('/')} />
                        <DesktopNavLink to="/products" icon={<FaBox />} label="Products & Stock" active={isActive('/products')} />
                        <DesktopNavLink to="/history" icon={<FaHistory />} label="Stock History" active={isActive('/history')} />
                        {user.role === 'admin' && (
                            <>
                                <div className="mt-8 mb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Admin</div>
                                <DesktopNavLink to="/register-staff" icon={<FaUserCog />} label="Manage Staff" active={isActive('/register-staff')} />
                            </>
                        )}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Bottom Navigation (Mobile) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex justify-around items-center px-1 py-2 z-30 pb-safe">
                <MobileNavLink to="/" icon={<FaHome size={20} />} label="Home" active={isActive('/')} />
                <MobileNavLink to="/products" icon={<FaBox size={20} />} label="Stock" active={isActive('/products')} />
                <MobileNavLink to="/history" icon={<FaHistory size={20} />} label="History" active={isActive('/history')} />
                {user.role === 'admin' && (
                    <MobileNavLink to="/register-staff" icon={<FaUserCog size={20} />} label="Admin" active={isActive('/register-staff')} />
                )}
            </nav>
        </div>
    );
};

const DesktopNavLink = ({ to, icon, label, active }) => (
    <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${active
                ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 icon-hover-slide'
            }`}
    >
        <span className={active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}>{icon}</span>
        {label}
    </Link>
);

const MobileNavLink = ({ to, icon, label, active }) => (
    <Link
        to={to}
        className={`flex flex-col items-center justify-center p-2 rounded-lg w-full transition-colors ${active ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'
            }`}
    >
        <div className="mb-1">{icon}</div>
        <span className="text-[10px] font-medium leading-none">{label}</span>
    </Link>
);

export default Navbar;
