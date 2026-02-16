import React, { useState, useEffect } from 'react';
import { getProducts, addStock } from '../services/api';
import {
    Plus,
    Search,
    Package,
    ArrowUpRight,
    Loader2,
    CheckCircle2,
    Minus
} from 'lucide-react';

const StaffDashboard = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [quantities, setQuantities] = useState({}); // { productId: value }
    const [updating, setUpdating] = useState({}); // { productId: loadingState }
    const [message, setMessage] = useState('');

    const fetchData = async () => {
        try {
            const { data } = await getProducts();
            setProducts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdate = async (productId) => {
        const qty = quantities[productId];
        if (!qty || qty <= 0) return;

        setUpdating(prev => ({ ...prev, [productId]: true }));
        try {
            await addStock({ product_id: productId, quantity: qty });
            setMessage(`Added ${qty} units to ${products.find(p => p._id === productId)?.product_name}`);
            setQuantities(prev => ({ ...prev, [productId]: '' }));
            fetchData();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setUpdating(prev => ({ ...prev, [productId]: false }));
        }
    };

    const filteredProducts = products.filter(p =>
        p.product_name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex h-full items-center justify-center">
            <Loader2 className="animate-spin text-primary-500" size={40} />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Stock Management</h1>
                    <p className="text-slate-400 mt-1">Add stock to existing products.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input pl-10 w-full md:w-64"
                    />
                </div>
            </div>

            {message && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3">
                    <CheckCircle2 size={20} />
                    <span className="font-medium">{message}</span>
                </div>
            )}

            {/* Product Inventory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((p) => (
                    <div key={p._id} className="card group hover:border-primary-500/30 transition-all duration-300">
                        <div className="flex items-start justify-between mb-6">
                            <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-primary-600/10 transition-colors">
                                <Package className="text-slate-400 group-hover:text-primary-500" size={24} />
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Current Stock</p>
                                <p className="text-2xl font-bold text-white">{p.current_stock}</p>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-6 line-clamp-1">{p.product_name}</h3>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Enter quantity"
                                    value={quantities[p._id] || ''}
                                    onChange={(e) => setQuantities({ ...quantities, [p._id]: e.target.value })}
                                    className="input flex-1 h-11"
                                    min="1"
                                />
                                <button
                                    onClick={() => handleUpdate(p._id)}
                                    disabled={updating[p._id] || !quantities[p._id]}
                                    className="btn btn-primary h-11 flex items-center justify-center min-w-[100px]"
                                >
                                    {updating[p._id] ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            <Plus size={20} className="mr-1" />
                                            Add
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredProducts.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <div className="flex justify-center mb-4 text-slate-700">
                            <Package size={64} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-400">No Products Found</h3>
                        <p className="text-slate-600 mt-2">Try searching for a different product name.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffDashboard;
