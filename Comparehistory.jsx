import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    HiOutlineScale, HiOutlineTrash, HiOutlineClock, HiOutlineArrowRight,
    HiOutlineRefresh, HiOutlinePlus, HiOutlineSearch, HiOutlineX,
} from "react-icons/hi";

const STORAGE_KEY = "ch_compare_history";

const getHistory = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
};

export const saveCompareToHistory = (ids, products) => {
    const entry = {
        id: Date.now(),
        ids,
        products: products.map((p) => ({ _id: p._id, title: p.title, brand: p.brand, price: p.price, image: p.images?.[0], productScore: p.productScore })),
        savedAt: new Date().toISOString(),
    };
    const history = [entry, ...getHistory().filter((h) => h.ids.join(",") !== ids.join(","))].slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

export default function CompareHistory() {
    const navigate = useNavigate();
    const [history, setHistory] = useState(getHistory());
    const [search, setSearch] = useState("");

    const remove = (id) => {
        const next = history.filter((h) => h.id !== id);
        setHistory(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    };

    const clearAll = () => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    const filtered = search.trim()
        ? history.filter((h) => h.products.some((p) => p.title?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase())))
        : history;

    return (
        <>
            <style>{`
                @keyframes fadeSlideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
                .animate-in { animation: fadeSlideUp 0.4s ease both; }
            `}</style>

            <div className="animate-in max-w-4xl mx-auto space-y-8">

                <div className="flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <HiOutlineScale className="text-primary" />
                            <span className="text-xs text-primary font-black uppercase tracking-widest">Compare</span>
                        </div>
                        <h2 className="text-3xl font-black">Comparison History</h2>
                        <p className="text-gray-500 text-sm mt-1">{history.length} saved comparison{history.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link to="/products" className="flex items-center gap-2 text-xs font-bold border border-primary/40 text-primary px-4 py-2.5 rounded-xl hover:bg-primary/10 transition-all">
                            <HiOutlinePlus /> New Comparison
                        </Link>
                        {history.length > 0 && (
                            <button onClick={clearAll} className="text-xs font-bold border border-gray-700 text-gray-500 hover:border-rose-500/50 hover:text-rose-400 px-4 py-2.5 rounded-xl transition-all">
                                Clear All
                            </button>
                        )}
                    </div>
                </div>

                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
                        <div className="w-20 h-20 rounded-3xl bg-gray-800/60 border border-gray-700 flex items-center justify-center">
                            <HiOutlineScale className="text-4xl text-gray-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black mb-2">No comparisons yet</h3>
                            <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                Your past comparisons will appear here so you can revisit them anytime.
                            </p>
                        </div>
                        <Link to="/products" className="btn btn-primary flex items-center gap-2">
                            <HiOutlineSearch /> Find Products to Compare
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="relative">
                            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-gray-900/60 border border-gray-800 rounded-xl pl-9 pr-9 py-2.5 text-sm placeholder-gray-600 focus:border-primary/50 focus:outline-none"
                                placeholder="Search comparisons…" />
                            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><HiOutlineX className="text-sm" /></button>}
                        </div>

                        <div className="space-y-4">
                            {filtered.map((entry, i) => (
                                <div key={entry.id} className="glass-card p-5 hover:border-gray-600 transition-all"
                                    style={{ animation: "fadeSlideUp 0.35s ease both", animationDelay: `${i * 50}ms` }}>
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div>
                                            <div className="text-[10px] text-gray-600 font-bold flex items-center gap-1 mb-1">
                                                <HiOutlineClock className="text-xs" />
                                                {new Date(entry.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                            </div>
                                            <div className="text-xs text-gray-500 font-bold">{entry.products.length} products compared</div>
                                        </div>
                                        <button onClick={() => remove(entry.id)}
                                            className="w-7 h-7 rounded-full border border-gray-700 flex items-center justify-center text-gray-500 hover:border-rose-500/50 hover:text-rose-400 transition-all flex-shrink-0">
                                            <HiOutlineTrash className="text-xs" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-1">
                                        {entry.products.map((p, pi) => (
                                            <div key={p._id} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                                                {pi > 0 && <span className="text-gray-700 text-xs font-black absolute -left-2">vs</span>}
                                                <div className="relative">
                                                    <img src={p.image} alt={p.title}
                                                        className="w-14 h-14 object-contain rounded-xl bg-gray-900 border border-gray-800 p-1" />
                                                    {p.productScore > 0 && (
                                                        <div className="absolute -bottom-1.5 -right-1.5 text-[9px] font-black bg-gray-900 border border-gray-700 px-1.5 py-0.5 rounded-full text-primary">
                                                            {p.productScore}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-[10px] font-bold text-center max-w-[72px] truncate">{p.brand}</div>
                                                <div className="text-[11px] font-black text-white">${Number(p.price).toFixed(0)}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <Link
                                        to={`/comparison?ids=${entry.ids.join(",")}`}
                                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-primary/40 text-primary text-xs font-black hover:bg-primary/10 transition-all">
                                        <HiOutlineRefresh /> Re-run Comparison <HiOutlineArrowRight />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}