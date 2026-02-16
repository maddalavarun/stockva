import React, { useState, useEffect } from 'react';
import { getHistory } from '../services/api';
import {
    History,
    Search,
    Calendar,
    User,
    ArrowUp,
    Download,
    Loader2,
    Filter
} from 'lucide-react';
import { format } from 'date-fns';

const HistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const fetchHistory = async () => {
        try {
            const { data } = await getHistory(search, selectedDate);
            setHistory(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
        const interval = setInterval(fetchHistory, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [search, selectedDate]);

    const handleExport = () => {
        // Simple CSV Export
        const headers = ["Date", "Staff Name", "Product", "Quantity Added"];
        const rows = history.map(h => [
            format(new Date(h.date_time), 'yyyy-MM-dd hh:mm a'),
            h.staff_name,
            h.product_name,
            h.quantity_added
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `stock_history_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    if (loading && !history.length) return (
        <div className="flex h-full items-center justify-center">
            <Loader2 className="animate-spin text-primary-500" size={40} />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <History className="text-primary-500" />
                        Stock History
                    </h1>
                    <p className="text-slate-400 mt-1">Audit log of all stock updates.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="btn btn-outline flex items-center gap-2"
                    >
                        <Download size={18} />
                        <span className="hidden sm:inline">Export CSV</span>
                    </button>

                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="input pl-10 w-full sm:w-44"
                        />
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search product..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input pl-10 w-full sm:w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="card border-slate-800/50">
                <div className="table-container">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                <th className="px-6 py-5">Date & Time</th>
                                <th className="px-6 py-5">Staff Member</th>
                                <th className="px-6 py-5">Product Name</th>
                                <th className="px-6 py-5 text-center">Status</th>
                                <th className="px-6 py-5 text-right">Qty Added</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {history.map((h) => (
                                <tr key={h._id} className="hover:bg-slate-800/20 transition-all duration-200">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <Calendar size={14} className="text-slate-500" />
                                            {format(new Date(h.date_time), 'MMM dd, yyyy · hh:mm a')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-primary-400">
                                                {h.staff_name ? h.staff_name[0].toUpperCase() : '?'}
                                            </div>
                                            <span className="text-slate-200 font-medium">{h.staff_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-slate-200 font-semibold">{h.product_name}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center">
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-xs font-bold">
                                                <ArrowUp size={12} />
                                                Refill
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <span className="text-white font-mono font-bold text-lg">+{h.quantity_added}</span>
                                    </td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-500">
                                        <History size={48} className="mx-auto mb-4 opacity-10" />
                                        No history records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;
