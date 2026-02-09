import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaBoxes, FaExclamationTriangle, FaHistory, FaClock, FaUser } from 'react-icons/fa';

const Dashboard = () => {
    const [stats, setStats] = useState({ total_products: 0, low_stock_count: 0, recent_stock_activity: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard');
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

    const RecentActivityItem = ({ activity }) => (
        <div className="flex justify-between items-center py-3 border-b last:border-0 border-gray-100">
            <div>
                <p className="font-medium text-gray-900">{activity.product_name}</p>
                <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1"><FaUser size={10} /> {activity.staff_name}</span>
                    <span className="flex items-center gap-1"><FaClock size={10} /> {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>
            <span className={`font-bold px-2 py-1 rounded text-sm ${activity.quantity_change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {activity.quantity_change > 0 ? '+' : ''}{activity.quantity_change}
            </span>
        </div>
    );

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Products</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.total_products}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <FaBoxes size={22} />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Low Stock Alerts</p>
                        <h3 className="text-3xl font-bold text-red-600 mt-1">{stats.low_stock_count}</h3>
                    </div>
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                        <FaExclamationTriangle size={22} />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Recent Activities</p>
                        <h3 className="text-3xl font-bold text-green-600 mt-1">{stats.recent_stock_activity.length}</h3>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                        <FaHistory size={22} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">Recent Stock Activity</h3>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Product</th>
                                <th className="px-6 py-3 font-semibold">Change</th>
                                <th className="px-6 py-3 font-semibold">Staff</th>
                                <th className="px-6 py-3 font-semibold">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recent_stock_activity.map((activity, idx) => (
                                <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{activity.product_name}</td>
                                    <td className={`px-6 py-4 font-bold ${activity.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {activity.quantity_change > 0 ? '+' : ''}{activity.quantity_change}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{activity.staff_name}</td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(activity.timestamp).toLocaleString()}</td>
                                </tr>
                            ))}
                            {stats.recent_stock_activity.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No recent activity found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden p-4">
                    {stats.recent_stock_activity.map((activity, idx) => (
                        <RecentActivityItem key={idx} activity={activity} />
                    ))}
                    {stats.recent_stock_activity.length === 0 && (
                        <p className="text-center text-gray-500 py-4">No recent activity</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
