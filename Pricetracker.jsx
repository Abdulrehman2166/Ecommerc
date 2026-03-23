import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
    HiOutlineArrowLeft, HiOutlineBell, HiOutlineTrendingDown,
    HiOutlineTrendingUp, HiOutlineSparkles, HiOutlineShoppingCart,
    HiOutlineStar, HiOutlineRefresh, HiOutlineCheckCircle, HiOutlineCash,
} from "react-icons/hi";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from "recharts";

const SCORE_COLOR = (v) => v >= 80 ? "#10b981" : v >= 60 ? "#f59e0b" : "#ef4444";

// Custom chart tooltip
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm shadow-2xl">
            <div className="text-gray-400 text-xs mb-1">{label}</div>
            <div className="font-black text-white">${Number(payload[0].value).toFixed(2)}</div>
        </div>
    );
};

export default function PriceTracker() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [product, setProduct] = useState(null);
    const [history, setHistory] = useState([]);
    const [tracking, setTracking] = useState(false);
    const [alertPrice, setAlertPrice] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [pRes, hRes, tRes] = await Promise.allSettled([
                    api.get(`/products/${id}`),
                    api.get(`/products/${id}/price-history`),
                    user ? api.get(`/products/${id}/tracking-status`) : Promise.resolve(null),
                ]);
                if (pRes.status === "fulfilled") {
                    const p = pRes.value.data?.results ?? pRes.value.data;
                    setProduct(p);
                    setAlertPrice(p?.price ? (p.price * 0.9).toFixed(2) : "");
                }
                if (hRes.status === "fulfilled") {
                    const d = hRes.value.data;
                    setHistory(d?.history ?? d ?? generateMockHistory());
                } else {
                    setHistory(generateMockHistory());
                }
                if (tRes?.status === "fulfilled") setTracking(tRes.value.data?.tracking ?? false);
            } catch { /* handled */ }
            finally { setLoading(false); }
        };
        load();
    }, [id, user]);

    // Generate mock price history for demo
    function generateMockHistory() {
        const now = Date.now();
        return Array.from({ length: 30 }, (_, i) => ({
            date: new Date(now - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            price: Math.round((80 + Math.sin(i * 0.4) * 15 + Math.random() * 10) * 100) / 100,
        }));
    }

    const toggleTracking = async () => {
        if (!user) return navigate("/login");
        setSaving(true);
        try {
            if (tracking) {
                await api.delete(`/products/${id}/track`);
                setTracking(false);
                toast.success("Price tracking disabled");
            } else {
                await api.post(`/products/${id}/track`, { alertPrice: Number(alertPrice) });
                setTracking(true);
                toast.success(`Tracking enabled! Alert at $${alertPrice} 🔔`);
            }
        } catch { toast.error("Failed to update tracking"); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="loader" /></div>;
    if (!product) return (
        <div className="text-center py-20">
            <h3 className="text-xl font-black">Product not found</h3>
            <Link to="/products" className="btn btn-primary mt-4 inline-flex">Browse Products</Link>
        </div>
    );

    const prices = history.map((h) => h.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const curPrice = product.price ?? prices[prices.length - 1] ?? 0;
    const firstPrice = prices[0] ?? curPrice;
    const change = curPrice - firstPrice;
    const changePct = firstPrice > 0 ? ((change / firstPrice) * 100).toFixed(1) : 0;
    const isDown = change < 0;

    return (
        <>
            <style>{`
                @keyframes fadeSlideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
                .animate-in { animation: fadeSlideUp 0.4s ease both; }
            `}</style>

            <div className="animate-in max-w-5xl mx-auto space-y-8">

                <Link to={`/product/${id}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white font-bold transition-colors">
                    <HiOutlineArrowLeft /> Back to Product
                </Link>

                {/* Product card */}
                <div className="glass-card p-5 flex items-center gap-5">
                    <img src={product.images?.[0]} alt={product.title}
                        className="w-16 h-16 object-contain rounded-xl bg-gray-900 border border-gray-800 p-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{product.brand}</div>
                        <h2 className="font-black text-sm truncate">{product.title}</h2>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><HiOutlineStar className="text-amber-400" />{product.rating}</span>
                            <span>{product.storeName}</span>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-black text-white">${curPrice.toFixed(2)}</div>
                        <div className={`flex items-center gap-1 text-xs font-black justify-end mt-0.5 ${isDown ? "text-emerald-400" : "text-rose-400"}`}>
                            {isDown ? <HiOutlineTrendingDown /> : <HiOutlineTrendingUp />}
                            {isDown ? "" : "+"}{changePct}% (30d)
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: "Current Price", value: `$${curPrice.toFixed(2)}`, color: "text-white" },
                        { label: "Lowest (30d)", value: `$${minPrice.toFixed(2)}`, color: "text-emerald-400" },
                        { label: "Highest (30d)", value: `$${maxPrice.toFixed(2)}`, color: "text-rose-400" },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="glass-card p-5 text-center">
                            <div className={`text-xl font-black ${color}`}>{value}</div>
                            <div className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mt-1">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Chart */}
                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-black text-base">Price History</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Last 30 days</p>
                        </div>
                        <div className={`flex items-center gap-1.5 text-sm font-black px-3 py-1.5 rounded-full border ${isDown
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                            }`}>
                            {isDown ? <HiOutlineTrendingDown /> : <HiOutlineTrendingUp />}
                            {isDown ? "Price dropped" : "Price rose"} {Math.abs(changePct)}%
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={history} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                            <defs>
                                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false}
                                interval={Math.floor(history.length / 5)} />
                            <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false}
                                tickFormatter={(v) => `$${v}`} width={48} />
                            <Tooltip content={<ChartTooltip />} />
                            <ReferenceLine y={minPrice} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1.5}
                                label={{ value: "Low", fill: "#10b981", fontSize: 10, position: "right" }} />
                            <Area type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={2}
                                fill="url(#priceGrad)" dot={false} activeDot={{ r: 4, fill: "#6366f1" }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Alert setup */}
                <div className="glass-card p-6 space-y-5">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${tracking ? "bg-primary/20 border border-primary/30 text-primary" : "bg-gray-800 border border-gray-700 text-gray-500"}`}>
                            <HiOutlineBell className={!tracking ? "opacity-20" : ""} />
                        </div>
                        <div>
                            <h3 className="font-black text-sm">{tracking ? "Price Alert Active" : "Set Price Alert"}</h3>
                            <p className="text-[11px] text-gray-500">
                                {tracking ? `You'll be notified when price drops to $${alertPrice}` : "Get notified when this product drops to your target price"}
                            </p>
                        </div>
                        {tracking && <HiOutlineCheckCircle className="text-emerald-400 text-xl ml-auto" />}
                    </div>

                    {!tracking && (
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Alert me when price drops to</label>
                            <div className="flex items-center bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 gap-2 focus-within:border-primary/50 transition-colors">
                                <span className="text-gray-500 font-black">$</span>
                                <input type="number" value={alertPrice} onChange={(e) => setAlertPrice(e.target.value)}
                                    className="flex-1 bg-transparent text-sm text-white focus:outline-none font-bold"
                                    placeholder="0.00" step="0.01" min="0" />
                                <span className="text-[10px] text-gray-600 font-bold">Current: ${curPrice.toFixed(2)}</span>
                            </div>
                            {alertPrice && Number(alertPrice) >= curPrice && (
                                <p className="text-[11px] text-amber-400 font-bold">⚠ Alert price is higher than current price</p>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button onClick={toggleTracking} disabled={saving || (!tracking && !alertPrice)}
                            className={`flex items-center gap-2 text-sm font-black px-5 py-3 rounded-xl transition-all disabled:opacity-40 ${tracking
                                    ? "border border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
                                    : "btn btn-primary"
                                }`}>
                            {saving
                                ? <><HiOutlineRefresh className="animate-spin" /> Saving…</>
                                : tracking
                                    ? <><HiOutlineBell /> Disable Alert</>
                                    : <><HiOutlineBell /> Enable Alert</>
                            }
                        </button>
                        <Link to={`/product/${id}`}
                            className="flex items-center gap-2 text-sm font-bold border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white px-5 py-3 rounded-xl transition-all">
                            <HiOutlineShoppingCart /> Buy Now
                        </Link>
                    </div>

                    {!user && (
                        <p className="text-xs text-gray-600">
                            <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link> to enable price alerts
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}