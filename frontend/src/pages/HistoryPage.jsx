import React, { useState, useEffect } from 'react';
import { getHistory } from '../services/api';
import {
    Clock,
    Search,
    Calendar,
    ArrowUp,
    Download,
    Loader2,
    Package
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
        const interval = setInterval(fetchHistory, 10000);
        return () => clearInterval(interval);
    }, [search, selectedDate]);

    const handleExport = () => {
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
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `stock_history_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    // Group history by staff + time (same minute = same batch)
    const groupHistory = () => {
        const groups = [];
        const keyMap = {};

        history.forEach(entry => {
            const time = format(new Date(entry.date_time), 'hh:mm a');
            const key = `${entry.staff_name}_${time}`;

            if (keyMap[key] !== undefined) {
                groups[keyMap[key]].items.push(entry);
            } else {
                keyMap[key] = groups.length;
                groups.push({
                    staffName: entry.staff_name,
                    time,
                    items: [entry]
                });
            }
        });

        return groups;
    };

    const groups = groupHistory();
    const staffColors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
    const getColor = (name) => staffColors[name.charCodeAt(0) % staffColors.length];

    if (loading && !history.length) return (
        <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
    );

    return (
        <div className="px-4 sm:px-5 py-5">
            {/* Title */}
            <div className="mb-5">
                <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] sm:text-xs font-bold rounded-lg uppercase tracking-wider mb-2">
                    Audit Log
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="text-blue-500" size={20} />
                    Stock History
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">View all stock updates.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 mb-5">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                        type="text"
                        placeholder="Search product..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input pl-8"
                    />
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-1 sm:flex-none">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="input pl-8 sm:w-44"
                        />
                    </div>
                    <button onClick={handleExport} className="btn btn-outline flex items-center justify-center gap-1.5 shrink-0 text-xs sm:text-sm">
                        <Download size={14} />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </div>
            </div>

            {/* Grouped History Cards */}
            <div className="space-y-3 sm:space-y-4">
                {groups.map((group, idx) => (
                    <div key={idx} className="card">
                        {/* Staff + Time Header */}
                        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100">
                            <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${getColor(group.staffName)} flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-sm shrink-0`}>
                                    {group.staffName[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{group.staffName}</h3>
                                    <p className="text-[10px] text-gray-400">{group.items.length} item{group.items.length > 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-400 flex items-center gap-1 shrink-0">
                                <Clock size={10} />
                                {group.time}
                            </p>
                        </div>

                        {/* Items Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                            {group.items.map((entry) => (
                                <div key={entry._id} className="bg-gray-50 rounded-xl p-2.5 sm:p-3 border border-gray-100 hover:border-blue-200 transition-colors">
                                    <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{entry.product_name}</p>
                                    <span className="text-emerald-500 font-bold text-xs sm:text-sm flex items-center gap-0.5 mt-1">
                                        <ArrowUp size={10} />
                                        +{entry.quantity_added}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {history.length === 0 && (
                    <div className="card py-14 text-center">
                        <Package size={36} className="mx-auto text-gray-200 mb-3" />
                        <p className="text-gray-400 text-xs sm:text-sm">No records found for this date.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;
