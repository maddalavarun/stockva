import React, { useState, useEffect } from 'react';
import { getAdminSummary, createStaff, addProduct, getProducts } from '../services/api';
import { useLocation } from 'react-router-dom';
import {
    Plus,
    UserPlus,
    Package,
    BarChart,
    Users,
    TrendingUp,
    Loader2,
    CheckCircle2
} from 'lucide-react';

const AdminDashboard = () => {
    const location = useLocation();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);

    // Forms
    const [staffData, setStaffData] = useState({ name: '', email: '', password: '' });
    const [productData, setProductData] = useState({ product_name: '', initial_stock: 0 });
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchData = async () => {
        try {
            const [sumRes, prodRes] = await Promise.all([
                getAdminSummary(),
                getProducts()
            ]);
            setSummary(sumRes.data);
            setProducts(prodRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        try {
            await createStaff(staffData);
            setMessage({ type: 'success', text: 'Staff account created successfully!' });
            setStaffData({ name: '', email: '', password: '' });
            fetchData();
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.message || err.message || 'Failed to create staff'
            });
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            await addProduct(productData);
            setMessage({ type: 'success', text: 'Product added successfully!' });
            setProductData({ product_name: '', initial_stock: 0 });
            fetchData();
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.message || err.message || 'Failed to add product'
            });
        }
    };

    const isMain = location.pathname === '/admin';
    const isProducts = location.pathname === '/admin/products' || isMain;
    const isStaff = location.pathname === '/admin/staff' || isMain;

    if (loading) return (
        <div className="flex h-full items-center justify-center">
            <Loader2 className="animate-spin text-primary-500" size={40} />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white">
                    {isMain ? 'Admin Dashboard' : isProducts ? 'Product Management' : 'Staff Management'}
                </h1>
                <p className="text-slate-400 mt-1">
                    {isMain ? 'Overview of your inventory and team.' : isProducts ? 'Add and monitor your products.' : 'Manage your staff members.'}
                </p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 border ${message.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : null}
                    <span className="font-medium">{message.text}</span>
                    <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto text-current opacity-50 hover:opacity-100">&times;</button>
                </div>
            )}

            {/* Stats Cards - Only on Dashboard or Products/Staff tabs occasionally */}
            {isMain && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card bg-gradient-to-br from-primary-600/20 to-transparent">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-primary-600/20 text-primary-400 rounded-xl">
                                <Package size={24} />
                            </div>
                            <TrendingUp size={20} className="text-emerald-500" />
                        </div>
                        <p className="text-slate-400 font-medium">New Products Today</p>
                        <h2 className="text-4xl font-bold text-white mt-1">{summary?.today_products || 0}</h2>
                    </div>

                    <div className="card bg-gradient-to-br from-emerald-600/20 to-transparent">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-xl">
                                <BarChart size={24} />
                            </div>
                        </div>
                        <p className="text-slate-400 font-medium">Stock Added Today</p>
                        <h2 className="text-4xl font-bold text-white mt-1">{summary?.today_stock_added || 0}</h2>
                    </div>

                    <div className="card bg-gradient-to-br from-purple-600/20 to-transparent">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-600/20 text-purple-400 rounded-xl">
                                <Users size={24} />
                            </div>
                        </div>
                        <p className="text-slate-400 font-medium">New Staff Today</p>
                        <h2 className="text-4xl font-bold text-white mt-1">{summary?.today_staff || 0}</h2>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Add Product Form */}
                {isProducts && (
                    <div className="card relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Package size={120} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Plus className="text-primary-500" size={24} />
                            Add New Product
                        </h3>
                        <form onSubmit={handleAddProduct} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Product Name</label>
                                <input
                                    type="text"
                                    required
                                    value={productData.product_name}
                                    onChange={(e) => setProductData({ ...productData, product_name: e.target.value })}
                                    placeholder="e.g. MacBook Pro M3"
                                    className="input w-full"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Initial Stock</label>
                                <input
                                    type="number"
                                    required
                                    value={productData.initial_stock}
                                    onChange={(e) => setProductData({ ...productData, initial_stock: e.target.value })}
                                    placeholder="0"
                                    className="input w-full"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-full">
                                Register Product
                            </button>
                        </form>
                    </div>
                )}

                {/* Create Staff Form */}
                {isStaff && (
                    <div className="card relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <UserPlus size={120} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <UserPlus className="text-emerald-500" size={24} />
                            Create Staff Account
                        </h3>
                        <form onSubmit={handleCreateStaff} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={staffData.name}
                                    onChange={(e) => setStaffData({ ...staffData, name: e.target.value })}
                                    placeholder="John Doe"
                                    className="input w-full"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={staffData.email}
                                    onChange={(e) => setStaffData({ ...staffData, email: e.target.value })}
                                    placeholder="john@example.com"
                                    className="input w-full"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={staffData.password}
                                    onChange={(e) => setStaffData({ ...staffData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="input w-full"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 w-full">
                                Create Account
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Quick View Table */}
            {isProducts && (
                <div className="card">
                    <h3 className="text-xl font-bold text-white mb-6">Current Stock Levels</h3>
                    <div className="table-container">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 text-sm">
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider">Product Name</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider">Stock Level</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {products.map((p) => (
                                    <tr key={p._id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 text-slate-200 font-medium">{p.product_name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.current_stock < 10 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                                                }`}>
                                                {p.current_stock} units
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {p.current_stock < 10 ? (
                                                <span className="text-red-500 text-xs font-bold animate-pulse">Low Stock</span>
                                            ) : (
                                                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Healthy</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-10 text-center text-slate-500 italic">No products registered yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
