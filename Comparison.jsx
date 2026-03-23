import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
    HiOutlineScale,
    HiOutlineSparkles,
    HiOutlineStar,
    HiOutlineGlobeAlt,
    HiOutlineShieldCheck,
    HiOutlineLightningBolt,
    HiOutlineCash,
    HiOutlineTrendingUp,
    HiOutlineX,
    HiOutlinePlus,
    HiOutlineShare,
    HiOutlineCheckCircle,
    HiOutlineArrowRight,
    HiOutlineSearch,
    HiOutlineFire,
    HiOutlineBadgeCheck,
    HiOutlineInformationCircle,
    HiOutlineRefresh,
    HiOutlineDownload,
} from "react-icons/hi";
import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

// ─── constants ────────────────────────────────────────────────────────────────
const MAX_PRODUCTS = 4;

const SCORE_FIELDS = [
    { key: "qualityScore",     label: "Quality",    icon: <HiOutlineSparkles />,    color: "#6366f1" },
    { key: "reputationScore",  label: "Reputation", icon: <HiOutlineShieldCheck />,  color: "#10b981" },
    { key: "productScore",     label: "Overall",    icon: <HiOutlineTrendingUp />,   color: "#f59e0b" },
    { key: "rating",           label: "Rating",     icon: <HiOutlineStar />,         color: "#ec4899" },
];

const ROW_DEFS = [
    { key: "price",           label: "Price",            format: (v) => `$${Number(v).toFixed(2)}`,  bestFn: (vals) => Math.min(...vals), icon: <HiOutlineCash />         },
    { key: "qualityScore",    label: "Quality Score",    format: (v) => `${v}/100`,                  bestFn: (vals) => Math.max(...vals), icon: <HiOutlineSparkles />     },
    { key: "reputationScore", label: "Brand Reputation", format: (v) => `${v}/100`,                  bestFn: (vals) => Math.max(...vals), icon: <HiOutlineShieldCheck />  },
    { key: "productScore",    label: "Overall Score",    format: (v) => `${v}/100`,                  bestFn: (vals) => Math.max(...vals), icon: <HiOutlineTrendingUp />   },
    { key: "rating",          label: "User Rating",      format: (v) => `${Number(v).toFixed(1)} ★`, bestFn: (vals) => Math.max(...vals), icon: <HiOutlineStar />         },
    { key: "storeName",       label: "Store",            format: (v, p) => `${v} · ${p.country}`,    bestFn: null,                        icon: <HiOutlineGlobeAlt />     },
    { key: "category",        label: "Category",         format: (v) => v || "—",                    bestFn: null,                        icon: <HiOutlineInformationCircle /> },
];

// column accent colors per product index
const COL_COLORS = ["#6366f1","#10b981","#f59e0b","#ec4899"];

// ─── helpers ──────────────────────────────────────────────────────────────────
const SCORE_COLOR = (v) =>
    v >= 80 ? "#10b981" : v >= 60 ? "#f59e0b" : "#ef4444";

