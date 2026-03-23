import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import {
    HiOutlineUsers,
    HiOutlineCube,
    HiOutlineClipboardList,
    HiOutlineCurrencyDollar,
    HiOutlineTrash,
    HiOutlinePlus,
    HiOutlineGlobeAlt,
    HiOutlineBadgeCheck,
    HiOutlineSearch,
    HiOutlinePencil,
    HiOutlineX,
    HiOutlineExternalLink,
    HiOutlinePhotograph,
    HiOutlineChevronUp,
    HiOutlineChevronDown,
    HiOutlineRefresh,
    HiOutlineShieldCheck,
    HiOutlineTrendingUp,
} from "react-icons/hi";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
} from "recharts";

// ─── helpers ────────────────────────────────────────────────────────────────

const STATUS_COLORS = {
    Processing: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    Shipped:    "bg-blue-500/15 text-blue-400 border-blue-500/30",
    Delivered:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Cancelled:  "bg-red-500/15 text-red-400 border-red-500/30",
};

const SCORE_COLOR = (v) =>
    v >= 80 ? "text-emerald-400" : v >= 60 ? "text-amber-400" : "text-red-400";

const EMPTY_FORM = {
    title: "", brand: "", description: "", price: "",
    category: "", images: "", qualityScore: 80,
    reputationScore: 80, storeName: "", country: "Pakistan",
    productLink: "",
};

const MOCK_REVENUE = [
    { month: "Jan", revenue: 1200 },
    { month: "Feb", revenue: 1900 },
    { month: "Mar", revenue: 1500 },
    { month: "Apr", revenue: 2800 },
    { month: "May", revenue: 2200 },
    { month: "Jun", revenue: 3400 },
    { month: "Jul", revenue: 3100 },
];

// ─── sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color, trend, trendLabel }) {
    return (
        <div className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: "radial-gradient(circle at 70% 30%, rgba(99,102,241,0.06), transparent 70%)" }} />
            <div className="flex items-start justify-between">
                <div className={`text-3xl ${color} p-2 rounded-xl bg-current/10`} style={{ background: "rgba(currentColor,0.1)" }}>
                    <div className={color}>{icon}</div>
                </div>
                {trend !== undefined && (
                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                        {trend >= 0 ? <HiOutlineChevronUp className="text-xs" /> : <HiOutlineChevronDown className="text-xs" />}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div>
                <div className="text-3xl font-bold tracking-tight">{value}</div>
                <div className="text-xs text-gray-500 uppercase font-bold tracking-widest mt-1">{label}</div>
                {trendLabel && <div className="text-xs text-gray-600 mt-1">{trendLabel}</div>}
            </div>
        </div>
    );
}

