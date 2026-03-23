import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import {
    HiOutlineArrowLeft, HiOutlineFire, HiOutlineSparkles,
    HiOutlineLightningBolt, HiOutlineStar, HiOutlineCash,
    HiOutlineFilter, HiOutlineRefresh,
} from "react-icons/hi";

const CATEGORY_META = {
    fashion: { icon: "👗", label: "Fashion", desc: "Clothes, shoes, watches & more", color: "#ec4899" },
    mobiles: { icon: "📱", label: "Mobiles", desc: "Smartphones, tablets & accessories", color: "#6366f1" },
    electronics: { icon: "💻", label: "Electronics", desc: "Laptops, TVs, audio & cameras", color: "#3b82f6" },
    groceries: { icon: "🥗", label: "Groceries", desc: "Food, beverages & health products", color: "#10b981" },
    home: { icon: "🏠", label: "Home", desc: "Furniture, kitchen & decor", color: "#f59e0b" },
    sports: { icon: "⚽", label: "Sports", desc: "Fitness, outdoor & sports gear", color: "#f97316" },
};

const SORT_OPT = [
    { value: "score", label: "Best Score" },
    { value: "-rating", label: "Top Rated" },
    { value: "price", label: "Price: Low → High" },
    { value: "-price", label: "Price: High → Low" },
];

export default function DealsCategory() {
    const { category } = useParams();
    const meta = CATEGORY_META[category?.toLowerCase()] ?? { icon: "🏷", label: category, desc: "Top deals", color: "#6366f1" };

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState("score");
    const [minScore, setMinScore] = useState(0);
    const [visible, setVisible] = useState(12);

    useEffect(() => {
        setLoading(true);
        setVisible(12);
        api.get("/products", { params: { category, sort, limit: 80 } })
            .then((r) => { const d = r.data; setProducts(d?.results ?? d ?? []); })
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [category, sort]);

    const filtered = useMemo(() =>
        minScore > 0 ? products.filter((p) => (p.productScore ?? 0) >= minScore) : products,
        [products, minScore]);

    const topPick = filtered[0];
    const avgScore = filtered.length
        ? Math.round(filtered.reduce((s, p) => s + (p.productScore ?? 0), 0) / filtered.length) : 0;
    const lowestPx = filtered.length ? Math.min(...filtered.map((p) => p.price ?? Infinity)).toFixed(2) : "—";

    return (
        <>
            <style>{`
                @keyframes fadeSlideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
                .animate-in { animation: fadeSlideUp 0.4s ease both; }
            `}</style>

            <div className="animate-in space-y-8 max-w-6xl mx-auto">

                <Link to="/best-deals" className="flex items-center gap-2 text-sm text-gray-500 hover:text-white font-bold transition-colors">
                    <HiOutlineArrowLeft /> All Deals
                </Link>

                {/* Hero */}
                <div className="relative overflow-hidden rounded-3xl p-8 border border-gray-700/60"
                    style={{ background: `linear-gradient(135deg, ${meta.color}18 0%, ${meta.color}06 100%)` }}>
                    <div className="absolute inset-0" style={{ border: `1px solid ${meta.color}30` }} />
                    <div className="absolute top-4 right-6 text-[100px] opacity-10 select-none">{meta.icon}</div>
                    <div className="relative z-10 flex items-center gap-5">
                        <div className="text-5xl">{meta.icon}</div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <HiOutlineFire style={{ color: meta.color }} />
                                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: meta.color }}>Category Deals</span>
                            </div>
                            <h1 className="text-3xl font-black">{meta.label}</h1>
                            <p className="text-gray-400 text-sm mt-1">{meta.desc}</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { icon: <HiOutlineSparkles />, color: "text-primary", label: "Products", value: filtered.length },
                        { icon: <HiOutlineStar />, color: "text-amber-400", label: "Avg AI Score", value: `${avgScore}/100` },
                        { icon: <HiOutlineCash />, color: "text-emerald-400", label: "From", value: `$${lowestPx}` },
                    ].map(({ icon, color, label, value }) => (
                        <div key={label} className="glass-card p-5 text-center">
                            <div className={`text-xl ${color} mx-auto mb-2`}>{icon}</div>
                            <div className="text-xl font-black">{value}</div>
                            <div className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Top pick */}
                {topPick && (
                    <div className="glass-card p-5 flex items-center gap-5 border-amber-500/20 bg-amber-500/5">
                        <div className="text-2xl">🏆</div>
                        <img src={topPick.images?.[0]} alt={topPick.title}
                            className="w-14 h-14 object-contain rounded-xl bg-gray-900 border border-gray-800 p-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] text-amber-400 font-black uppercase tracking-widest mb-0.5">Top Pick in {meta.label}</div>
                            <div className="font-black text-sm truncate">{topPick.title}</div>
                            <div className="text-xs text-gray-500">{topPick.brand} · Score: {topPick.productScore ?? 0}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <div className="text-xl font-black text-white">${topPick.price?.toFixed(2)}</div>
                            <Link to={`/product/${topPick._id}`}
                                className="text-xs text-amber-400 font-bold hover:underline">View Deal →</Link>
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div className="flex flex-wrap gap-3 items-center">
                    <select value={sort} onChange={(e) => setSort(e.target.value)}
                        className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none">
                        {SORT_OPT.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>

                    <div className="flex gap-2">
                        {[[0, "Any"], [60, "Score 60+"], [75, "Score 75+"], [90, "Score 90+"]].map(([v, l]) => (
                            <button key={v} onClick={() => setMinScore(v)}
                                className={`px-3 py-2 rounded-xl border text-xs font-black transition-all ${minScore === v ? "bg-primary border-primary text-white" : "border-gray-800 text-gray-500 hover:border-gray-600"
                                    }`}>{l}</button>
                        ))}
                    </div>

                    <span className="text-xs text-gray-600 font-bold ml-auto">{filtered.length} deals</span>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="glass-card p-5 space-y-4 animate-pulse">
                                <div className="w-full h-40 bg-gray-800 rounded-xl" />
                                <div className="h-3 bg-gray-800 rounded w-3/4" />
                                <div className="h-3 bg-gray-800 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filtered.slice(0, visible).map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
                        </div>
                        {visible < filtered.length && (
                            <div className="text-center pt-4">
                                <button onClick={() => setVisible((v) => v + 12)} className="btn btn-primary flex items-center gap-2 mx-auto">
                                    Load More ({visible}/{filtered.length})
                                </button>
                                <div className="mt-3 max-w-xs mx-auto h-1 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(visible / filtered.length) * 100}%` }} />
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="glass-card p-12 text-center text-gray-500">
                        <div className="text-5xl mb-4">{meta.icon}</div>
                        <h3 className="font-black text-lg mb-2">No deals found</h3>
                        <p className="text-sm">Try lowering the minimum score filter.</p>
                    </div>
                )}

                {/* Browse other categories */}
                <div>
                    <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">Other Categories</h3>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(CATEGORY_META).filter(([k]) => k !== category?.toLowerCase()).map(([k, v]) => (
                            <Link key={k} to={`/deals/${k}`}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-800 text-xs font-bold text-gray-400 hover:border-gray-600 hover:text-white transition-all">
                                {v.icon} {v.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}