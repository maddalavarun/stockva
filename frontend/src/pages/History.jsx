import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaClock, FaUser } from 'react-icons/fa';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/history');
                setHistory(res.data);
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div className="p-4 text-center text-gray-500">Loading History...</div>;

    const ActionBadge = ({ action }) => {
        let colorClass = 'bg-gray-100 text-gray-800';
        if (action === 'create') colorClass = 'bg-green-100 text-green-800';
        else if (action === 'delete') colorClass = 'bg-red-100 text-red-800';
        else if (action === 'update_stock') colorClass = 'bg-blue-100 text-blue-800';

        return (
            <span className={`px-2 py-1 rounded text-xs uppercase font-bold tracking-wide ${colorClass}`}>
                {action.replace('_', ' ')}
            </span>
        );
    };

    return (
        <div className="pb-20 md:pb-0">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Stock History</h2>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Timestamp</th>
                            <th className="px-6 py-3 font-semibold">Product</th>
                            <th className="px-6 py-3 font-semibold">Action</th>
                            <th className="px-6 py-3 font-semibold">Qty Change</th>
                            <th className="px-6 py-3 font-semibold">Staff</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {history.map((record, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                    {new Date(record.timestamp).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {record.product_name}
                                </td>
                                <td className="px-6 py-4">
                                    <ActionBadge action={record.action} />
                                </td>
                                <td className={`px-6 py-4 font-bold ${record.quantity_change > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {record.quantity_change !== 0 ? (record.quantity_change > 0 ? '+' : '') + record.quantity_change : '-'}
                                </td>
                                <td className="px-6 py-4 text-gray-700">
                                    {record.staff_name}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {history.map((record, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-gray-900">{record.product_name}</h4>
                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                    <FaClock size={10} /> {new Date(record.timestamp).toLocaleString()}
                                </div>
                            </div>
                            <ActionBadge action={record.action} />
                        </div>

                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                                <FaUser size={10} className="text-gray-400" /> By {record.staff_name}
                            </div>
                            <span className={`font-bold ${record.quantity_change > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {record.quantity_change !== 0 ? (record.quantity_change > 0 ? '+' : '') + record.quantity_change : '0'} Qty
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default History;