function ScoreBar({ value, max = 100, color }) {
    return (
        <div className="w-full mt-1.5">
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(value / max) * 100}%`, backgroundColor: color ?? SCORE_COLOR(value) }}
                />
            </div>
        </div>
    );
}

// ─── add product search modal ─────────────────────────────────────────────────
function AddProductModal({ existing, onAdd, onClose }) {
    const [query, setQuery]     = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query.trim()) { setResults([]); return; }
        const id = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await api.get(`/products?search=${encodeURIComponent(query)}&limit=8`);
                const all = res.data?.results ?? res.data ?? [];
                setResults(all.filter((p) => !existing.includes(p._id)));
            } catch { setResults([]); }
            finally { setLoading(false); }
        }, 350);
        return () => clearTimeout(id);
    }, [query]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
            onClick={onClose}
        >
            <div className="glass-card w-full max-w-lg p-6 space-y-4 animate-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <h3 className="font-black text-lg">Add Product to Compare</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <HiOutlineX className="text-xl" />
                    </button>
                </div>

                <div className="relative">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        autoFocus
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-3 text-sm placeholder-gray-600 focus:border-primary/50 focus:outline-none transition-colors"
                        placeholder="Search by name or brand…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {loading && <HiOutlineRefresh className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 animate-spin" />}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {results.map((p) => (
                        <button
                            key={p._id}
                            onClick={() => { onAdd(p); onClose(); }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-800 hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
                        >
                            <img src={p.images?.[0]} alt={p.title} className="w-12 h-12 object-cover rounded-lg bg-gray-800 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-bold truncate">{p.title}</div>
                                <div className="text-xs text-gray-500">{p.brand} · ${p.price}</div>
                            </div>
                            <span className="text-xs font-black px-2 py-1 rounded-full border"
                                style={{ color: SCORE_COLOR(p.productScore ?? 0), borderColor: SCORE_COLOR(p.productScore ?? 0) + "40", background: SCORE_COLOR(p.productScore ?? 0) + "15" }}>
                                {p.productScore ?? "—"}
                            </span>
                        </button>
                    ))}
                    {!loading && query && results.length === 0 && (
                        <div className="text-center text-gray-600 text-sm py-6">No matching products found</div>
                    )}
                    {!query && (
                        <div className="text-center text-gray-700 text-xs py-6">Start typing to search…</div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── winner verdict banner ────────────────────────────────────────────────────
function VerdictBanner({ winner, products }) {
    if (!winner) return null;
    const reasons = [];
    const others  = products.filter((p) => p._id !== winner._id);

    if (winner.productScore >= 80) reasons.push(`top overall score of ${winner.productScore}/100`);
    const cheapest = Math.min(...products.map((p) => p.price));
    if (winner.price === cheapest) reasons.push(`lowest price at $${winner.price.toFixed(2)}`);
    if (winner.qualityScore >= 80) reasons.push(`excellent quality score of ${winner.qualityScore}`);
    if (winner.reputationScore >= 80) reasons.push(`trusted brand reputation`);

    return (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6">
            <div className="absolute top-0 right-0 text-[120px] leading-none opacity-5 font-black select-none">🏆</div>
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-800">
                        <img src={winner.images?.[0]} alt={winner.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-3xl">🏆</div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-amber-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                        <HiOutlineFire /> AI Verdict · Best Pick
                    </div>
                    <h3 className="font-black text-lg leading-tight truncate">{winner.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                        <span className="text-white font-bold">{winner.brand}</span> wins with{" "}
                        {reasons.length > 0
                            ? reasons.join(", ")
                            : `the highest combined score across all metrics`}.
                    </p>
                </div>
                <Link
                    to={`/product/${winner._id}`}
                    className="btn btn-primary flex items-center gap-2 flex-shrink-0 text-sm"
                >
                    View Deal <HiOutlineArrowRight />
                </Link>
            </div>
        </div>
    );
}

// ─── main component ───────────────────────────────────────────────────────────
const Comparison = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [products,    setProducts]    = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [showModal,   setShowModal]   = useState(false);
    const [copied,      setCopied]      = useState(false);
    const [highlightCol, setHighlightCol] = useState(null);

    const ids = searchParams.get("ids") || "";

    // ── fetch ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchProducts = async () => {
            if (!ids) { setLoading(false); return; }
            setLoading(true);
            try {
                const res = await api.get(`/products/compare?ids=${ids}`);
                setProducts(res.data?.results ?? res.data ?? []);
            } catch (err) {
                console.error("Comparison load error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [ids]);

    // sync URL when products change
    const syncUrl = (prods) => {
        if (prods.length === 0) setSearchParams({});
        else setSearchParams({ ids: prods.map((p) => p._id).join(",") });
    };

    const addProduct = (p) => {
        const next = [...products, p];
        setProducts(next);
        syncUrl(next);
    };

    const removeProduct = (id) => {
        const next = products.filter((p) => p._id !== id);
        setProducts(next);
        syncUrl(next);
    };

    // ── winner logic ──────────────────────────────────────────────────────────
    const winner = useMemo(() => {
        if (products.length < 2) return null;
        return products.reduce((best, p) => {
            const scoreA = (best.productScore ?? 0) * 0.4 + (best.qualityScore ?? 0) * 0.3 + (best.reputationScore ?? 0) * 0.2 + ((100 - Math.min(best.price, 100)) * 0.1);
            const scoreB = (p.productScore    ?? 0) * 0.4 + (p.qualityScore    ?? 0) * 0.3 + (p.reputationScore    ?? 0) * 0.2 + ((100 - Math.min(p.price,    100)) * 0.1);
            return scoreB > scoreA ? p : best;
        });
    }, [products]);

    // ── radar data ────────────────────────────────────────────────────────────
    const radarData = useMemo(() =>
        SCORE_FIELDS.map(({ key, label }) => {
            const entry = { metric: label };
            products.forEach((p, i) => {
                entry[`p${i}`] = key === "rating" ? (p[key] ?? 0) * 20 : (p[key] ?? 0);
            });
            return entry;
        }), [products]);

    // ── share ─────────────────────────────────────────────────────────────────
    const shareUrl = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ── loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="loader" />
                <p className="text-gray-500 text-sm animate-pulse">Loading comparison…</p>
            </div>
        );
    }

    // ── empty state ───────────────────────────────────────────────────────────
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center animate-in">
                <div className="w-20 h-20 rounded-3xl bg-gray-800/60 border border-gray-700 flex items-center justify-center">
                    <HiOutlineScale className="text-4xl text-gray-500" />
                </div>
                <div>
                    <h3 className="text-2xl font-black mb-2">No Products to Compare</h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto">
                        Select products from the store and click "Compare" to see a side-by-side analysis.
                    </p>
                </div>
                <div className="flex gap-3 flex-wrap justify-center">
                    <Link to="/products" className="btn btn-primary flex items-center gap-2">
                        <HiOutlineSearch /> Browse Products
                    </Link>
                    <button onClick={() => setShowModal(true)} className="btn flex items-center gap-2 border border-gray-700 text-gray-300 hover:border-gray-500 px-5 py-2.5 rounded-xl text-sm font-bold transition-all">
                        <HiOutlinePlus /> Add Manually
                    </button>
                </div>
                {showModal && <AddProductModal existing={[]} onAdd={addProduct} onClose={() => setShowModal(false)} />}
            </div>
        );
    }

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity:0; transform:translateY(14px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                .animate-in { animation: fadeSlideUp 0.4s ease both; }
                .col-highlight { background: rgba(99,102,241,0.04); }
            `}</style>

            <div className="animate-in space-y-10 max-w-7xl mx-auto">

                {/* ── Header ──────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <HiOutlineScale className="text-primary" />
                            <span className="text-xs text-primary font-bold uppercase tracking-widest">Comparison Engine</span>
                        </div>
                        <h2 className="text-3xl font-black">Side-by-Side Analysis</h2>
                        <p className="text-gray-500 text-sm mt-1">
                            {products.length} product{products.length !== 1 ? "s" : ""} · AI-scored across quality, price & reputation
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={shareUrl}
                            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:border-gray-500 transition-all"
                        >
                            {copied ? <><HiOutlineCheckCircle className="text-emerald-400" /> Copied!</> : <><HiOutlineShare /> Share</>}
                        </button>
                        {products.length < MAX_PRODUCTS && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border border-primary/40 text-primary hover:bg-primary/10 transition-all"
                            >
                                <HiOutlinePlus /> Add Product
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Winner verdict ───────────────────────────────────────── */}
                <VerdictBanner winner={winner} products={products} />

                {/* ── Product headers ──────────────────────────────────────── */}
                <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
                    <div />
                    {products.map((p, i) => {
                        const isWinner = winner?._id === p._id;
                        return (
                            <div
                                key={p._id}
                                className={`glass-card p-5 flex flex-col items-center gap-3 relative transition-all duration-200 cursor-pointer ${
                                    highlightCol === i ? "border-primary/50 bg-primary/5" : ""
                                } ${isWinner ? "border-amber-500/40" : ""}`}
                                onMouseEnter={() => setHighlightCol(i)}
                                onMouseLeave={() => setHighlightCol(null)}
                            >
                                {/* Remove button */}
                                <button
                                    onClick={() => removeProduct(p._id)}
                                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-500 hover:text-rose-400 hover:border-rose-500/40 transition-all"
                                >
                                    <HiOutlineX className="text-xs" />
                                </button>

                                {/* Winner crown */}
                                {isWinner && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">🏆</div>
                                )}

                                <div className="relative mt-2">
                                    <img
                                        src={p.images?.[0]}
                                        alt={p.title}
                                        className="w-24 h-24 object-contain rounded-xl bg-gray-900 p-2"
                                    />
                                    <div
                                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2"
                                        style={{
                                            backgroundColor: SCORE_COLOR(p.productScore ?? 0) + "20",
                                            borderColor:     SCORE_COLOR(p.productScore ?? 0),
                                            color:           SCORE_COLOR(p.productScore ?? 0),
                                        }}
                                    >
                                        {p.productScore ?? "—"}
                                    </div>
                                </div>

                                <div className="text-center">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">{p.brand}</div>
                                    <div className="text-sm font-black leading-tight line-clamp-2 text-center">{p.title}</div>
                                    <div className="text-xl font-black text-primary mt-1">${p.price?.toFixed(2)}</div>
                                </div>

                                {/* Accent bar at bottom */}
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl transition-all duration-300"
                                    style={{ backgroundColor: COL_COLORS[i], opacity: highlightCol === i || isWinner ? 1 : 0.3 }} />
                            </div>
                        );
                    })}
                </div>

                {/* ── Comparison rows ──────────────────────────────────────── */}
                <div className="glass-card overflow-hidden">
                    {ROW_DEFS.map((row, ri) => {
                        const vals     = products.map((p) => p[row.key] ?? 0);
                        const numVals  = vals.map(Number).filter((v) => !isNaN(v) && v > 0);
                        const bestVal  = row.bestFn ? row.bestFn(numVals) : null;
                        const isScore  = ["qualityScore","reputationScore","productScore"].includes(row.key);

                        return (
                            <div
                                key={row.key}
                                className={`grid border-b border-gray-800/60 last:border-0 transition-colors ${ri % 2 === 0 ? "" : "bg-gray-900/20"}`}
                                style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}
                            >
                                {/* Row label */}
                                <div className="flex items-center gap-2 px-5 py-4 text-xs text-gray-500 font-bold uppercase tracking-wider border-r border-gray-800/60">
                                    <span className="text-gray-600">{row.icon}</span>
                                    {row.label}
                                </div>

                                {/* Cells */}
                                {products.map((p, ci) => {
                                    const raw      = p[row.key];
                                    const numVal   = Number(raw);
                                    const isBest   = bestVal !== null && numVal === bestVal && numVals.length > 1;
                                    const isHighlight = highlightCol === ci;

                                    return (
                                        <div
                                            key={p._id}
                                            className={`flex flex-col items-center justify-center px-4 py-4 text-center transition-colors ${
                                                isHighlight ? "bg-primary/5" : ""
                                            } ${ci < products.length - 1 ? "border-r border-gray-800/40" : ""}`}
                                            onMouseEnter={() => setHighlightCol(ci)}
                                            onMouseLeave={() => setHighlightCol(null)}
                                        >
                                            {/* Value */}
                                            <div className={`text-sm font-black flex items-center gap-1.5 justify-center ${
                                                isBest ? "text-emerald-400" : "text-white"
                                            }`}>
                                                {isBest && <HiOutlineCheckCircle className="text-emerald-400 text-base flex-shrink-0" />}
                                                {raw != null
                                                    ? row.format(raw, p)
                                                    : <span className="text-gray-700">—</span>
                                                }
                                            </div>

                                            {/* Score bar for numeric score fields */}
                                            {isScore && raw != null && (
                                                <ScoreBar value={numVal} color={COL_COLORS[ci]} />
                                            )}

                                            {/* Best label */}
                                            {isBest && (
                                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mt-1">Best</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}

                    {/* Action row */}
                    <div
                        className="grid border-t border-gray-700/60"
                        style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}
                    >
                        <div className="px-5 py-4 flex items-center text-xs text-gray-600 font-bold uppercase tracking-wider border-r border-gray-800/60">
                            Action
                        </div>
                        {products.map((p, ci) => (
                            <div key={p._id} className={`flex flex-col items-center gap-2 px-4 py-4 ${ci < products.length - 1 ? "border-r border-gray-800/40" : ""}`}>
                                <Link
                                    to={`/product/${p._id}`}
                                    className="w-full text-center text-xs font-black py-2.5 rounded-xl border border-primary/40 text-primary hover:bg-primary hover:text-white transition-all"
                                >
                                    View Details
                                </Link>
                                {p.productLink && (
                                    <a
                                        href={p.productLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full text-center text-xs font-bold py-2 rounded-xl border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white transition-all"
                                    >
                                        Buy Now ↗
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Radar chart ──────────────────────────────────────────── */}
                {products.length >= 2 && (
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-black text-lg">Score Radar</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Visual comparison across all metrics</p>
                            </div>
                            {/* Legend */}
                            <div className="flex flex-wrap gap-3">
                                {products.map((p, i) => (
                                    <div key={p._id} className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COL_COLORS[i] }} />
                                        <span className="truncate max-w-[80px]">{p.brand}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <ResponsiveContainer width="100%" height={320}>
                            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                                <PolarAngleAxis
                                    dataKey="metric"
                                    tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 700 }}
                                />
                                <Tooltip
                                    contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 10, fontSize: 12 }}
                                    formatter={(v, name) => [`${Math.round(v)}`, name]}
                                />
                                {products.map((p, i) => (
                                    <Radar
                                        key={p._id}
                                        name={p.brand}
                                        dataKey={`p${i}`}
                                        stroke={COL_COLORS[i]}
                                        fill={COL_COLORS[i]}
                                        fillOpacity={0.12}
                                        strokeWidth={2}
                                        dot={{ r: 3, fill: COL_COLORS[i] }}
                                    />
                                ))}
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* ── Add product CTA ──────────────────────────────────────── */}
                {products.length < MAX_PRODUCTS && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full glass-card p-6 border-dashed border-2 border-gray-700 hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-3 text-gray-500 hover:text-primary font-bold text-sm"
                    >
                        <HiOutlinePlus className="text-xl" />
                        Add another product to compare ({products.length}/{MAX_PRODUCTS})
                    </button>
                )}
            </div>

            {/* Add modal */}
            {showModal && (
                <AddProductModal
                    existing={products.map((p) => p._id)}
                    onAdd={addProduct}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
};

export default Comparison;