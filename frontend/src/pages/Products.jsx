import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaTrash, FaPlus, FaBoxOpen } from 'react-icons/fa';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Form States
    const [formData, setFormData] = useState({ name: '', category: '', price: '', stockQuantity: 0 });
    const [stockAdjustment, setStockAdjustment] = useState({ id: null, current: 0, add: 0 });

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (error) {
                alert('Failed to delete');
            }
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                category: product.category,
                price: product.price,
                stockQuantity: product.stock_quantity
            });
        } else {
            setEditingProduct(null);
            setFormData({ name: '', category: '', price: '', stockQuantity: 0 });
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct._id}`, formData);
            } else {
                await api.post('/products', formData);
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (error) {
            alert('Operation failed');
        }
    };

    const openStockModal = (product) => {
        setStockAdjustment({ id: product._id, current: product.stock_quantity, add: 0 });
        setIsStockModalOpen(true);
    };

    const handleStockSubmit = async (e) => {
        e.preventDefault();
        try {
            const newQuantity = parseInt(stockAdjustment.current) + parseInt(stockAdjustment.add);
            await api.put(`/products/${stockAdjustment.id}`, { stockQuantity: newQuantity });
            setIsStockModalOpen(false);
            fetchProducts();
        } catch (error) {
            alert('Failed to update stock');
        }
    };

    if (loading) return <div>Loading...</div>;

    const ProductActions = ({ product }) => (
        <div className="flex gap-4">
            <button onClick={() => openStockModal(product)} className="text-green-600 hover:text-green-800 p-1" title="Add Stock">
                <FaBoxOpen size={18} />
            </button>
            <button onClick={() => handleOpenModal(product)} className="text-indigo-600 hover:text-indigo-800 p-1" title="Edit">
                <FaEdit size={18} />
            </button>
            <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-800 p-1" title="Delete">
                <FaTrash size={18} />
            </button>
        </div>
    );

    return (
        <div className="pb-20 md:pb-0">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Products</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="hidden md:flex bg-blue-600 text-white px-4 py-2 rounded items-center gap-2 hover:bg-blue-700 shadow-sm"
                >
                    <FaPlus /> Add Product
                </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map(product => (
                            <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">₹{product.price}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock_quantity < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {product.stock_quantity}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end">
                                    <ProductActions product={product} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {products.map(product => (
                    <div key={product._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-gray-900">{product.name}</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.category}</p>
                            <div className="flex items-baseline gap-3">
                                <span className="text-blue-600 font-bold">₹{product.price}</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${product.stock_quantity < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                    Stk: {product.stock_quantity}
                                </span>
                            </div>
                        </div>
                        <div>
                            <ProductActions product={product} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile FAB */}
            <button
                onClick={() => handleOpenModal()}
                className="md:hidden fixed bottom-20 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition-all z-20"
            >
                <FaPlus size={24} />
            </button>

            {/* Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input type="text" className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <input type="text" className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                    <input type="number" className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required step="0.01" />
                                </div>
                                {!editingProduct && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                        <input type="number" className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.stockQuantity} onChange={e => setFormData({ ...formData, stockQuantity: e.target.value })} required />
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors">Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Stock Adjustment Modal */}
            {isStockModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-2xl">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Adjust Stock</h3>
                        <div className="bg-gray-50 p-3 rounded-lg mb-4 text-center">
                            <span className="text-sm text-gray-500 block">Current Stock</span>
                            <span className="text-2xl font-bold text-gray-800">{stockAdjustment.current}</span>
                        </div>
                        <form onSubmit={handleStockSubmit}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Add Quantity (use negative to remove)</label>
                            <input
                                type="number"
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
                                value={stockAdjustment.add}
                                onChange={e => setStockAdjustment({ ...stockAdjustment, add: e.target.value })}
                                required
                                autoFocus
                            />
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsStockModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm transition-colors">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
