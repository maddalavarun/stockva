import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import HistoryPage from './pages/HistoryPage';

// Simple protective routing
const AdminRoute = ({ children }) => {
    const { user } = useAuth();
    if (user?.role !== 'admin') return <Navigate to="/login" />;
    return children;
};

const StaffRoute = ({ children }) => {
    const { user } = useAuth();
    if (user?.role !== 'staff' && user?.role !== 'admin') return <Navigate to="/login" />;
    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    <Route element={<Layout />}>
                        {/* Admin Routes */}
                        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                        <Route path="/admin/products" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                        <Route path="/admin/staff" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

                        {/* Staff Routes */}
                        <Route path="/staff" element={<StaffRoute><StaffDashboard /></StaffRoute>} />
                        <Route path="/staff/add-stock" element={<StaffRoute><StaffDashboard /></StaffRoute>} />

                        {/* Common Routes */}
                        <Route path="/history" element={<HistoryPage />} />

                        <Route path="/" element={<Navigate to="/login" />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
