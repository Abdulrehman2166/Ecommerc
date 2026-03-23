import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import {
    HiOutlineClipboardList,
    HiOutlineSearch,
    HiOutlineX,
    HiOutlineChevronDown,
    HiOutlineChevronUp,
    HiOutlineLocationMarker,
    HiOutlineTruck,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineXCircle,
    HiOutlineRefresh,
    HiOutlineShoppingBag,
    HiOutlineCash,
    HiOutlineCalendar,
    HiOutlineCreditCard,
    HiOutlineArrowRight,
    HiOutlineBadgeCheck,
} from "react-icons/hi";

// ─── constants ────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    Processing: {
        label: "Processing",
        icon: <HiOutlineClock />,
        cls: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        dot: "bg-amber-400",
        step: 1,
    },
    Shipped: {
        label: "Shipped",
        icon: <HiOutlineTruck />,
        cls: "bg-blue-500/15 text-blue-300 border-blue-500/30",
        dot: "bg-blue-400",
        step: 2,
    },
    Delivered: {
        label: "Delivered",
        icon: <HiOutlineCheckCircle />,
        cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        dot: "bg-emerald-400",
        step: 3,
    },
    Cancelled: {
        label: "Cancelled",
        icon: <HiOutlineXCircle />,
        cls: "bg-rose-500/15 text-rose-300 border-rose-500/30",
        dot: "bg-rose-400",
        step: -1,
    },
};

const TIMELINE_STEPS = [
    { label: "Order Placed", icon: <HiOutlineClipboardList />, step: 0 },
    { label: "Processing", icon: <HiOutlineClock />, step: 1 },
    { label: "Shipped", icon: <HiOutlineTruck />, step: 2 },
    { label: "Delivered", icon: <HiOutlineCheckCircle />, step: 3 },
];

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const fmtTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

