import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import {
    HiOutlineGlobeAlt, HiOutlineStar,
    HiOutlineExternalLink,
    HiOutlineTag,
    HiOutlineTrendingUp,
    HiOutlineShieldCheck,
    HiOutlineLightningBolt,
    HiOutlineBadgeCheck,
    HiOutlineSearch,
} from "react-icons/hi";

const SCORE_COLOR = (v) => v >= 80 ? "text-emerald-400" : v >= 60 ? "text-amber-400" : "text-rose-400";
const SCORE_BG = (v) => v >= 80 ? "bg-emerald-400" : v >= 60 ? "bg-amber-400" : "bg-rose-400";
const TIERS = ["All", "Elite", "Trusted", "Verified", "New"];
const getTier = (s) => s >= 90 ? "Elite" : s >= 75 ? "Trusted" : s >= 55 ? "Verified" : "New";
const TIER_STYLE = {
    Elite: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    Trusted: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    Verified: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    New: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

function SellerCard({ seller, index }) {
    const tier = getTier(seller.reputationScore ?? 0);
    const score = seller.reputationScore ?? 0;
    return (
        <div className="glass-card p-5 flex flex-col gap-4 hover:border-gray-600 hover:-translate-y-0.5 transition-all"
            style={{ animation: "fadeSlideUp 0.35s ease both", animationDelay: `${index * 50}ms` }}>
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-lg font-black flex-shrink-0"
                    style={{ color: seller.color ?? "#6366f1" }}>
                    {seller.logo
                        ? <img src={seller.logo} alt={seller.name} className="w-full h-full object-contain rounded-xl p-1" />
                        : seller.name?.[0]?.toUpperCase()
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h3 className="font-black text-sm">{seller.name}</h3>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${TIER_STYLE[tier]}`}>{tier}</span>
                    </div>
                    <div className="text-[10px] text-gray-600 font-bold">{seller.category} · {seller.country}</div>
                </div>
                <div className={`text-xl font-black flex-shrink-0 ${SCORE_COLOR(score)}`}>{score}</div>
            </div>

            {/* Score bar */}
            <div className="space-y-1">
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${SCORE_BG(score)}`} style={{ width: `${score}%` }} />
                </div>
                <div className="flex justify-between text-[9px] text-gray-700 font-bold">
                    <span>Reputation Score</span>
                    <span>{score}/100</span>
                </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-3 text-[10px] text-gray-500 font-bold">
                {seller.productCount > 0 && (
                    <span className="flex items-center gap-1"><HiOutlineTag className="text-gray-600" /> {seller.productCount} products</span>
                )}
                {seller.rating > 0 && (
                    <span className="flex items-center gap-1"><HiOutlineStar className="text-amber-400" /> {seller.rating}</span>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-auto">
                <Link to={`/brands/${seller._id}`}
                    className="flex-1 text-center text-xs font-black py-2.5 rounded-xl border border-primary/40 text-primary hover:bg-primary hover:text-white transition-all">
                    View Profile
                </Link>
                {seller.website && (
                    <a href={seller.website} target="_blank" rel="noreferrer"
                        className="p-2.5 rounded-xl border border-gray-700 text-gray-500 hover:border-gray-500 hover:text-white transition-all">
                        <HiOutlineExternalLink />
                    </a>
                )}
            </div>
        </div>
    );
}

export default function Sellers() {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [tier, setTier] = useState("All");
    const [sort, setSort] = useState("reputation");

    useEffect(() => {
        api.get("/products/brands?limit=100")
            .then((r) => { const d = r.data; setSellers(d?.results ?? d ?? []); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        let list = [...sellers];
        if (tier !== "All") list = list.filter((s) => getTier(s.reputationScore ?? 0) === tier);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((s) => s.name?.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q));
        }
        if (sort === "reputation") list.sort((a, b) => (b.reputationScore ?? 0) - (a.reputationScore ?? 0));
        else if (sort === "name") list.sort((a, b) => a.name?.localeCompare(b.name));
        else if (sort === "products") list.sort((a, b) => (b.productCount ?? 0) - (a.productCount ?? 0));
        return list;
    }, [sellers, tier, search, sort]);

    const stats = {
        total: sellers.length,
        elite: sellers.filter((s) => getTier(s.reputationScore ?? 0) === "Elite").length,
        trusted: sellers.filter((s) => getTier(s.reputationScore ?? 0) === "Trusted").length,
        avg: sellers.length ? Math.round(sellers.reduce((s, b) => s + (b.reputationScore ?? 0), 0) / sellers.length) : 0,
    };

    return (
        <>
            <style>{`
                @keyframes fadeSlideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
                .animate-in { animation: fadeSlideUp 0.4s ease both; }
            `}</style>

            <div className="animate-in space-y-8 max-w-6xl mx-auto">

                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <HiOutlineShieldCheck className="text-primary" />
                        <span className="text-xs text-primary font-black uppercase tracking-widest">Seller Directory</span>
                    </div>
                    <h2 className="text-3xl font-black">Verified Sellers</h2>
                    <p className="text-gray-500 text-sm mt-1">Every seller AI-scored on reputation, quality and customer satisfaction</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { icon: <HiOutlineGlobeAlt />, color: "text-primary", label: "Total Sellers", value: stats.total },
                        { icon: <HiOutlineLightningBolt />, color: "text-amber-400", label: "Elite Brands", value: stats.elite },
                        { icon: <HiOutlineBadgeCheck />, color: "text-emerald-400", label: "Trusted Brands", value: stats.trusted },
                        { icon: <HiOutlineTrendingUp />, color: "text-violet-400", label: "Avg Score", value: stats.avg },
                    ].map(({ icon, color, label, value }) => (
                        <div key={label} className="glass-card p-5 flex flex-col items-center gap-2 text-center">
                            <div className={`text-xl ${color}`}>{icon}</div>
                            <div className="text-xl font-black">{value}</div>
                            <div className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-gray-900/60 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-sm placeholder-gray-600 focus:border-primary/50 focus:outline-none"
                            placeholder="Search sellers or categories…" />
                    </div>
                    <select value={sort} onChange={(e) => setSort(e.target.value)}
                        className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none">
                        <option value="reputation">By Reputation</option>
                        <option value="name">By Name</option>
                        <option value="products">By Products</option>
                    </select>
                </div>

                {/* Tier filters */}
                <div className="flex gap-2 flex-wrap">
                    {TIERS.map((t) => (
                        <button key={t} onClick={() => setTier(t)}
                            className={`px-4 py-2 rounded-xl border text-xs font-black transition-all ${tier === t ? "bg-primary border-primary text-white" : "border-gray-800 text-gray-400 hover:border-gray-600"
                                }`}>
                            {t}
                            <span className="ml-1.5 text-[10px] opacity-60">
                                ({t === "All" ? sellers.length : sellers.filter((s) => getTier(s.reputationScore ?? 0) === t).length})
                            </span>
                        </button>
                    ))}
                </div>

                <div className="text-xs text-gray-600 font-bold">{filtered.length} seller{filtered.length !== 1 ? "s" : ""}</div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="glass-card p-5 space-y-4 animate-pulse">
                                <div className="flex gap-3"><div className="w-12 h-12 bg-gray-800 rounded-xl" /><div className="flex-1 space-y-2"><div className="h-3 bg-gray-800 rounded w-2/3" /><div className="h-2 bg-gray-800 rounded w-1/2" /></div></div>
                                <div className="h-2 bg-gray-800 rounded" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map((s, i) => <SellerCard key={s._id} seller={s} index={i} />)}
                    </div>
                ) : (
                    <div className="glass-card p-12 text-center text-gray-500">
                        <HiOutlineSearch className="text-4xl mx-auto mb-3 text-gray-700" />
                        <p className="font-bold">No sellers match your search</p>
                        <button onClick={() => { setSearch(""); setTier("All"); }} className="text-primary text-sm font-bold mt-2 hover:underline">Clear filters</button>
                    </div>
                )}
            </div>
        </>
    );
}