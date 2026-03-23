import React, { useState, useEffect, useMemo } from "react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import {
    HiOutlineTag,
    HiOutlineFire,
    HiOutlineCash,
    HiOutlineLightningBolt,
    HiOutlineStar,
    HiOutlineClock,
    HiOutlineChevronDown,
    HiOutlineRefresh,
    HiOutlineShieldCheck,
    HiOutlineSparkles,
    HiOutlineTrendingUp,
} from "react-icons/hi";

// ─── countdown timer hook ────────────────────────────────────────────────────
function useCountdown(targetHours = 24) {
    const [time, setTime] = useState({ h: targetHours, m: 59, s: 59 });
    useEffect(() => {
        const id = setInterval(() => {
            setTime((prev) => {
                let { h, m, s } = prev;
                s--;
                if (s < 0) { s = 59; m--; }
                if (m < 0) { m = 59; h--; }
                if (h < 0) return { h: targetHours, m: 59, s: 59 };
                return { h, m, s };
            });
        }, 1000);
        return () => clearInterval(id);
    }, [targetHours]);
    return time;
}

// ─── helpers ─────────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");

const DEAL_BADGE = (score) => {
    if (score >= 90) return { label: "🏆 Elite Pick", cls: "bg-amber-500/20 text-amber-300 border-amber-500/40" };
    if (score >= 80) return { label: "🔥 Hot Deal",   cls: "bg-rose-500/20 text-rose-300 border-rose-500/40" };
    if (score >= 70) return { label: "⚡ Great Value", cls: "bg-violet-500/20 text-violet-300 border-violet-500/40" };
    return              { label: "✓ Good Pick",     cls: "bg-gray-700/60 text-gray-400 border-gray-600/40" };
};

const TABS = [
    { key: "all",       label: "All Deals",     icon: <HiOutlineSparkles /> },
    { key: "top_rated", label: "Top Rated",      icon: <HiOutlineStar /> },
    { key: "best_price",label: "Best Price",     icon: <HiOutlineCash /> },
    { key: "trending",  label: "Trending",       icon: <HiOutlineTrendingUp /> },
];

const SORT_OPTIONS = [
    { value: "score_desc",  label: "Highest Score" },
    { value: "price_asc",   label: "Price: Low → High" },
    { value: "price_desc",  label: "Price: High → Low" },
    { value: "value",       label: "Best Value Ratio" },
];