// ─── order timeline ───────────────────────────────────────────────────────────
function OrderTimeline({ status }) {
    if (status === "Cancelled") {
        return (
            <div className="flex items-center gap-2 text-xs text-rose-400 font-bold py-2">
                <HiOutlineXCircle className="text-base" /> This order was cancelled
            </div>
        );
    }
    const currentStep = STATUS_CONFIG[status]?.step ?? 0;
    return (
        <div className="flex items-center gap-0 py-3">
            {TIMELINE_STEPS.map((s, i) => {
                const done = currentStep > s.step;
                const active = currentStep === s.step;
                return (
                    <div key={s.label} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1">
                            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs transition-all ${done ? "bg-emerald-500 border-emerald-500 text-white" :
                                    active ? "bg-primary border-primary text-white" :
                                        "bg-gray-900 border-gray-700 text-gray-600"
                                }`}>
                                {s.icon}
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-wider whitespace-nowrap ${done || active ? "text-white" : "text-gray-700"
                                }`}>{s.label}</span>
                        </div>
                        {i < TIMELINE_STEPS.length - 1 && (
                            <div className={`flex-1 h-px mx-2 mb-4 transition-all ${done ? "bg-emerald-500/60" : "bg-gray-800"}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── single order card ────────────────────────────────────────────────────────
function OrderCard({ order, index }) {
    const [expanded, setExpanded] = useState(false);
    const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.Processing;
    const items = order.items ?? [];
    const addr = order.shippingAddress;

    return (
        <div
            className="glass-card overflow-hidden hover:border-gray-700 transition-all duration-200"
            style={{ animationDelay: `${index * 60}ms`, animation: "fadeSlideUp 0.4s ease both" }}
        >
            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    {/* Status dot */}
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />

                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs text-gray-500 font-bold">
                                #{order._id?.slice(-8).toUpperCase()}
                            </span>
                            <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${cfg.cls}`}>
                                {cfg.icon} {cfg.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1">
                                <HiOutlineCalendar className="text-gray-600" />
                                {fmt(order.createdAt)} · {fmtTime(order.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                                <HiOutlineShoppingBag className="text-gray-600" />
                                {items.length} item{items.length !== 1 ? "s" : ""}
                            </span>
                            {order.paymentMethod && (
                                <span className="flex items-center gap-1">
                                    <HiOutlineCreditCard className="text-gray-600" />
                                    {order.paymentMethod}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                        <div className="text-xl font-black text-white">${order.totalAmount?.toFixed(2)}</div>
                        <div className="text-[10px] text-gray-600 font-bold">Total paid</div>
                    </div>
                    <button
                        onClick={() => setExpanded((v) => !v)}
                        className="w-8 h-8 rounded-xl border border-gray-700 flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-500 transition-all"
                    >
                        {expanded ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
                    </button>
                </div>
            </div>

            {/* ── Item thumbnail strip ─────────────────────────────────── */}
            {!expanded && items.length > 0 && (
                <div className="px-5 pb-4 flex items-center gap-2">
                    {items.slice(0, 5).map((item, i) => (
                        <div key={i} className="relative">
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-10 h-10 rounded-lg object-cover bg-gray-800 border border-gray-700"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
                                    <HiOutlineShoppingBag className="text-gray-600 text-xs" />
                                </div>
                            )}
                            {item.quantity > 1 && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center">
                                    {item.quantity}
                                </span>
                            )}
                        </div>
                    ))}
                    {items.length > 5 && (
                        <span className="text-xs text-gray-600 font-bold">+{items.length - 5} more</span>
                    )}
                </div>
            )}

            {/* ── Expanded details ─────────────────────────────────────── */}
            {expanded && (
                <div className="border-t border-gray-800/60 animate-in">

                    {/* Timeline */}
                    <div className="px-5 pt-4">
                        <div className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-2">Order Progress</div>
                        <OrderTimeline status={order.status} />
                    </div>

                    {/* Items list */}
                    <div className="px-5 py-4 border-t border-gray-800/40">
                        <div className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-3">Items Ordered</div>
                        <div className="space-y-3">
                            {items.map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-12 h-12 rounded-xl object-cover bg-gray-800 border border-gray-700 flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0">
                                            <HiOutlineShoppingBag className="text-gray-600" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold truncate">{item.name || "Product"}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            Qty: {item.quantity} · ${Number(item.price).toFixed(2)} each
                                        </div>
                                    </div>
                                    <div className="text-sm font-black text-white flex-shrink-0">
                                        ${(Number(item.price) * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping address */}
                    {addr && (
                        <div className="px-5 py-4 border-t border-gray-800/40">
                            <div className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-2">Shipped To</div>
                            <div className="flex items-start gap-2 text-sm text-gray-400">
                                <HiOutlineLocationMarker className="text-primary mt-0.5 flex-shrink-0" />
                                <span>
                                    {addr.fullName && <span className="text-white font-bold">{addr.fullName}, </span>}
                                    {addr.address}, {addr.city}, {addr.postalCode && `${addr.postalCode}, `}{addr.country}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="px-5 py-4 border-t border-gray-800/40 flex gap-3 flex-wrap">
                        <Link
                            to="/products"
                            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border border-primary/40 text-primary hover:bg-primary hover:text-white transition-all"
                        >
                            <HiOutlineRefresh /> Reorder
                        </Link>
                        <Link
                            to="/products"
                            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white transition-all"
                        >
                            <HiOutlineArrowRight /> Browse More
                        </Link>
                        {order.status === "Delivered" && (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 ml-auto">
                                <HiOutlineBadgeCheck /> Order Complete
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusF, setStatusF] = useState("All");
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        try {
            const res = await api.get("/orders");
            setOrders(res.data ?? []);
        } catch { /* silent */ }
        finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    // ── derived ───────────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let list = [...orders];
        if (statusF !== "All") list = list.filter((o) => o.status === statusF);
        if (search.trim()) list = list.filter((o) =>
            o._id?.toLowerCase().includes(search.toLowerCase()) ||
            o.items?.some((i) => i.name?.toLowerCase().includes(search.toLowerCase()))
        );
        return list;
    }, [orders, statusF, search]);

    // ── stats ─────────────────────────────────────────────────────────────────
    const totalSpent = orders.reduce((s, o) => s + (o.totalAmount ?? 0), 0);
    const delivered = orders.filter((o) => o.status === "Delivered").length;
    const inProgress = orders.filter((o) => o.status === "Processing" || o.status === "Shipped").length;

    // ── loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="loader" />
                <p className="text-gray-500 text-sm animate-pulse">Loading your orders…</p>
            </div>
        );
    }

    // ── empty ─────────────────────────────────────────────────────────────────
    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center animate-in">
                <div className="w-20 h-20 rounded-3xl bg-gray-800/60 border border-gray-700 flex items-center justify-center">
                    <HiOutlineClipboardList className="text-4xl text-gray-500" />
                </div>
                <div>
                    <h3 className="text-2xl font-black mb-2">No orders yet</h3>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto">
                        Your orders will appear here once you make a purchase.
                    </p>
                </div>
                <Link to="/products" className="btn btn-primary flex items-center gap-2">
                    <HiOutlineShoppingBag /> Start Shopping
                </Link>
            </div>
        );
    }

    // ── main ──────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity:0; transform:translateY(14px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                .animate-in { animation: fadeSlideUp 0.4s ease both; }
            `}</style>

            <div className="animate-in space-y-8 max-w-4xl mx-auto">

                {/* ── Header ───────────────────────────────────────────── */}
                <div className="flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <HiOutlineClipboardList className="text-primary" />
                            <span className="text-xs text-primary font-bold uppercase tracking-widest">Order History</span>
                        </div>
                        <h2 className="text-3xl font-black">My Orders</h2>
                        <p className="text-gray-500 text-sm mt-1">
                            {orders.length} order{orders.length !== 1 ? "s" : ""} total
                        </p>
                    </div>
                    <button
                        onClick={() => fetchOrders(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 text-xs text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 px-4 py-2 rounded-xl transition-all"
                    >
                        <HiOutlineRefresh className={refreshing ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>

                {/* ── Stats row ────────────────────────────────────────── */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: "Total Spent", value: `$${totalSpent.toFixed(2)}`, icon: <HiOutlineCash />, color: "text-primary" },
                        { label: "Delivered", value: delivered, icon: <HiOutlineCheckCircle />, color: "text-emerald-400" },
                        { label: "In Progress", value: inProgress, icon: <HiOutlineTruck />, color: "text-amber-400" },
                    ].map(({ label, value, icon, color }) => (
                        <div key={label} className="glass-card p-5 flex flex-col items-center gap-2 text-center">
                            <div className={`text-2xl ${color}`}>{icon}</div>
                            <div className="text-xl font-black">{value}</div>
                            <div className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{label}</div>
                        </div>
                    ))}
                </div>

                {/* ── Search + filters ─────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                        <input
                            className="w-full bg-gray-900/60 border border-gray-800 rounded-xl pl-9 pr-9 py-2.5 text-sm placeholder-gray-600 focus:border-primary/50 focus:outline-none transition-colors"
                            placeholder="Search by order ID or product name…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                                <HiOutlineX className="text-sm" />
                            </button>
                        )}
                    </div>

                    {/* Status filters */}
                    <div className="flex gap-2 flex-wrap">
                        {["All", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusF(s)}
                                className={`text-xs font-bold px-3 py-2.5 rounded-xl border transition-all flex items-center gap-1.5 ${statusF === s
                                        ? "bg-primary border-primary text-white"
                                        : "border-gray-800 text-gray-400 hover:border-gray-600"
                                    }`}
                            >
                                {s !== "All" && STATUS_CONFIG[s]?.icon}
                                {s}
                                {s !== "All" && (
                                    <span className="bg-gray-700/60 text-gray-400 rounded-full px-1.5 py-0.5 text-[9px] font-black">
                                        {orders.filter((o) => o.status === s).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Results count ─────────────────────────────────────── */}
                {(search || statusF !== "All") && (
                    <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                        <span>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
                        <button
                            onClick={() => { setSearch(""); setStatusF("All"); }}
                            className="text-primary hover:underline font-bold"
                        >
                            Clear filters
                        </button>
                    </div>
                )}

                {/* ── Order cards ───────────────────────────────────────── */}
                {filtered.length > 0 ? (
                    <div className="space-y-4">
                        {filtered.map((order, i) => (
                            <OrderCard key={order._id} order={order} index={i} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center space-y-3">
                        <HiOutlineSearch className="text-4xl text-gray-700 mx-auto" />
                        <h3 className="text-gray-500 font-bold">No orders match your filters</h3>
                        <button
                            onClick={() => { setSearch(""); setStatusF("All"); }}
                            className="btn btn-primary text-sm mt-2"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}