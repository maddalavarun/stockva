import React, { useState, useEffect } from 'react';
import { getProducts, addStock } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Package,
    Loader2,
    Clock,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

const StaffDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantities, setQuantities] = useState({});
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [lastSync, setLastSync] = useState(new Date());

    const fetchData = async () => {
        try {
            const { data } = await getProducts();
            setProducts(data);
            setLastSync(new Date());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const incrementQty = (id) => {
        setQuantities(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    };

    const decrementQty = (id) => {
        setQuantities(prev => ({ ...prev, [id]: Math.max((prev[id] || 0) - 1, 0) }));
    };

    const handleUpdateStock = async () => {
        const updates = Object.entries(quantities).filter(([_, qty]) => qty > 0);
        if (updates.length === 0) return;

        setUpdating(true);
        try {
            for (const [productId, qty] of updates) {
                await addStock({ product_id: productId, quantity: parseInt(qty) });
            }
            setMessage({ type: 'success', text: `Updated ${updates.length} product(s) successfully!` });
            setQuantities({});
            fetchData();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update stock' });
        } finally {
            setUpdating(false);
        }
    };

    const timeSinceSync = () => {
        const diff = Math.floor((new Date() - lastSync) / 1000);
        if (diff < 60) return 'Just now';
        return `${Math.floor(diff / 60)} min${Math.floor(diff / 60) > 1 ? 's' : ''} ago`;
    };

    const hasChanges = Object.values(quantities).some(q => q > 0);
    const productEmojis = ['🍎', '🍌', '🥑', '🍇', '📦', '🧃', '🥤', '🍕', '🎁', '🛒', '📱', '💻', '🖥️', '⌨️', '🖨️'];
    const getEmoji = (index) => productEmojis[index % productEmojis.length];

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
                    {user?.role === 'admin' ? 'Admin Panel' : 'Staff Panel'}
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Stock Management – {user?.name || 'User'}
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                    Dashboard: {user?.role === 'admin' ? 'Admin' : 'Staff'} • Update quantities
                </p>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-medium ${message.type === 'success'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {message.text}
                </div>
            )}

            {/* Product List */}
            <div className="card">
                {/* Header */}
                <div className="flex items-center justify-between px-1 pb-3 border-b border-gray-100">
                    <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Product</span>
                    <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Adjust Stock</span>
                </div>

                {/* Product Rows */}
                <div className="divide-y divide-gray-50">
                    {products.map((product, index) => (
                        <div key={product._id} className="flex items-center justify-between py-3 sm:py-4 px-1 gap-2">
                            {/* Product Info */}
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gray-50 rounded-xl flex items-center justify-center text-base sm:text-xl shrink-0">
                                    {getEmoji(index)}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{product.product_name}</h3>
                                    <p className="text-[10px] sm:text-xs text-gray-400">
                                        Stock: {product.current_stock}
                                    </p>
                                </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                <input
                                    type="number"
                                    value={quantities[product._id] || 0}
                                    onChange={(e) => setQuantities(prev => ({
                                        ...prev,
                                        [product._id]: Math.max(0, parseInt(e.target.value) || 0)
                                    }))}
                                    className="qty-input"
                                    min="0"
                                />
                                <button onClick={() => decrementQty(product._id)} className="qty-btn">−</button>
                                <button onClick={() => incrementQty(product._id)} className="qty-btn">+</button>
                            </div>
                        </div>
                    ))}

                    {products.length === 0 && (
                        <div className="py-12 text-center">
                            <Package size={36} className="mx-auto text-gray-200 mb-3" />
                            <p className="text-gray-400 text-sm">No products available yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Info */}
            <div className="flex items-center justify-between mt-4 px-1">
                <p className="text-[10px] sm:text-xs text-gray-400 italic flex items-center gap-1">
                    <Clock size={10} />
                    Last synced: {timeSinceSync()}
                </p>
                <button
                    onClick={() => navigate('/history')}
                    className="text-[10px] sm:text-xs text-blue-500 font-semibold flex items-center gap-1 hover:text-blue-600"
                >
                    View History
                    <Clock size={10} />
                </button>
            </div>

            {/* Update Stock CTA — above bottom nav */}
            <div className="fixed bottom-14 left-0 right-0 px-4 sm:px-5 pb-2 pt-3 bg-gradient-to-t from-gray-50 via-gray-50/95 to-transparent z-20">
                <button
                    onClick={handleUpdateStock}
                    disabled={!hasChanges || updating}
                    className={`btn w-full h-12 sm:h-14 flex items-center justify-center gap-2 text-sm sm:text-base rounded-2xl transition-all ${hasChanges
                            ? 'btn-primary'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                        }`}
                >
                    {updating ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <>
                            <Package size={18} />
                            Update Stock
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default StaffDashboard;
