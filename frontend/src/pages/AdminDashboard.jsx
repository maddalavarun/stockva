import React, { useState, useEffect } from 'react';
import { getAdminSummary, createStaff, addProduct, getProducts, getStaffList, addStock, deleteProduct } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Plus,
    UserPlus,
    Package,
    Users,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Clock,
    Trash2,
    Mail
} from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [staffMembers, setStaffMembers] = useState([]);

    const [staffData, setStaffData] = useState({ name: '', email: '', password: '' });
    const [productData, setProductData] = useState({ product_name: '', initial_stock: '' });
    const [message, setMessage] = useState({ type: '', text: '' });

    const [quantities, setQuantities] = useState({});
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState({});

    const fetchData = async () => {
        try {
            const [sumRes, prodRes, staffRes] = await Promise.all([
                getAdminSummary(),
                getProducts(),
                getStaffList()
            ]);
            setSummary(sumRes.data);
            setProducts(prodRes.data);
            setStaffMembers(staffRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const showMsg = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        try {
            await createStaff(staffData);
            showMsg('success', 'Staff account created!');
            setStaffData({ name: '', email: '', password: '' });
            fetchData();
        } catch (err) {
            showMsg('error', err.response?.data?.message || 'Failed to create staff');
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            await addProduct(productData);
            showMsg('success', 'Product added!');
            setProductData({ product_name: '', initial_stock: '' });
            fetchData();
        } catch (err) {
            showMsg('error', err.response?.data?.message || 'Failed to add product');
        }
    };

    const handleDeleteProduct = async (id, name) => {
        if (!window.confirm(`Delete "${name}"? History records will be preserved.`)) return;
        setDeleting(prev => ({ ...prev, [id]: true }));
        try {
            await deleteProduct(id);
            showMsg('success', `"${name}" deleted!`);
            fetchData();
        } catch (err) {
            showMsg('error', err.response?.data?.message || 'Failed to delete');
        } finally {
            setDeleting(prev => ({ ...prev, [id]: false }));
        }
    };

    const incrementQty = (id) => setQuantities(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    const decrementQty = (id) => setQuantities(prev => ({ ...prev, [id]: Math.max((prev[id] || 0) - 1, 0) }));

    const handleUpdateStock = async () => {
        const updates = Object.entries(quantities).filter(([_, qty]) => qty > 0);
        if (updates.length === 0) return;
        setUpdating(true);
        try {
            for (const [productId, qty] of updates) {
                await addStock({ product_id: productId, quantity: parseInt(qty) });
            }
            showMsg('success', `Updated ${updates.length} product(s)!`);
            setQuantities({});
            fetchData();
        } catch (err) {
            showMsg('error', 'Failed to update stock');
        } finally {
            setUpdating(false);
        }
    };

    const hasChanges = Object.values(quantities).some(q => q > 0);
    const productEmojis = ['🍎', '🍌', '🥑', '🍇', '📦', '🧃', '🥤', '🍕', '🎁', '🛒', '📱', '💻', '🖥️', '⌨️', '🖨️'];
    const getEmoji = (index) => productEmojis[index % productEmojis.length];

    const isMain = location.pathname === '/admin';
    const isProducts = location.pathname === '/admin/products';
    const isStaff = location.pathname === '/admin/staff';

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
    );

    return (
        <div className="px-4 sm:px-5 py-5">
            {/* Badge + Title */}
            <div className="mb-5">
                <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] sm:text-xs font-bold rounded-lg uppercase tracking-wider mb-2">
                    Admin Panel
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {isMain ? `Stock Management` : isProducts ? 'Product Management' : 'Staff Management'}
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                    {isMain ? `Admin: ${user?.name || 'Admin'} • Update quantities` : isProducts ? 'Add and manage products' : 'Create and manage staff accounts'}
                </p>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-medium ${message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    <span className="truncate">{message.text}</span>
                </div>
            )}

            {/* === MAIN DASHBOARD === */}
            {isMain && (
                <>
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
                        <div className="card text-center !p-3 sm:!p-5">
                            <p className="text-xl sm:text-2xl font-bold text-blue-500">{summary?.total_products || 0}</p>
                            <p className="text-[9px] sm:text-[10px] text-gray-400 font-semibold uppercase mt-0.5 sm:mt-1">Products</p>
                        </div>
                        <div className="card text-center !p-3 sm:!p-5">
                            <p className="text-xl sm:text-2xl font-bold text-emerald-500">{summary?.today_stock_added || 0}</p>
                            <p className="text-[9px] sm:text-[10px] text-gray-400 font-semibold uppercase mt-0.5 sm:mt-1">Stock Today</p>
                        </div>
                        <div className="card text-center !p-3 sm:!p-5">
                            <p className="text-xl sm:text-2xl font-bold text-purple-500">{summary?.total_staff || 0}</p>
                            <p className="text-[9px] sm:text-[10px] text-gray-400 font-semibold uppercase mt-0.5 sm:mt-1">Staff</p>
                        </div>
                    </div>

                    {/* Product List */}
                    <div className="card">
                        <div className="flex items-center justify-between px-1 pb-3 border-b border-gray-100">
                            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Product</span>
                            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Adjust Stock</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {products.map((product, index) => (
                                <div key={product._id} className="flex items-center justify-between py-3 sm:py-4 px-1 gap-2">
                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                        <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gray-50 rounded-xl flex items-center justify-center text-base sm:text-xl shrink-0">
                                            {getEmoji(index)}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{product.product_name}</h3>
                                            <p className="text-[10px] sm:text-xs text-gray-400">Stock: {product.current_stock}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                        <input type="number" value={quantities[product._id] || 0}
                                            onChange={(e) => setQuantities(prev => ({ ...prev, [product._id]: Math.max(0, parseInt(e.target.value) || 0) }))}
                                            className="qty-input" min="0"
                                        />
                                        <button onClick={() => decrementQty(product._id)} className="qty-btn">−</button>
                                        <button onClick={() => incrementQty(product._id)} className="qty-btn">+</button>
                                    </div>
                                </div>
                            ))}
                            {products.length === 0 && (
                                <div className="py-12 text-center">
                                    <Package size={36} className="mx-auto text-gray-200 mb-3" />
                                    <p className="text-gray-400 text-sm">No products yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 px-1">
                        <p className="text-[10px] sm:text-xs text-gray-400 italic flex items-center gap-1">
                            <Clock size={10} /> Last synced: Just now
                        </p>
                        <button onClick={() => navigate('/history')} className="text-[10px] sm:text-xs text-blue-500 font-semibold flex items-center gap-1 hover:text-blue-600">
                            View History <Clock size={10} />
                        </button>
                    </div>

                    {/* Update Stock CTA */}
                    <div className="fixed bottom-14 left-0 right-0 px-4 sm:px-5 pb-2 pt-3 bg-gradient-to-t from-gray-50 via-gray-50/95 to-transparent z-20">
                        <button onClick={handleUpdateStock} disabled={!hasChanges || updating}
                            className={`btn w-full h-12 sm:h-14 flex items-center justify-center gap-2 text-sm sm:text-base rounded-2xl ${hasChanges ? 'btn-primary' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
                        >
                            {updating ? <Loader2 className="animate-spin" size={18} /> : <><Package size={18} /> Update Stock</>}
                        </button>
                    </div>
                </>
            )}

            {/* === PRODUCTS PAGE === */}
            {isProducts && (
                <>
                    {/* Add Product Form */}
                    <div className="card mb-5">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Plus className="text-blue-500" size={16} />
                            Add New Product
                        </h3>
                        <form onSubmit={handleAddProduct} className="space-y-3">
                            <input type="text" required value={productData.product_name}
                                onChange={(e) => setProductData({ ...productData, product_name: e.target.value })}
                                placeholder="Product name" className="input"
                            />
                            <input type="number" value={productData.initial_stock}
                                onChange={(e) => setProductData({ ...productData, initial_stock: e.target.value })}
                                placeholder="Initial stock (0)" className="input" min="0"
                            />
                            <button type="submit" className="btn btn-primary w-full">Add Product</button>
                        </form>
                    </div>

                    {/* Product List with Delete */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm sm:text-base font-bold text-gray-900">All Products</h3>
                            <span className="text-[10px] sm:text-xs text-gray-400 font-semibold">{products.length} total</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {products.map((p, i) => (
                                <div key={p._id} className="flex items-center justify-between py-3 px-1 gap-2">
                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-50 rounded-xl flex items-center justify-center text-base sm:text-lg shrink-0">{getEmoji(i)}</div>
                                        <div className="min-w-0">
                                            <span className="font-medium text-gray-800 text-xs sm:text-sm truncate block">{p.product_name}</span>
                                            <p className="text-[10px] sm:text-xs text-gray-400">Stock: {p.current_stock}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                        <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg ${p.current_stock < 10 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {p.current_stock}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteProduct(p._id, p.product_name)}
                                            disabled={deleting[p._id]}
                                            className="p-1.5 sm:p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete product"
                                        >
                                            {deleting[p._id] ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {products.length === 0 && (
                                <div className="py-12 text-center">
                                    <Package size={36} className="mx-auto text-gray-200 mb-3" />
                                    <p className="text-gray-400 text-sm">No products yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* === STAFF PAGE === */}
            {isStaff && (
                <>
                    {/* Create Staff Form */}
                    <div className="card mb-5">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <UserPlus className="text-blue-500" size={16} />
                            Create Staff Account
                        </h3>
                        <form onSubmit={handleCreateStaff} className="space-y-3">
                            <input type="text" required value={staffData.name}
                                onChange={(e) => setStaffData({ ...staffData, name: e.target.value })}
                                placeholder="Full name" className="input"
                            />
                            <input type="email" required value={staffData.email}
                                onChange={(e) => setStaffData({ ...staffData, email: e.target.value })}
                                placeholder="Email address" className="input"
                            />
                            <input type="password" required value={staffData.password}
                                onChange={(e) => setStaffData({ ...staffData, password: e.target.value })}
                                placeholder="Password" className="input"
                            />
                            <button type="submit" className="btn btn-primary w-full">Create Account</button>
                        </form>
                    </div>

                    {/* Staff Members List */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm sm:text-base font-bold text-gray-900">Staff Members</h3>
                            <span className="text-[10px] sm:text-xs text-gray-400 font-semibold">{staffMembers.length} total</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {staffMembers.map((s) => (
                                <div key={s._id} className="flex items-center gap-2.5 sm:gap-3 py-3 px-1">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs sm:text-sm shrink-0">
                                        {s.name ? s.name[0].toUpperCase() : '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{s.name}</p>
                                        <p className="text-[10px] sm:text-xs text-gray-400 truncate flex items-center gap-1">
                                            <Mail size={9} />
                                            {s.email}
                                        </p>
                                    </div>
                                    <span className="text-[9px] sm:text-[10px] text-gray-300 font-medium uppercase shrink-0">Staff</span>
                                </div>
                            ))}
                            {staffMembers.length === 0 && (
                                <div className="py-12 text-center">
                                    <Users size={36} className="mx-auto text-gray-200 mb-3" />
                                    <p className="text-gray-400 text-sm">No staff members yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