// ─── stat pill ───────────────────────────────────────────────────────────────
function StatPill({ icon, label, value, color }) {
    return (
        <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border ${color} backdrop-blur-sm`}>
            <span className="text-xl">{icon}</span>
            <div>
                <div className="text-xs font-bold opacity-70 uppercase tracking-wider">{label}</div>
                <div className="text-base font-black">{value}</div>
            </div>
        </div>
    );
}

// ─── deal card wrapper (adds rank badge + deal badge on top of ProductCard) ──
function DealCard({ product, rank, index }) {
    const badge = DEAL_BADGE(product.productScore ?? product.qualityScore ?? 0);
    return (
        <div
            className="relative group"
            style={{ animationDelay: `${index * 60}ms`, animation: "fadeSlideUp 0.4s ease both" }}
        >
            {/* Rank badge */}
            {rank <= 3 && (
                <div className={`absolute -top-3 -left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 shadow-lg
                    ${rank === 1 ? "bg-amber-400 border-amber-300 text-black" :
                      rank === 2 ? "bg-gray-300 border-gray-200 text-black" :
                                   "bg-orange-600 border-orange-500 text-white"}`}>
                    #{rank}
                </div>
            )}

            {/* Deal badge */}
            <div className={`absolute top-3 right-3 z-10 text-[10px] font-bold px-2.5 py-1 rounded-full border ${badge.cls} backdrop-blur-sm`}>
                {badge.label}
            </div>

            <ProductCard product={product} index={index} />
        </div>
    );
}

// ─── main component ──────────────────────────────────────────────────────────
const BestDeals = () => {
    const [deals, setDeals]         = useState([]);
    const [eliteBrands, setEliteBrands] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [tab, setTab]             = useState("all");
    const [sort, setSort]           = useState("score_desc");
    const [maxPrice, setMaxPrice]   = useState(1000);
    const [minScore, setMinScore]   = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [visibleCount, setVisibleCount] = useState(12);

    const countdown = useCountdown(23);

    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        try {
            const [prodRes, brandRes] = await Promise.all([
                api.get("/products?sort=score&limit=80"),
                api.get("/products/brands?limit=50")
            ]);
            
            const prodList = prodRes.data?.results ?? prodRes.data ?? [];
            const brandList = brandRes.data?.results ?? brandRes.data ?? [];
            
            setDeals(prodList);
            setEliteBrands(brandList.filter(b => b.reputationScore >= 90));
        } catch (err) {
            console.error("Deals load error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // ── filtering & sorting ──────────────────────────────────────────────────
    const processed = useMemo(() => {
        let list = [...deals];

        // "Elite selection" tab: only products from elite brands
        if (tab === "top_rated") {
            const eliteNames = new Set(eliteBrands.map(b => b.name.toLowerCase()));
            list = list.filter(p => (p.productScore ?? 0) >= 80 || (p.brand && eliteNames.has(p.brand.toLowerCase())));
        }
        
        if (tab === "best_price") list = list.sort((a, b) => a.price - b.price);
        if (tab === "trending")   list = list.filter((p) => p.trending || (p.productScore ?? 0) >= 75);

        // price + score filter
        list = list.filter((p) => p.price <= maxPrice && (p.productScore ?? p.qualityScore ?? 0) >= minScore);

        // sort
        if (sort === "score_desc")  list.sort((a, b) => (b.productScore ?? 0) - (a.productScore ?? 0));
        if (sort === "price_asc")   list.sort((a, b) => a.price - b.price);
        if (sort === "price_desc")  list.sort((a, b) => b.price - a.price);
        if (sort === "value") {
            list.sort((a, b) => {
                const va = (a.productScore ?? 0) / Math.max(a.price, 1);
                const vb = (b.productScore ?? 0) / Math.max(b.price, 1);
                return vb - va;
            });
        }

        return list;
    }, [deals, tab, sort, maxPrice, minScore]);

    const visible = processed.slice(0, visibleCount);
    const hasMore = visibleCount < processed.length;

    // ── stats ─────────────────────────────────────────────────────────────────
    const avgScore   = deals.length ? Math.round(deals.reduce((s, p) => s + (p.productScore ?? 0), 0) / deals.length) : 0;
    const topScore   = deals.length ? Math.max(...deals.map((p) => p.productScore ?? 0)) : 0;
    const lowestPrice = deals.length ? Math.min(...deals.filter((p) => p.price > 0).map((p) => p.price)) : 0;

    // ── render ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="loader"></div>
                <p className="text-gray-500 text-sm animate-pulse">Finding the best deals…</p>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse-glow {
                    0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
                    50%     { box-shadow: 0 0 20px 4px rgba(99,102,241,0.25); }
                }
                .glow-pulse { animation: pulse-glow 3s ease-in-out infinite; }
            `}</style>

            <div className="animate-in space-y-12">

                {/* ── Hero Header ─────────────────────────────────────────── */}
                <div className="relative text-center py-10 px-4 overflow-hidden rounded-3xl border border-gray-800/60"
                    style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.12), transparent)" }}>

                    {/* Decorative dots */}
                    <div className="absolute top-4 left-8 w-1.5 h-1.5 rounded-full bg-primary/40" />
                    <div className="absolute top-10 left-20 w-1 h-1 rounded-full bg-violet-400/30" />
                    <div className="absolute top-6 right-12 w-1.5 h-1.5 rounded-full bg-amber-400/40" />
                    <div className="absolute top-14 right-24 w-1 h-1 rounded-full bg-rose-400/30" />

                    <div className="flex items-center justify-center gap-2 mb-3">
                        <HiOutlineShieldCheck className="text-primary text-lg" />
                        <span className="text-xs text-primary font-bold uppercase tracking-widest">Elite AI Selection</span>
                    </div>

                    <h2 className="text-4xl font-black mb-3">
                        Premium Brand<br />
                        <span className="text-primary">Elite Recommendations</span>
                    </h2>
                    <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
                        Curated collection of top-performing brands and products, scored across quality, brand reputation, and real customer reviews.
                        Updated daily.
                    </p>

                    {/* Badge pills */}
                    <div className="flex gap-3 justify-center mt-6 flex-wrap">
                        <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary/15 text-primary border border-primary/30 rounded-full font-bold">
                            <HiOutlineFire /> Top Rated
                        </span>
                        <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full font-bold">
                            <HiOutlineCash /> Best Price
                        </span>
                        <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full font-bold">
                            <HiOutlineTag /> Limited Deals
                        </span>
                        <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-full font-bold">
                            <HiOutlineLightningBolt /> Flash Sales
                        </span>
                    </div>
                </div>

                {/* ── Countdown + Stats bar ────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                    {/* Countdown */}
                    <div className="glass-card px-6 py-4 flex items-center gap-4 glow-pulse">
                        <HiOutlineClock className="text-primary text-xl flex-shrink-0" />
                        <div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Deals refresh in</div>
                            <div className="flex items-center gap-1 font-mono font-black text-xl">
                                <span className="bg-gray-800 px-2 py-0.5 rounded-lg">{pad(countdown.h)}</span>
                                <span className="text-gray-500">:</span>
                                <span className="bg-gray-800 px-2 py-0.5 rounded-lg">{pad(countdown.m)}</span>
                                <span className="text-gray-500">:</span>
                                <span className="bg-gray-800 px-2 py-0.5 rounded-lg text-primary">{pad(countdown.s)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats pills */}
                    <div className="flex gap-3 flex-wrap">
                        <StatPill icon={<HiOutlineFire />} label="Avg Score" value={`${avgScore}/100`} color="border-rose-500/20 bg-rose-500/5 text-rose-300" />
                        <StatPill icon={<HiOutlineStar />}  label="Top Score" value={`${topScore}/100`} color="border-amber-500/20 bg-amber-500/5 text-amber-300" />
                        <StatPill icon={<HiOutlineCash />}  label="From"      value={`$${lowestPrice}`} color="border-emerald-500/20 bg-emerald-500/5 text-emerald-300" />
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={() => fetchData(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 text-xs text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 px-4 py-2 rounded-xl transition-all self-start sm:self-auto"
                    >
                        <HiOutlineRefresh className={refreshing ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>

                {/* ── Tabs + Sort + Filters ────────────────────────────────── */}
                <div className="space-y-4">
                    {/* Tabs */}
                    <div className="flex gap-2 flex-wrap">
                        {TABS.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => { setTab(t.key); setVisibleCount(12); }}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                                    tab === t.key
                                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                        : "border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
                                }`}
                            >
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Sort + filter row */}
                    <div className="flex gap-3 items-center flex-wrap">
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="bg-gray-900 border border-gray-800 rounded-xl text-sm px-4 py-2.5 text-gray-300 cursor-pointer hover:border-gray-600 transition-colors"
                        >
                            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border transition-all font-bold ${showFilters ? "border-primary/50 text-primary bg-primary/10" : "border-gray-800 text-gray-400 hover:border-gray-600"}`}
                        >
                            Filters
                            <HiOutlineChevronDown className={`transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`} />
                        </button>

                        <span className="text-xs text-gray-600 ml-auto font-mono">
                            {processed.length} deal{processed.length !== 1 ? "s" : ""}
                        </span>
                    </div>

                    {/* Expandable filters */}
                    {showFilters && (
                        <div className="glass-card p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500 font-bold uppercase tracking-wider">Max Price</span>
                                    <span className="font-bold text-white">${maxPrice}</span>
                                </div>
                                <input
                                    type="range" min="10" max="5000" step="10"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                                    className="w-full accent-primary h-1.5 cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-gray-600">
                                    <span>$10</span><span>$5,000</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500 font-bold uppercase tracking-wider">Min Score</span>
                                    <span className="font-bold text-white">{minScore}</span>
                                </div>
                                <input
                                    type="range" min="0" max="100" step="5"
                                    value={minScore}
                                    onChange={(e) => setMinScore(Number(e.target.value))}
                                    className="w-full accent-primary h-1.5 cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-gray-600">
                                    <span>0</span><span>100</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Grid ─────────────────────────────────────────────────── */}
                {visible.length > 0 ? (
                    <>
                        <div className="products-grid">
                            {visible.map((p, i) => (
                                <DealCard key={p._id} product={p} rank={i + 1} index={i} />
                            ))}
                        </div>

                        {hasMore && (
                            <div className="flex flex-col items-center gap-3 pt-4">
                                <div className="text-xs text-gray-600">
                                    Showing {visible.length} of {processed.length} deals
                                </div>
                                <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-500"
                                        style={{ width: `${(visible.length / processed.length) * 100}%` }}
                                    />
                                </div>
                                <button
                                    onClick={() => setVisibleCount((c) => c + 12)}
                                    className="btn btn-primary flex items-center gap-2 mt-2"
                                >
                                    <HiOutlineChevronDown /> Load More Deals
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-state py-24 text-center space-y-4">
                        <div className="text-6xl">🔍</div>
                        <h3 className="text-gray-400 text-xl font-bold">No deals match your filters</h3>
                        <p className="text-gray-600 text-sm">Try raising your max price or lowering the minimum score.</p>
                        <button
                            onClick={() => { setMaxPrice(1000); setMinScore(0); setTab("all"); }}
                            className="btn btn-primary mt-2"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default BestDeals;