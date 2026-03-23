import React, { useState, useEffect, useMemo } from "react";
import api from "../api/axios";
import {
    HiOutlineCheckCircle,
    HiOutlineSparkles,
    HiOutlineShieldCheck,
    HiOutlineStar,
    HiOutlineGlobeAlt,
    HiOutlineExternalLink,
    HiOutlineSearch,
    HiOutlineX,
    HiOutlineTrendingUp,
    HiOutlineBadgeCheck,
    HiOutlineFire,
    HiOutlineChevronDown,
    HiOutlineRefresh,
} from "react-icons/hi";

// ─── constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ["All", "Fashion", "Electronics", "Shoes", "Marketplace", "Home", "Beauty"];

const SORT_OPTIONS = [
    { value: "reputation_desc", label: "Highest Reputation" },
    { value: "reputation_asc",  label: "Lowest Reputation"  },
    { value: "name_asc",        label: "A → Z"              },
    { value: "products_desc",   label: "Most Products"      },
];

// Trust tier config — score thresholds
const TIER = (score) => {
    if (score >= 90) return { label: "Elite",    cls: "bg-amber-500/20 text-amber-300 border-amber-500/40",   dot: "bg-amber-400",   icon: "🏆" };
    if (score >= 75) return { label: "Trusted",  cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", dot: "bg-emerald-400", icon: "✓" };
    if (score >= 55) return { label: "Verified", cls: "bg-blue-500/20 text-blue-300 border-blue-500/40",       dot: "bg-blue-400",    icon: "🔵" };
    return               { label: "New",       cls: "bg-gray-700/60 text-gray-400 border-gray-600/40",        dot: "bg-gray-500",    icon: "○" };
};

const SCORE_COLOR = (v) =>
    v >= 75 ? "#10b981" : v >= 55 ? "#f59e0b" : "#ef4444";

// ─── sub-components ───────────────────────────────────────────────────────────

// Brand logo with auto fallback to colored initial circle
const BrandLogo = ({ brand }) => {
    const [err, setErr] = useState(false);
    if (err || !brand.logo) {
        return (
            <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg flex-shrink-0"
                style={{ backgroundColor: brand.color || "#6366f1" }}
            >
                {brand.name?.charAt(0)?.toUpperCase() || "B"}
            </div>
        );
    }
    return (
        <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center overflow-hidden border border-black/10 flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
            <img
                src={brand.logo}
                alt={brand.name}
                className="w-full h-full object-contain p-2"
                onError={() => setErr(true)}
            />
        </div>
    );
};

// Circular score ring (SVG)
const ScoreRing = ({ score, size = 56 }) => {
    const r = (size - 8) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    const color = SCORE_COLOR(score);
    return (
        <svg width={size} height={size} className="flex-shrink-0" style={{ transform: "rotate(-90deg)" }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
            <circle
                cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke={color} strokeWidth="5"
                strokeDasharray={`${dash} ${circ}`}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 1s ease" }}
            />
            <text
                x={size / 2} y={size / 2 + 1}
                textAnchor="middle" dominantBaseline="middle"
                fill={color} fontSize="11" fontWeight="800"
                style={{ transform: `rotate(90deg) translate(0px, -${size}px)`, transformOrigin: "center" }}
            >
                {score}
            </text>
        </svg>
    );
};

// Score attribute bar
const ScoreBar = ({ label, value }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[10px]">
            <span className="text-gray-500 font-bold uppercase tracking-wider">{label}</span>
            <span className="font-bold" style={{ color: SCORE_COLOR(value) }}>{value}%</span>
        </div>
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${value}%`, backgroundColor: SCORE_COLOR(value) }}
            />
        </div>
    </div>
);

// Individual brand card
const BrandCard = ({ brand, index }) => {
    const [flipped, setFlipped] = useState(false);
    const tier   = TIER(brand.reputationScore ?? brand.score ?? 0);
    const score  = brand.reputationScore ?? brand.score ?? 0;

    return (
        <div
            className="glass-card group relative flex flex-col gap-5 p-6 cursor-pointer hover:border-gray-600 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            style={{ animationDelay: `${index * 50}ms`, animation: "fadeSlideUp 0.4s ease both" }}
            onClick={() => brand.website && window.open(brand.website, "_blank")}
            onMouseEnter={() => setFlipped(true)}
            onMouseLeave={() => setFlipped(false)}
        >
            {/* Ambient glow on hover */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
                style={{ background: `radial-gradient(circle at 50% 0%, ${brand.color ?? "#6366f1"}18, transparent 70%)` }}
            />

            {/* Tier badge */}
            <div className={`absolute top-4 right-4 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${tier.cls}`}>
                <span>{tier.icon}</span> {tier.label}
            </div>

            {/* Top row: logo + name + origin */}
            <div className="flex items-center gap-4 pr-16">
                <BrandLogo brand={brand} />
                <div className="min-w-0">
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">
                        {brand.category || "General"}
                    </div>
                    <h3 className="text-lg font-black truncate leading-tight">{brand.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                        <HiOutlineGlobeAlt className="text-gray-600" />
                        <span>{brand.countryOrigin || "Global"}</span>
                        {brand.verified && (
                            <HiOutlineBadgeCheck className="text-primary ml-1" title="Verified Brand" />
                        )}
                    </div>
                </div>
            </div>

            {/* Score ring + overall score */}
            <div className="flex items-center gap-4">
                <ScoreRing score={score} size={56} />
                <div className="flex-1">
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Reputation Score</div>
                    <div className="text-2xl font-black" style={{ color: SCORE_COLOR(score) }}>{score}<span className="text-sm text-gray-600">/100</span></div>
                </div>
                {brand.totalProducts > 0 && (
                    <div className="text-right">
                        <div className="text-xl font-black text-white">{brand.totalProducts}</div>
                        <div className="text-[10px] text-gray-600 font-bold">Products</div>
                    </div>
                )}
            </div>

            {/* Score breakdown bars — revealed on hover */}
            <div className={`space-y-2 overflow-hidden transition-all duration-500 ${flipped ? "max-h-32 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="border-t border-gray-800/60 pt-3 space-y-2">
                    <ScoreBar label="Quality"     value={brand.qualityScore      ?? Math.round(score * 1.05)} />
                    <ScoreBar label="Trust"        value={brand.trustScore        ?? Math.round(score * 0.95)} />
                    <ScoreBar label="Customer Sat" value={brand.satisfactionScore ?? Math.round(score * 0.98)} />
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-800/60 mt-auto">
                <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold">
                    {brand.rating > 0 && (
                        <>
                            <HiOutlineStar className="text-amber-400" />
                            <span>{brand.rating?.toFixed(1)}</span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold group-hover:text-primary transition-colors">
                    Visit Store <HiOutlineExternalLink />
                </div>
            </div>
        </div>
    );
};

// Summary stat card
const SummaryCard = ({ icon, label, value, color }) => (
    <div className="glass-card px-6 py-5 flex items-center gap-4">
        <div className={`text-2xl ${color}`}>{icon}</div>
        <div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{label}</div>
            <div className="text-xl font-black">{value}</div>
        </div>
    </div>
);

// ─── main component ───────────────────────────────────────────────────────────

const BrandReputation = () => {
    const [brands, setBrands]       = useState([]);
    const [loading, setLoading]     = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter]       = useState("All");
    const [sort, setSort]           = useState("reputation_desc");
    const [searchTerm, setSearchTerm] = useState("");
    const [tierFilter, setTierFilter] = useState("All");
    const [visibleCount, setVisibleCount] = useState(12);

    const fetchBrands = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        try {
            const res = await api.get("/products/brands");
            setBrands(res.data?.results ?? res.data ?? []);
        } catch (err) {
            console.error("Brand load error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchBrands(); }, []);

    // ── derived data ──────────────────────────────────────────────────────────
    const processed = useMemo(() => {
        let list = [...brands];

        if (filter !== "All")     list = list.filter((b) => b.category === filter);
        if (tierFilter !== "All") list = list.filter((b) => TIER(b.reputationScore ?? b.score ?? 0).label === tierFilter);
        if (searchTerm)           list = list.filter((b) => b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || b.countryOrigin?.toLowerCase().includes(searchTerm.toLowerCase()));

        if (sort === "reputation_desc") list.sort((a, b) => (b.reputationScore ?? 0) - (a.reputationScore ?? 0));
        if (sort === "reputation_asc")  list.sort((a, b) => (a.reputationScore ?? 0) - (b.reputationScore ?? 0));
        if (sort === "name_asc")        list.sort((a, b) => a.name?.localeCompare(b.name));
        if (sort === "products_desc")   list.sort((a, b) => (b.totalProducts ?? 0) - (a.totalProducts ?? 0));

        return list;
    }, [brands, filter, sort, searchTerm, tierFilter]);

    const visible  = processed.slice(0, visibleCount);
    const hasMore  = visibleCount < processed.length;

    // stats
    const avgRep   = brands.length ? Math.round(brands.reduce((s, b) => s + (b.reputationScore ?? 0), 0) / brands.length) : 0;
    const eliteCount  = brands.filter((b) => (b.reputationScore ?? 0) >= 90).length;
    const verifiedCount = brands.filter((b) => b.verified).length;

    // ── loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="loader" />
                <p className="text-gray-500 text-sm animate-pulse">Loading brand network…</p>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity:0; transform:translateY(16px); }
                    to   { opacity:1; transform:translateY(0);    }
                }
            `}</style>

            <div className="animate-in space-y-10">

                {/* ── Hero ────────────────────────────────────────────────── */}
                <div
                    className="relative text-center py-12 px-6 rounded-3xl border border-gray-800/60 overflow-hidden"
                    style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,0.1), transparent)" }}
                >
                    <div className="absolute top-3 left-10  w-1.5 h-1.5 rounded-full bg-primary/40" />
                    <div className="absolute top-8 left-24  w-1   h-1   rounded-full bg-violet-400/30" />
                    <div className="absolute top-5 right-16 w-1.5 h-1.5 rounded-full bg-amber-400/40" />
                    <div className="absolute top-12 right-32 w-1  h-1   rounded-full bg-rose-400/30" />

                    <div className="flex items-center justify-center gap-2 mb-3">
                        <HiOutlineShieldCheck className="text-primary" />
                        <span className="text-xs text-primary font-bold uppercase tracking-widest">Trust Intelligence</span>
                    </div>
                    <h2 className="text-4xl font-black mb-3">
                        Brand <span className="text-primary">Reputation</span> Index
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
                        Every brand scored across quality, customer satisfaction, and global trust signals.
                        Hover any card to see the full breakdown.
                    </p>

                    <div className="flex gap-3 justify-center mt-6 flex-wrap text-xs">
                        {[
                            { icon: <HiOutlineFire />,       label: "AI Scored",    cls: "bg-rose-500/15 text-rose-300 border-rose-500/30"    },
                            { icon: <HiOutlineBadgeCheck />, label: "Verified Brands", cls: "bg-primary/15 text-primary border-primary/30"    },
                            { icon: <HiOutlineTrendingUp />, label: "Live Rankings", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
                        ].map(({ icon, label, cls }) => (
                            <span key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-bold ${cls}`}>
                                {icon} {label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ── Summary stats ────────────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <SummaryCard icon={<HiOutlineShieldCheck />} label="Total Brands"    value={brands.length}    color="text-primary"     />
                    <SummaryCard icon={<HiOutlineStar />}        label="Avg Reputation"  value={`${avgRep}/100`}  color="text-amber-400"   />
                    <SummaryCard icon={<HiOutlineSparkles />}    label="Elite Brands"    value={eliteCount}       color="text-amber-300"   />
                    <SummaryCard icon={<HiOutlineBadgeCheck />}  label="Verified"        value={verifiedCount}    color="text-emerald-400" />
                </div>

                {/* ── Controls ─────────────────────────────────────────────── */}
                <div className="glass-card p-5 space-y-4">
                    {/* Row 1: search + sort + refresh */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                            <input
                                className="w-full bg-gray-900/60 border border-gray-800 rounded-xl pl-9 pr-9 py-2.5 text-sm placeholder-gray-600 focus:border-primary/50 focus:outline-none transition-colors"
                                placeholder="Search brands or countries…"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(12); }}
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                                    <HiOutlineX className="text-sm" />
                                </button>
                            )}
                        </div>

                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="bg-gray-900 border border-gray-800 rounded-xl text-sm px-4 py-2.5 text-gray-300 hover:border-gray-600 transition-colors cursor-pointer"
                        >
                            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>

                        <button
                            onClick={() => fetchBrands(true)}
                            disabled={refreshing}
                            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 px-4 py-2.5 rounded-xl transition-all"
                        >
                            <HiOutlineRefresh className={refreshing ? "animate-spin" : ""} /> Refresh
                        </button>
                    </div>

                    {/* Row 2: category pills + tier filter */}
                    <div className="flex flex-wrap gap-2 items-center">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => { setFilter(cat); setVisibleCount(12); }}
                                className={`px-4 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                                    filter === cat
                                        ? "bg-primary border-primary text-white"
                                        : "border-gray-800 text-gray-400 hover:border-gray-600"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}

                        <div className="w-px h-4 bg-gray-800 mx-1 hidden sm:block" />

                        {/* Tier filter */}
                        {["All","Elite","Trusted","Verified","New"].map((t) => (
                            <button
                                key={t}
                                onClick={() => { setTierFilter(t); setVisibleCount(12); }}
                                className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${
                                    tierFilter === t
                                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                                        : "border-gray-800 text-gray-600 hover:border-gray-700 hover:text-gray-400"
                                }`}
                            >
                                {t === "All" ? "All Tiers" : TIER(t === "Elite" ? 95 : t === "Trusted" ? 80 : t === "Verified" ? 60 : 30).icon + " " + t}
                            </button>
                        ))}

                        <span className="ml-auto text-xs text-gray-600 font-mono">
                            {processed.length} brand{processed.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                {/* ── Brand Grid ───────────────────────────────────────────── */}
                {visible.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {visible.map((b, i) => (
                                <BrandCard key={b._id} brand={b} index={i} />
                            ))}
                        </div>

                        {hasMore && (
                            <div className="flex flex-col items-center gap-3 pt-4">
                                <div className="text-xs text-gray-600">
                                    Showing {visible.length} of {processed.length} brands
                                </div>
                                <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-500"
                                        style={{ width: `${(visible.length / processed.length) * 100}%` }}
                                    />
                                </div>
                                <button
                                    onClick={() => setVisibleCount((c) => c + 12)}
                                    className="btn btn-primary flex items-center gap-2 mt-1"
                                >
                                    <HiOutlineChevronDown /> Load More Brands
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-state py-28 text-center space-y-4">
                        <div className="text-6xl">🔍</div>
                        <h3 className="text-gray-400 text-xl font-bold">No brands found</h3>
                        <p className="text-gray-600 text-sm">Try a different category, tier, or search term.</p>
                        <button
                            onClick={() => { setFilter("All"); setTierFilter("All"); setSearchTerm(""); }}
                            className="btn btn-primary mt-2"
                        >
                            Reset All Filters
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default BrandReputation;