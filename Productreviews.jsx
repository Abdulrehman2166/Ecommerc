import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import {
    HiOutlineStar, HiStar, HiOutlineArrowLeft, HiOutlineSearch,
    HiOutlineFilter, HiOutlineThumbUp, HiOutlineShieldCheck,
    HiOutlineBadgeCheck, HiOutlineX, HiOutlineRefresh,
    HiOutlineUser, HiOutlineClock,
} from "react-icons/hi";

const SCORE_COLOR = (v) => v >= 80 ? "#10b981" : v >= 60 ? "#f59e0b" : "#ef4444";

function StarDisplay({ value, size = "text-sm" }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                n <= Math.round(value)
                    ? <HiStar key={n} className={`${size} text-amber-400`} />
                    : <HiOutlineStar key={n} className={`${size} text-gray-700`} />
            ))}
        </div>
    );
}

function RatingBar({ label, count, total }) {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-bold w-3">{label}</span>
            <HiStar className="text-amber-400 text-xs flex-shrink-0" />
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-gray-500 font-bold w-6 text-right">{count}</span>
        </div>
    );
}

export default function ProductReviews() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");    // all | 5 | 4 | 3 | 2 | 1
    const [platform, setPlatform] = useState("all");
    const [sort, setSort] = useState("recent"); // recent | helpful
    const [search, setSearch] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [pRes, rRes] = await Promise.allSettled([
                    api.get(`/products/${id}`),
                    api.get(`/reviews?productId=${id}&limit=100`),
                ]);
                if (pRes.status === "fulfilled") setProduct(pRes.value.data?.results ?? pRes.value.data);
                if (rRes.status === "fulfilled") {
                    const d = rRes.value.data;
                    setReviews(d?.results ?? d ?? []);
                }
            } catch { /* handled */ }
            finally { setLoading(false); }
        };
        load();
    }, [id]);

    const platforms = useMemo(() => ["all", ...new Set(reviews.map((r) => r.platformUsed).filter(Boolean))], [reviews]);

    const filtered = useMemo(() => {
        let list = [...reviews];
        if (filter !== "all") list = list.filter((r) => Math.round(r.rating) === Number(filter));
        if (platform !== "all") list = list.filter((r) => r.platformUsed === platform);
        if (search.trim()) list = list.filter((r) => r.body?.toLowerCase().includes(search.toLowerCase()));
        if (sort === "helpful") list.sort((a, b) => (b.helpful ?? 0) - (a.helpful ?? 0));
        else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return list;
    }, [reviews, filter, platform, search, sort]);

    const ratingCounts = useMemo(() => {
        const c = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach((r) => { const n = Math.round(r.rating); if (c[n] !== undefined) c[n]++; });
        return c;
    }, [reviews]);

    const avgRating = reviews.length
        ? (reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length).toFixed(1)
        : 0;

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh] gap-4 flex-col">
            <div className="loader" /><p className="text-gray-500 text-sm animate-pulse">Loading reviews…</p>
        </div>
    );

    return (
        <>
            <style>{`
                @keyframes fadeSlideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
                .animate-in { animation: fadeSlideUp 0.4s ease both; }
            `}</style>

            <div className="animate-in max-w-5xl mx-auto space-y-8">

                {/* Back */}
                <Link to={`/product/${id}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors font-bold">
                    <HiOutlineArrowLeft /> Back to Product
                </Link>

                {/* Product mini card */}
                {product && (
                    <div className="glass-card p-5 flex items-center gap-4">
                        <img src={product.images?.[0]} alt={product.title}
                            className="w-16 h-16 object-contain rounded-xl bg-gray-900 border border-gray-800 flex-shrink-0 p-1" />
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{product.brand}</div>
                            <h2 className="font-black text-sm truncate">{product.title}</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <StarDisplay value={Number(avgRating)} size="text-xs" />
                                <span className="text-xs text-gray-500 font-bold">{avgRating} · {reviews.length} reviews</span>
                            </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <div className="text-xl font-black text-white">${product.price}</div>
                            <Link to={`/product/${id}`} className="text-[11px] text-primary font-bold hover:underline">View Product</Link>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar: rating breakdown */}
                    <div className="space-y-6">
                        <div className="glass-card p-6 space-y-5">
                            <div className="text-center">
                                <div className="text-6xl font-black">{avgRating}</div>
                                <StarDisplay value={Number(avgRating)} size="text-lg" />
                                <div className="text-xs text-gray-500 mt-1 font-bold">{reviews.length} reviews</div>
                            </div>
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map((n) => (
                                    <button key={n} onClick={() => setFilter(filter === String(n) ? "all" : String(n))}
                                        className={`w-full transition-all rounded-lg px-1 py-0.5 ${filter === String(n) ? "bg-amber-500/10" : "hover:bg-gray-800/40"}`}>
                                        <RatingBar label={n} count={ratingCounts[n]} total={reviews.length} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Platform filter */}
                        {platforms.length > 1 && (
                            <div className="glass-card p-5 space-y-3">
                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Filter by Platform</div>
                                <div className="flex flex-col gap-1.5">
                                    {platforms.map((p) => (
                                        <button key={p} onClick={() => setPlatform(p)}
                                            className={`text-left text-xs font-bold px-3 py-2 rounded-xl transition-all capitalize ${platform === p ? "bg-primary/15 text-primary border border-primary/30" : "text-gray-500 hover:text-white hover:bg-gray-800/40"}`}>
                                            {p === "all" ? "All Platforms" : p}
                                            <span className="ml-1 text-[10px] text-gray-600">
                                                ({p === "all" ? reviews.length : reviews.filter((r) => r.platformUsed === p).length})
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Reviews list */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Controls */}
                        <div className="flex gap-3 flex-wrap">
                            <div className="relative flex-1 min-w-[160px]">
                                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                                <input value={search} onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-gray-900/60 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-sm placeholder-gray-600 focus:border-primary/50 focus:outline-none"
                                    placeholder="Search reviews…" />
                            </div>
                            <select value={sort} onChange={(e) => setSort(e.target.value)}
                                className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none">
                                <option value="recent">Most Recent</option>
                                <option value="helpful">Most Helpful</option>
                            </select>
                            {(filter !== "all" || platform !== "all" || search) && (
                                <button onClick={() => { setFilter("all"); setPlatform("all"); setSearch(""); }}
                                    className="flex items-center gap-1.5 text-xs font-bold text-rose-400 border border-rose-500/30 px-3 py-2 rounded-xl hover:bg-rose-500/10 transition-all">
                                    <HiOutlineX /> Clear
                                </button>
                            )}
                        </div>

                        <div className="text-xs text-gray-600 font-bold">{filtered.length} review{filtered.length !== 1 ? "s" : ""}</div>

                        {filtered.length === 0 ? (
                            <div className="glass-card p-10 text-center text-gray-500">
                                <HiOutlineStar className="text-4xl mx-auto mb-3 text-gray-700" />
                                <p className="font-bold">No reviews match your filters</p>
                            </div>
                        ) : filtered.map((r, i) => (
                            <div key={r._id ?? i}
                                className="glass-card p-5 space-y-3"
                                style={{ animation: "fadeSlideUp 0.35s ease both", animationDelay: `${i * 40}ms` }}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-black text-gray-400 flex-shrink-0">
                                            {r.user?.name?.[0]?.toUpperCase() ?? <HiOutlineUser />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-black">{r.user?.name ?? "Verified Buyer"}</div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <StarDisplay value={r.rating} size="text-xs" />
                                                {r.platformUsed && (
                                                    <span className="text-[10px] font-bold text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">{r.platformUsed}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                        {r.createdAt && (
                                            <span className="text-[11px] text-gray-600 flex items-center gap-1">
                                                <HiOutlineClock className="text-xs" />
                                                {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </span>
                                        )}
                                        {r.user?.verified && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                                                <HiOutlineBadgeCheck /> Verified
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {r.body && <p className="text-sm text-gray-300 leading-relaxed">{r.body}</p>}

                                <div className="flex items-center gap-4 pt-1 flex-wrap">
                                    {r.foundTarget !== undefined && (
                                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${r.foundTarget ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
                                            {r.foundTarget ? "✓ Found what needed" : "✗ Didn't find"}
                                        </span>
                                    )}
                                    {r.qualityMatch !== undefined && (
                                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${r.qualityMatch ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
                                            {r.qualityMatch ? "✓ Good quality" : "✗ Poor quality"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}