function SearchBar({ value, onChange, placeholder }) {
    return (
        <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input
                className="w-full bg-gray-900/60 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder-gray-600 focus:border-primary/50 focus:outline-none transition-colors"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {value && (
                <button onClick={() => onChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                    <HiOutlineX className="text-sm" />
                </button>
            )}
        </div>
    );
}

function ScoreBar({ label, value }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-bold uppercase tracking-wider">{label}</span>
                <span className={`font-bold ${SCORE_COLOR(value)}`}>{value}%</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${value >= 80 ? "bg-emerald-400" : value >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function Admin() {
    const [tab, setTab] = useState("dashboard");
    const [dashboard, setDashboard] = useState(null);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // form state
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [productForm, setProductForm] = useState(EMPTY_FORM);
    const [imagePreview, setImagePreview] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // search state per tab
    const [searchOrders, setSearchOrders] = useState("");
    const [searchUsers, setSearchUsers] = useState("");
    const [searchProducts, setSearchProducts] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [categoryFilter, setCategoryFilter] = useState("All");

    // ── data loading ──────────────────────────────────────────────────────────

    useEffect(() => { loadTab(tab); }, [tab]);

    const loadTab = async (t) => {
        setLoading(true);
        try {
            if (t === "dashboard") {
                const res = await api.get("/admin/dashboard");
                setDashboard(res.data);
            } else if (t === "orders") {
                const res = await api.get("/admin/orders");
                setOrders(res.data);
            } else if (t === "users") {
                const res = await api.get("/admin/users");
                setUsers(res.data);
            } else if (t === "products") {
                const res = await api.get("/admin/products");
                setProducts(res.data);
            }
        } catch {
            console.error("Failed to load", t);
        } finally {
            setLoading(false);
        }
    };

    // ── mutations ─────────────────────────────────────────────────────────────

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/admin/orders/${id}`, { status });
            setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
        } catch { console.error("Failed to update status"); }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Permanently delete this user?")) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers((prev) => prev.filter((u) => u._id !== id));
        } catch { console.error("Failed to delete user"); }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm("Remove this product from inventory?")) return;
        try {
            await api.delete(`/admin/products/${id}`);
            setProducts((prev) => prev.filter((p) => p._id !== id));
        } catch { console.error("Failed to delete product"); }
    };

    const openEdit = (p) => {
        setEditingId(p._id);
        setProductForm({
            title: p.title || "",
            brand: p.brand || "",
            description: p.description || "",
            price: p.price || "",
            category: p.category || "",
            images: Array.isArray(p.images) ? p.images.join(", ") : p.images || "",
            qualityScore: p.qualityScore ?? 80,
            reputationScore: p.reputationScore ?? 80,
            storeName: p.storeName || "",
            country: p.country || "Pakistan",
            productLink: p.productLink || "",
        });
        setImagePreview(Array.isArray(p.images) ? p.images[0] : p.images || "");
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setProductForm(EMPTY_FORM);
        setImagePreview("");
    };

    const submitProduct = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = {
                ...productForm,
                price: Number(productForm.price),
                qualityScore: Number(productForm.qualityScore),
                reputationScore: Number(productForm.reputationScore),
                images: productForm.images.split(",").map((s) => s.trim()).filter(Boolean),
            };
            if (editingId) {
                const res = await api.put(`/admin/products/${editingId}`, data);
                setProducts((prev) => prev.map((p) => (p._id === editingId ? res.data : p)));
            } else {
                const res = await api.post("/admin/products", data);
                setProducts((prev) => [res.data, ...prev]);
            }
            resetForm();
        } catch {
            alert("Failed to save product. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // ── derived/filtered data ─────────────────────────────────────────────────

    const filteredOrders = useMemo(() => orders.filter((o) => {
        const q = searchOrders.toLowerCase();
        const matchQ = !q || o.user?.name?.toLowerCase().includes(q) || o.user?.email?.toLowerCase().includes(q) || o._id?.includes(q);
        const matchS = statusFilter === "All" || o.status === statusFilter;
        return matchQ && matchS;
    }), [orders, searchOrders, statusFilter]);

    const filteredUsers = useMemo(() => users.filter((u) => {
        const q = searchUsers.toLowerCase();
        return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    }), [users, searchUsers]);

    const filteredProducts = useMemo(() => products.filter((p) => {
        const q = searchProducts.toLowerCase();
        const matchQ = !q || p.title?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q);
        const matchC = categoryFilter === "All" || p.category === categoryFilter;
        return matchQ && matchC;
    }), [products, searchProducts, categoryFilter]);

    const categories = useMemo(() => ["All", ...new Set(products.map((p) => p.category).filter(Boolean))], [products]);

    // ── stat cards ────────────────────────────────────────────────────────────

    const statCards = dashboard ? [
        { label: "Total Revenue", value: `$${dashboard.totalRevenue?.toFixed(2) ?? "0.00"}`, icon: <HiOutlineCurrencyDollar />, color: "text-emerald-400", trend: 12, trendLabel: "vs last month" },
        { label: "Orders", value: dashboard.totalOrders ?? 0, icon: <HiOutlineClipboardList />, color: "text-violet-400", trend: 8, trendLabel: "vs last month" },
        { label: "Products", value: dashboard.totalProducts ?? 0, icon: <HiOutlineCube />, color: "text-pink-400", trend: -3, trendLabel: "vs last month" },
        { label: "Users", value: dashboard.totalUsers ?? 0, icon: <HiOutlineUsers />, color: "text-sky-400", trend: 21, trendLabel: "vs last month" },
    ] : [];

    const tabs = [
        { key: "dashboard", label: "Dashboard", icon: <HiOutlineTrendingUp /> },
        { key: "orders", label: "Orders", icon: <HiOutlineClipboardList /> },
        { key: "products", label: "Inventory", icon: <HiOutlineCube /> },
        { key: "users", label: "Users", icon: <HiOutlineUsers /> },
    ];

    // ── render ────────────────────────────────────────────────────────────────

    return (
        <div className="animate-in max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <HiOutlineShieldCheck className="text-primary text-xl" />
                        <span className="text-xs text-primary font-bold uppercase tracking-widest">Admin Console</span>
                    </div>
                    <h2 className="text-3xl font-bold">Control Center</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage inventory, orders, users & brand reputation.</p>
                </div>
                <button
                    onClick={() => loadTab(tab)}
                    className="flex items-center gap-2 text-xs text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 px-4 py-2 rounded-xl transition-all self-start md:self-auto"
                >
                    <HiOutlineRefresh className={loading ? "animate-spin" : ""} /> Refresh
                </button>
            </div>

            {/* Tab Bar */}
            <div className="flex gap-2 mb-10 flex-wrap">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all text-sm font-bold ${
                            tab === t.key
                                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                : "border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
                        }`}
                    >
                        {t.icon} {t.label}
                        {t.key === "orders" && orders.filter((o) => o.status === "Processing").length > 0 && (
                            <span className="bg-amber-500 text-black text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                                {orders.filter((o) => o.status === "Processing").length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <div className="loader"></div>
                    <p className="text-gray-600 text-sm animate-pulse">Loading {tab}…</p>
                </div>
            ) : (
                <>
                    {/* ── DASHBOARD ─────────────────────────────────────────── */}
                    {tab === "dashboard" && (
                        <div className="space-y-8 animate-in">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {statCards.map((s, i) => <StatCard key={i} {...s} />)}
                            </div>

                            {/* Revenue Chart */}
                            <div className="glass-card p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="font-bold text-lg">Revenue Overview</h3>
                                        <p className="text-xs text-gray-500">Monthly performance</p>
                                    </div>
                                    <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                                        ↑ 12% this month
                                    </span>
                                </div>
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={dashboard?.monthlyRevenue ?? MOCK_REVENUE}>
                                        <defs>
                                            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                        <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                                        <Tooltip
                                            contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 10, fontSize: 12 }}
                                            formatter={(v) => [`$${v}`, "Revenue"]}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Orders by Status mini chart */}
                            {orders.length > 0 && (
                                <div className="glass-card p-6">
                                    <h3 className="font-bold mb-4">Orders by Status</h3>
                                    <ResponsiveContainer width="100%" height={140}>
                                        <BarChart data={[
                                            { name: "Processing", count: orders.filter((o) => o.status === "Processing").length },
                                            { name: "Shipped",    count: orders.filter((o) => o.status === "Shipped").length },
                                            { name: "Delivered",  count: orders.filter((o) => o.status === "Delivered").length },
                                            { name: "Cancelled",  count: orders.filter((o) => o.status === "Cancelled").length },
                                        ]} barSize={32}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis allowDecimals={false} tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 10, fontSize: 12 }} />
                                            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                                {["#f59e0b","#3b82f6","#10b981","#ef4444"].map((c, i) => <Cell key={i} fill={c} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── ORDERS ────────────────────────────────────────────── */}
                    {tab === "orders" && (
                        <div className="space-y-6 animate-in">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                    <SearchBar value={searchOrders} onChange={setSearchOrders} placeholder="Search by name, email, order ID…" />
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {["All","Processing","Shipped","Delivered","Cancelled"].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setStatusFilter(s)}
                                            className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all ${statusFilter === s ? "bg-primary border-primary text-white" : "border-gray-800 text-gray-400 hover:border-gray-600"}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {filteredOrders.length === 0 ? (
                                <div className="empty-state py-20 text-center">
                                    <HiOutlineClipboardList className="text-5xl text-gray-700 mx-auto mb-3" />
                                    <h3 className="text-gray-500">No orders found</h3>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredOrders.map((order) => (
                                        <div key={order._id} className="glass-card p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-700 transition-colors">
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <span className="text-[10px] text-gray-600 font-mono">#{order._id?.slice(-8).toUpperCase()}</span>
                                                <div className="font-bold truncate">{order.user?.name}</div>
                                                <div className="text-xs text-gray-500 truncate">{order.user?.email}</div>
                                            </div>
                                            <div className="flex items-center gap-4 flex-shrink-0">
                                                <span className="text-xl font-bold text-white">${order.totalAmount?.toFixed(2)}</span>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${STATUS_COLORS[order.status] ?? "bg-gray-800 text-gray-400 border-gray-700"}`}>
                                                    {order.status}
                                                </span>
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateStatus(order._id, e.target.value)}
                                                    className="bg-gray-900 border border-gray-700 rounded-lg text-xs font-bold p-2 cursor-pointer hover:border-gray-500 transition-colors"
                                                >
                                                    {["Processing","Shipped","Delivered","Cancelled"].map((s) => <option key={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── PRODUCTS ──────────────────────────────────────────── */}
                    {tab === "products" && (
                        <div className="space-y-8 animate-in">

                            {/* Toolbar */}
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                                <div className="flex gap-3 flex-1 w-full sm:w-auto">
                                    <div className="flex-1">
                                        <SearchBar value={searchProducts} onChange={setSearchProducts} placeholder="Search products or brands…" />
                                    </div>
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="bg-gray-900 border border-gray-800 rounded-xl text-sm px-3 py-2.5 text-gray-300 cursor-pointer hover:border-gray-600 transition-colors"
                                    >
                                        {categories.map((c) => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <button
                                    className="btn btn-primary flex items-center gap-2 flex-shrink-0"
                                    onClick={() => { resetForm(); setShowForm(!showForm); }}
                                >
                                    {showForm && !editingId ? <HiOutlineX /> : <HiOutlinePlus />}
                                    {showForm && !editingId ? "Cancel" : "Add Product"}
                                </button>
                            </div>

                            {/* Add / Edit Form */}
                            {showForm && (
                                <form onSubmit={submitProduct} className="glass-card p-8 border border-primary/20 bg-gray-900/60 animate-in">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-bold text-lg">{editingId ? "Edit Product" : "New Product"}</h3>
                                        <button type="button" onClick={resetForm} className="text-gray-500 hover:text-white transition-colors">
                                            <HiOutlineX className="text-xl" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                                        {[
                                            { label: "Product Title", key: "title", type: "text", required: true },
                                            { label: "Brand", key: "brand", type: "text", required: true },
                                            { label: "Price (USD)", key: "price", type: "number", required: true },
                                            { label: "Category", key: "category", type: "text", required: true },
                                            { label: "Store Name", key: "storeName", type: "text", required: true },
                                        ].map(({ label, key, type, required }) => (
                                            <div key={key} className="space-y-1.5">
                                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{label}</label>
                                                <input
                                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm placeholder-gray-700 focus:border-primary/50 focus:outline-none transition-colors"
                                                    type={type} required={required}
                                                    value={productForm[key]}
                                                    onChange={(e) => setProductForm({ ...productForm, [key]: e.target.value })}
                                                />
                                            </div>
                                        ))}

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Country Source</label>
                                            <select
                                                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm focus:border-primary/50 focus:outline-none transition-colors"
                                                value={productForm.country}
                                                onChange={(e) => setProductForm({ ...productForm, country: e.target.value })}
                                            >
                                                {["Pakistan","India","USA","UAE","China","UK"].map((c) => <option key={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Product Link */}
                                    <div className="space-y-1.5 mb-6">
                                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                            <HiOutlineExternalLink /> Product URL (buy link)
                                        </label>
                                        <input
                                            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm placeholder-gray-700 focus:border-primary/50 focus:outline-none transition-colors"
                                            type="url" placeholder="https://amazon.com/dp/..."
                                            value={productForm.productLink}
                                            onChange={(e) => setProductForm({ ...productForm, productLink: e.target.value })}
                                        />
                                    </div>

                                    {/* Score sliders */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        {[
                                            { label: "Quality Rating", key: "qualityScore" },
                                            { label: "Brand Reputation", key: "reputationScore" },
                                        ].map(({ label, key }) => (
                                            <div key={key} className="space-y-2">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-500 font-bold uppercase tracking-widest">{label}</span>
                                                    <span className={`font-bold ${SCORE_COLOR(Number(productForm[key]))}`}>{productForm[key]}%</span>
                                                </div>
                                                <input
                                                    type="range" min="0" max="100"
                                                    className="w-full accent-primary h-1.5 cursor-pointer"
                                                    value={productForm[key]}
                                                    onChange={(e) => setProductForm({ ...productForm, [key]: e.target.value })}
                                                />
                                                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden -mt-1 pointer-events-none">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${SCORE_COLOR(Number(productForm[key])).replace("text-","bg-")}`}
                                                        style={{ width: `${productForm[key]}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-1.5 mb-6">
                                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Description</label>
                                        <textarea
                                            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm min-h-[90px] resize-none placeholder-gray-700 focus:border-primary/50 focus:outline-none transition-colors"
                                            required value={productForm.description}
                                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                        />
                                    </div>

                                    {/* Image URL + Preview */}
                                    <div className="space-y-1.5 mb-8">
                                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                            <HiOutlinePhotograph /> Image URLs (comma-separated)
                                        </label>
                                        <input
                                            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm placeholder-gray-700 focus:border-primary/50 focus:outline-none transition-colors"
                                            required value={productForm.images}
                                            placeholder="https://cdn.example.com/img1.jpg, https://..."
                                            onChange={(e) => {
                                                setProductForm({ ...productForm, images: e.target.value });
                                                const first = e.target.value.split(",")[0].trim();
                                                setImagePreview(first);
                                            }}
                                        />
                                        {imagePreview && (
                                            <div className="mt-3 flex items-center gap-4 p-3 bg-gray-950 rounded-xl border border-gray-800">
                                                <img src={imagePreview} alt="preview" className="w-16 h-16 object-cover rounded-lg bg-gray-800" onError={(e) => e.target.style.display = "none"} />
                                                <div>
                                                    <div className="text-xs text-gray-400 font-bold">Image preview</div>
                                                    <div className="text-[10px] text-gray-600 mt-0.5 break-all">{imagePreview.slice(0, 60)}…</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit" disabled={submitting}
                                        className="btn btn-primary w-full py-4 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <span className="flex items-center justify-center gap-2"><HiOutlineRefresh className="animate-spin" /> Saving…</span>
                                        ) : editingId ? "Save Changes" : "Save & Calculate Score"}
                                    </button>
                                </form>
                            )}

                            {/* Product Grid */}
                            {filteredProducts.length === 0 ? (
                                <div className="empty-state py-20 text-center">
                                    <HiOutlineCube className="text-5xl text-gray-700 mx-auto mb-3" />
                                    <h3 className="text-gray-500">No products found</h3>
                                    <p className="text-gray-700 text-sm mt-1">Try a different search or add a new product.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {filteredProducts.map((p) => (
                                        <div key={p._id} className="glass-card p-5 relative group flex flex-col gap-4 hover:border-gray-700 transition-all duration-200 hover:-translate-y-0.5">
                                            {/* Top: image + basic info */}
                                            <div className="flex gap-4">
                                                <div className="relative w-20 h-20 flex-shrink-0">
                                                    <img src={p.images?.[0]} alt={p.title} className="w-20 h-20 object-cover rounded-xl bg-gray-800" />
                                                    {p.productScore >= 85 && (
                                                        <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full">TOP</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-bold truncate leading-tight">{p.title}</div>
                                                    <div className="text-xs text-gray-500 truncate mt-0.5">{p.brand}</div>
                                                    <div className="text-primary font-bold text-lg mt-1">${p.price}</div>
                                                    <div className="text-[10px] text-gray-600 truncate">{p.category}</div>
                                                </div>
                                            </div>

                                            {/* Score bars */}
                                            <div className="space-y-2 border-t border-gray-800/60 pt-4">
                                                <ScoreBar label="Quality" value={p.qualityScore ?? 0} />
                                                <ScoreBar label="Reputation" value={p.reputationScore ?? 0} />
                                            </div>

                                            {/* Meta row */}
                                            <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold border-t border-gray-800/60 pt-3">
                                                <span className="flex items-center gap-1"><HiOutlineGlobeAlt /> {p.country}</span>
                                                <span className={`flex items-center gap-1 ${SCORE_COLOR(p.productScore)}`}>
                                                    <HiOutlineBadgeCheck /> Score: {p.productScore ?? "—"}
                                                </span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 pt-1">
                                                {p.productLink && (
                                                    <a href={p.productLink} target="_blank" rel="noreferrer"
                                                        className="flex-1 text-center text-xs font-bold py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all flex items-center justify-center gap-1">
                                                        <HiOutlineExternalLink /> View
                                                    </a>
                                                )}
                                                <button onClick={() => openEdit(p)}
                                                    className="flex-1 text-xs font-bold py-2 rounded-xl border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-1">
                                                    <HiOutlinePencil /> Edit
                                                </button>
                                                <button onClick={() => deleteProduct(p._id)}
                                                    className="px-3 py-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs">
                                                    <HiOutlineTrash />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── USERS ─────────────────────────────────────────────── */}
                    {tab === "users" && (
                        <div className="space-y-5 animate-in">
                            <SearchBar value={searchUsers} onChange={setSearchUsers} placeholder="Search by name or email…" />

                            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                                <span>{filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found</span>
                                <span>{users.filter((u) => u.role === "admin").length} admin{users.filter((u) => u.role === "admin").length !== 1 ? "s" : ""}</span>
                            </div>

                            {filteredUsers.length === 0 ? (
                                <div className="empty-state py-20 text-center">
                                    <HiOutlineUsers className="text-5xl text-gray-700 mx-auto mb-3" />
                                    <h3 className="text-gray-500">No users found</h3>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredUsers.map((u) => (
                                        <div key={u._id} className="glass-card p-5 flex justify-between items-center group hover:border-gray-700 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-violet-500/30 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                                                    {u.name?.[0]?.toUpperCase() ?? "?"}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="font-bold text-sm">{u.name}</span>
                                                        <span className={`text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full border ${
                                                            u.role === "admin"
                                                                ? "bg-primary/20 text-primary border-primary/30"
                                                                : "bg-gray-800 text-gray-500 border-gray-700"
                                                        }`}>{u.role}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500">{u.email}</div>
                                                </div>
                                            </div>
                                            {u.role !== "admin" && (
                                                <button
                                                    onClick={() => deleteUser(u._id)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                                                >
                                                    <HiOutlineTrash />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}