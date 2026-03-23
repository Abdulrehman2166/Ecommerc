import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
    HiOutlineBell, HiOutlineCheckCircle,
    HiOutlineX, HiOutlineRefresh, HiOutlineClock, HiOutlineCash,
    HiOutlineFire, HiOutlineShoppingCart, HiOutlineTrendingDown,
    HiOutlineArrowRight, HiOutlineTag, HiOutlineSparkles,
} from "react-icons/hi";

const TYPE_CONFIG = {
    price_drop: { icon: <HiOutlineTrendingDown />, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Price Drop" },
    deal_alert: { icon: <HiOutlineFire />, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", label: "Deal Alert" },
    order_update: { icon: <HiOutlineShoppingCart />, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", label: "Order Update" },
    new_arrival: { icon: <HiOutlineTag />, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", label: "New Arrival" },
    system: { icon: <HiOutlineBell />, color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/20", label: "System" },
};

function NotifItem({ notif, onRead, onDelete }) {
    const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.system;
    const isNew = !notif.read;
    return (
        <div className={`glass-card p-4 flex items-start gap-4 transition-all ${isNew ? "border-primary/20 bg-primary/3" : ""}`}>
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-base flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                {cfg.icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                    </span>
                    {isNew && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </div>
                <p className="text-sm font-bold leading-snug">{notif.title}</p>
                {notif.body && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.body}</p>}
                <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-[10px] text-gray-600 font-bold">
                        <HiOutlineClock className="text-xs" />
                        {new Date(notif.createdAt ?? Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {notif.link && (
                        <Link to={notif.link} className="text-[10px] text-primary font-bold hover:underline flex items-center gap-0.5">
                            View <HiOutlineArrowRight className="text-xs" />
                        </Link>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-1 flex-shrink-0">
                {isNew && (
                    <button onClick={() => onRead(notif._id)}
                        className="w-7 h-7 rounded-lg border border-gray-700 flex items-center justify-center text-gray-500 hover:text-emerald-400 hover:border-emerald-500/40 transition-all"
                        title="Mark as read">
                        <HiOutlineCheckCircle className="text-xs" />
                    </button>
                )}
                <button onClick={() => onDelete(notif._id)}
                    className="w-7 h-7 rounded-lg border border-gray-700 flex items-center justify-center text-gray-500 hover:text-rose-400 hover:border-rose-500/40 transition-all"
                    title="Delete">
                    <HiOutlineX className="text-xs" />
                </button>
            </div>
        </div>
    );
}

export default function Notifications() {
    const { user } = useContext(AuthContext);
    const [notifs, setNotifs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all | unread | price_drop | deal_alert | order_update

    useEffect(() => {
        if (!user) { setLoading(false); return; }
        api.get("/notifications")
            .then((r) => { const d = r.data; setNotifs(d?.results ?? d ?? generateMockNotifs()); })
            .catch(() => setNotifs(generateMockNotifs()))
            .finally(() => setLoading(false));
    }, [user]);

    function generateMockNotifs() {
        return [
            { _id: "1", type: "price_drop", read: false, title: "Nike Air Max dropped 15%!", body: "Price fell from $120 to $102. This is near its 30-day low.", link: "/products", createdAt: new Date(Date.now() - 3600000).toISOString() },
            { _id: "2", type: "deal_alert", read: false, title: "New deal: Samsung Galaxy S24", body: "Scored 91/100 · Best price across 3 platforms. Limited time.", link: "/products", createdAt: new Date(Date.now() - 7200000).toISOString() },
            { _id: "3", type: "order_update", read: true, title: "Your order has shipped", body: "Order #ABC12345 is on its way. Estimated delivery: 3-5 days.", link: "/orders", createdAt: new Date(Date.now() - 86400000).toISOString() },
            { _id: "4", type: "new_arrival", read: true, title: "New arrivals in Electronics", body: "18 new products added to the Electronics category this week.", link: "/deals/electronics", createdAt: new Date(Date.now() - 172800000).toISOString() },
            { _id: "5", type: "price_drop", read: true, title: "Wishlisted item price update", body: "Sony WH-1000XM5 is now $279 — down from $349.", link: "/wishlist", createdAt: new Date(Date.now() - 259200000).toISOString() },
        ];
    }

    const markRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
        } catch { /* silent */ }
        setNotifs((n) => n.map((item) => item._id === id ? { ...item, read: true } : item));
    };

    const deleteNotif = async (id) => {
        try { await api.delete(`/notifications/${id}`); } catch { /* silent */ }
        setNotifs((n) => n.filter((item) => item._id !== id));
    };

    const markAllRead = async () => {
        try { await api.put("/notifications/read-all"); } catch { /* silent */ }
        setNotifs((n) => n.map((item) => ({ ...item, read: true })));
        toast.success("All marked as read");
    };

    const unreadCount = notifs.filter((n) => !n.read).length;

    const filtered = filter === "all" ? notifs
        : filter === "unread" ? notifs.filter((n) => !n.read)
            : notifs.filter((n) => n.type === filter);

    if (!user) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
            <HiOutlineBell className="text-5xl text-gray-600" />
            <h3 className="text-xl font-black">Sign in to view notifications</h3>
            <Link to="/login" className="btn btn-primary flex items-center gap-2">Sign In <HiOutlineArrowRight /></Link>
        </div>
    );

    return (
        <>
            <style>{`
                @keyframes fadeSlideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
                .animate-in { animation: fadeSlideUp 0.4s ease both; }
            `}</style>

            <div className="animate-in max-w-3xl mx-auto space-y-6">

                <div className="flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <HiOutlineBell className="text-primary" />
                            <span className="text-xs text-primary font-black uppercase tracking-widest">Notifications</span>
                        </div>
                        <h2 className="text-3xl font-black">Your Alerts</h2>
                        {unreadCount > 0 && (
                            <p className="text-gray-500 text-sm mt-1">
                                <span className="text-primary font-black">{unreadCount}</span> unread notification{unreadCount !== 1 ? "s" : ""}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <button onClick={markAllRead}
                                className="flex items-center gap-2 text-xs font-bold border border-gray-700 text-gray-400 hover:border-emerald-500/40 hover:text-emerald-400 px-4 py-2.5 rounded-xl transition-all">
                                <HiOutlineCheckCircle /> Mark All Read
                            </button>
                        )}
                        <Link to="/profile?tab=notifs"
                            className="flex items-center gap-2 text-xs font-bold border border-gray-700 text-gray-400 hover:border-primary/40 hover:text-primary px-4 py-2.5 rounded-xl transition-all">
                            <HiOutlineSparkles /> Preferences
                        </Link>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 flex-wrap">
                    {[
                        ["all", "All", notifs.length],
                        ["unread", "Unread", unreadCount],
                        ["price_drop", "Price Drops", notifs.filter((n) => n.type === "price_drop").length],
                        ["deal_alert", "Deals", notifs.filter((n) => n.type === "deal_alert").length],
                        ["order_update", "Orders", notifs.filter((n) => n.type === "order_update").length],
                    ].map(([key, label, count]) => (
                        <button key={key} onClick={() => setFilter(key)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-black transition-all ${filter === key ? "bg-primary border-primary text-white" : "border-gray-800 text-gray-400 hover:border-gray-600"
                                }`}>
                            {label}
                            {count > 0 && <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${filter === key ? "bg-white/20" : "bg-gray-800"}`}>{count}</span>}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="glass-card p-4 flex gap-4 animate-pulse">
                                <div className="w-9 h-9 bg-gray-800 rounded-xl flex-shrink-0" />
                                <div className="flex-1 space-y-2"><div className="h-3 bg-gray-800 rounded w-3/4" /><div className="h-2 bg-gray-800 rounded w-1/2" /></div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="space-y-3">
                        {filtered.map((n, i) => (
                            <div key={n._id} style={{ animation: "fadeSlideUp 0.35s ease both", animationDelay: `${i * 40}ms` }}>
                                <NotifItem notif={n} onRead={markRead} onDelete={deleteNotif} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-14 text-center space-y-4">
                        <HiOutlineBell className="text-5xl text-gray-700 mx-auto opacity-20" />
                        <h3 className="font-black text-lg">No notifications</h3>
                        <p className="text-gray-500 text-sm">
                            {filter === "unread" ? "You're all caught up!" : "No notifications in this category."}
                        </p>
                        <Link to="/products" className="btn btn-primary text-sm inline-flex items-center gap-2">
                            <HiOutlineSparkles /> Browse Products
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}