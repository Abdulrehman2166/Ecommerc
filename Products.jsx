import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import {
    HiOutlineFilter,
    HiOutlineSearch,
    HiOutlineSparkles,
    HiOutlineX,
    HiOutlineAdjustments,
    HiOutlineChevronDown,
    HiOutlineChevronUp,
    HiOutlineRefresh,
    HiOutlineLightningBolt,
    HiOutlineExternalLink,
    HiOutlineShieldCheck,
    HiOutlineTrendingUp,
    HiOutlineTag,
    HiOutlineStar,
    HiOutlineViewGrid,
    HiOutlineViewList,
    HiOutlineArrowRight,
    HiOutlineDownload,
    HiOutlineCube,
} from "react-icons/hi";

// ─── constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 12;

const CATEGORIES = [
    { name: "Fashion", icon: "👗", subs: ["Clothes", "Shoes", "Watches", "Jewellery", "Beauty"] },
    { name: "Mobiles", icon: "📱", subs: ["Smartphones", "Tablets", "Accessories"] },
    { name: "Electronics", icon: "💻", subs: ["Laptops", "TVs", "Audio", "Cameras"] },
    { name: "Groceries", icon: "🥗", subs: ["Food", "Beverages", "Health"] },
    { name: "Home", icon: "🏠", subs: ["Furniture", "Kitchen", "Decor"] },
    { name: "Sports", icon: "⚽", subs: ["Fitness", "Outdoor", "Gear"] },
];

const SORT_OPTIONS = [
    { value: "score", label: "Best AI Match" },
    { value: "-rating", label: "Top Rated" },
    { value: "price", label: "Price: Low → High" },
    { value: "-price", label: "Price: High → Low" },
    { value: "-createdAt", label: "Newest First" },
];

const SCORE_COLOR = (v) =>
    v >= 80 ? "text-emerald-400" : v >= 60 ? "text-amber-400" : "text-rose-400";

// ─── active filter pill ───────────────────────────────────────────────────────
function FilterPill({ label, onRemove }) {
    return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-primary/15 border border-primary/30 text-primary px-3 py-1 rounded-full">
            {label}
            <button onClick={onRemove} className="hover:text-white transition-colors">
                <HiOutlineX className="text-xs" />
            </button>
        </span>
    );
}

// ─── collapsible sidebar section ──────────────────────────────────────────────
function SideSection({ title, children, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-800/60 pb-5 mb-5 last:border-0 last:mb-0 last:pb-0">
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors mb-3"
            >
                {title}
                {open ? <HiOutlineChevronUp className="text-sm" /> : <HiOutlineChevronDown className="text-sm" />}
            </button>
            {open && children}
        </div>
    );
}

// ─── AI verdict banner ────────────────────────────────────────────────────────
function VerdictBanner({ verdict, onDismiss }) {
    if (!verdict) return null;
    return (
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/15 via-primary/8 to-transparent p-6 mb-8 animate-in">
            <div className="absolute top-0 right-0 text-[120px] opacity-5 leading-none select-none pointer-events-none">
                ✨
            </div>
            <button onClick={onDismiss}
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                <HiOutlineX className="text-xs" />
            </button>

            <div className="flex items-center gap-2 mb-3">
                <HiOutlineSparkles className="text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">AI Market Analysis</span>
                {verdict.confidence_score && (
                    <span className="ml-auto text-[10px] text-gray-500 font-bold">
                        {verdict.confidence_score}% confidence
                    </span>
                )}
            </div>

            <h3 className="text-lg font-black mb-1">
                Best on: <span className="text-primary">{verdict.best_platform}</span>
            </h3>
            {verdict.reason && (
                <p className="text-sm text-gray-400 mb-4 max-w-2xl leading-relaxed">{verdict.reason}</p>
            )}

            {verdict.direct_link && (
                <a href={verdict.direct_link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 btn btn-primary text-sm py-2.5 px-5">
                    Open Store <HiOutlineExternalLink />
                </a>
            )}
        </div>
    );
}

// ─── sidebar component ────────────────────────────────────────────────────────
function Sidebar({ 
    category, setParam, subcategory, dbBrands, brand, 
    localMin, setLocalMin, localMax, setLocalMax, 
    localScore, setLocalScore, applyRangeFilters, 
    activeFilters, clearAll 
}) {
    return (
        <aside className="space-y-0">
            <SideSection title="Categories">
                <div className="space-y-1">
                    <button
                        onClick={() => setParam("category", "")}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-all ${!category ? "bg-primary/15 text-primary border border-primary/30" : "text-gray-400 hover:text-white hover:bg-gray-800/40"
                            }`}
                    >
                        All Products
                    </button>
                    {CATEGORIES.map((c) => (
                        <div key={c.name}>
                            <button
                                onClick={() => setParam("category", c.name)}
                                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-all ${category === c.name ? "bg-primary/15 text-primary border border-primary/30" : "text-gray-400 hover:text-white hover:bg-gray-800/40"
                                    }`}
                            >
                                <span>{c.icon}</span>{c.name}
                            </button>
                            {category === c.name && c.subs && (
                                <div className="ml-7 mt-1 space-y-0.5">
                                    {c.subs.map((s) => (
                                        <button key={s}
                                            onClick={() => setParam("subcategory", subcategory === s ? "" : s)}
                                            className={`block w-full text-left text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${subcategory === s ? "text-primary" : "text-gray-600 hover:text-gray-300"
                                                }`}
                                        >
                                            — {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </SideSection>

            {dbBrands.length > 0 && (
                <SideSection title="Brands" defaultOpen={false}>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                        {dbBrands.map((b) => (
                            <button key={b._id}
                                onClick={() => setParam("brand", brand === b.name ? "" : b.name)}
                                className={`w-full text-left text-xs px-3 py-2 rounded-xl font-bold flex items-center justify-between transition-all ${brand === b.name ? "bg-primary/15 text-primary border border-primary/30" : "text-gray-500 hover:text-white hover:bg-gray-800/40"
                                    }`}
                            >
                                <span>{b.name}</span>
                                {b.reputationScore > 0 && (
                                    <span className={`text-[10px] font-black ${SCORE_COLOR(b.reputationScore)}`}>{b.reputationScore}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </SideSection>
            )}

            <SideSection title="Price Range" defaultOpen={false}>
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[10px] text-gray-600 font-bold mb-1 block">Min ($)</label>
                            <input type="number" min="0" placeholder="0"
                                value={localMin}
                                onChange={(e) => setLocalMin(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm focus:border-primary/50 focus:outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-600 font-bold mb-1 block">Max ($)</label>
                            <input type="number" min="0" placeholder="9999"
                                value={localMax}
                                onChange={(e) => setLocalMax(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm focus:border-primary/50 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </SideSection>

            <SideSection title="Min AI Score" defaultOpen={false}>
                <div className="space-y-2">
                    {[0, 60, 70, 80, 90].map((v) => (
                        <button key={v}
                            onClick={() => setLocalScore(v === 0 ? "" : String(v))}
                            className={`w-full text-left text-xs px-3 py-2 rounded-xl font-bold transition-all ${(localScore === String(v) || (v === 0 && !localScore))
                                ? "bg-primary/15 text-primary border border-primary/30"
                                : "text-gray-500 hover:text-white hover:bg-gray-800/40"
                                }`}
                        >
                            {v === 0 ? "Any score" : `${v}+ (${v >= 80 ? "Excellent" : v >= 70 ? "Good" : "Fair"})`}
                        </button>
                    ))}
                </div>
            </SideSection>

            <button
                onClick={applyRangeFilters}
                className="w-full btn btn-primary text-sm py-3 font-black mt-2"
            >
                Apply Filters
            </button>

            {activeFilters.length > 0 && (
                <button onClick={clearAll}
                    className="w-full text-xs text-gray-500 hover:text-rose-400 transition-colors font-bold pt-2">
                    Clear all filters
                </button>
            )}
        </aside>
    );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function Products() {
    const [searchParams, setSearchParams] = useSearchParams();

    // ── URL params ────────────────────────────────────────────────────────────
    const q = searchParams.get("q") || "";
    const brand = searchParams.get("brand") || "";
    const category = searchParams.get("category") || "";
    const subcategory = searchParams.get("subcategory") || "";
    const sort = searchParams.get("sort") || "score";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const minScore = searchParams.get("minScore") || "";

    // ── state ─────────────────────────────────────────────────────────────────
    const [products, setProducts] = useState([]);
    const [dbBrands, setDbBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [verdict, setVerdict] = useState(null);
    const [verdictLoading, setVerdictL] = useState(false);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [totalCount, setTotalCount] = useState(0);
    const [view, setView] = useState("grid"); // grid | list
    const [sidebarOpen, setSidebarOpen] = useState(false);  // mobile

    // local filter state (applied on submit / change)
    const [localMin, setLocalMin] = useState(minPrice);
    const [localMax, setLocalMax] = useState(maxPrice);
    const [localScore, setLocalScore] = useState(minScore);

    const searchRef = useRef(null);

    // ── update URL param ──────────────────────────────────────────────────────
    const setParam = useCallback((key, value) => {
        const p = new URLSearchParams(searchParams);
        if (value) p.set(key, value);
        else p.delete(key);
        if (key === "category") p.delete("subcategory");
        setSearchParams(p);
        setVisibleCount(PAGE_SIZE);
    }, [searchParams, setSearchParams]);

    const clearAll = () => {
        setSearchParams({});
        setLocalMin(""); setLocalMax(""); setLocalScore("");
        setVisibleCount(PAGE_SIZE);
    };

    // ── apply local price/score filters ───────────────────────────────────────
    const applyRangeFilters = () => {
        const p = new URLSearchParams(searchParams);
        localMin ? p.set("minPrice", localMin) : p.delete("minPrice");
        localMax ? p.set("maxPrice", localMax) : p.delete("maxPrice");
        localScore ? p.set("minScore", localScore) : p.delete("minScore");
        setSearchParams(p);
        setVisibleCount(PAGE_SIZE);
        setSidebarOpen(false);
    };

    // ── AI verdict ────────────────────────────────────────────────────────────
    const fetchVerdict = useCallback(async (query) => {
        if (!query) return;
        setVerdictL(true);
        setVerdict(null);
        try {
            const res = await api.post("/products/market-verdict", { query });
            setVerdict(res.data);
        } catch { /* silent */ }
        finally { setVerdictL(false); }
    }, []);

    const [importing, setImporting] = useState(false);

    // ── import data ──────────────────────────────────────────────────────────
    const handleImport = async () => {
        setImporting(true);
        try {
            await api.get("/products/import/dummy");
            // reload products
            const res = await api.get("/products", { params: { limit: 80 } });
            const list = res.data?.results ?? res.data ?? [];
            setProducts(list);
            setTotalCount(res.data?.total ?? list.length);
        } catch {
            alert("Import failed. Make sure the backend is running.");
        } finally {
            setImporting(false);
        }
    };

    const shuffleProducts = async () => {
        setLoading(true);
        try {
            const terms = ["laptop", "iphone", "nike", "furniture", "watch", "shoes"];
            const randomTerm = terms[Math.floor(Math.random() * terms.length)];
            const res = await api.get("/products", { params: { query: randomTerm, limit: 12 } });
            const list = res.data?.results ?? res.data ?? [];
            setProducts(list);
            setTotalCount(res.data?.total ?? list.length);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    // ── main fetch ────────────────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const params = {
                    ...(q && { query: q }),
                    ...(brand && { brand }),
                    ...(category && { category }),
                    ...(subcategory && { subcategory }),
                    ...(sort && { sort }),
                    ...(minPrice && { minPrice }),
                    ...(maxPrice && { maxPrice }),
                    ...(minScore && { minScore }),
                    limit: 80,
                };
                const [prodRes, brandRes] = await Promise.allSettled([
                    api.get("/products", { params }),
                    api.get("/products/brands"),
                ]);

                if (prodRes.status === "fulfilled") {
                    const d = prodRes.value.data;
                    const list = d?.results ?? d ?? [];
                    setProducts(list);
                    setTotalCount(d?.total ?? list.length);

                    // auto-verdict for searches that return nothing
                    if (q && list.length === 0 && !verdict) fetchVerdict(q);
                }
                if (brandRes.status === "fulfilled") {
                    const d = brandRes.value.data;
                    setDbBrands(d?.results ?? d ?? []);
                }
            } catch { /* silent */ }
            finally { setLoading(false); }
        };
        load();
    }, [q, brand, category, subcategory, sort, minPrice, maxPrice, minScore, fetchVerdict, verdict]);

    // ── active filter pills ───────────────────────────────────────────────────
    const activeFilters = [
        q && { label: `"${q}"`, key: "q" },
        category && { label: category, key: "category" },
        subcategory && { label: subcategory, key: "subcategory" },
        brand && { label: brand, key: "brand" },
        minPrice && { label: `Min $${minPrice}`, key: "minPrice" },
        maxPrice && { label: `Max $${maxPrice}`, key: "maxPrice" },
        minScore && { label: `Score ≥ ${minScore}`, key: "minScore" },
    ].filter(Boolean);

    const visible = products.slice(0, visibleCount);

    // ─── sidebar props ───────────────────────────────────────────────────────
    const sidebarProps = {
        category, setParam, subcategory, dbBrands, brand,
        localMin, setLocalMin, localMax, setLocalMax,
        localScore, setLocalScore, applyRangeFilters,
        activeFilters, clearAll
    };

    // ─── render ───────────────────────────────────────────────────────────────
    return (
        <React.Fragment>
            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity:0; transform:translateY(14px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                @keyframes slideInLeft {
                    from { transform: translateX(-100%); }
                    to   { transform: translateX(0); }
                }
                .animate-in { animation: fadeSlideUp 0.4s ease both; }
                .animate-in-slide-left { animation: slideInLeft 0.3s ease-out both; }
                .products-grid-list { display:flex; flex-direction:column; gap:0.75rem; }
            `}</style>

            <div className="animate-in space-y-0">

                {/* ── Top search + controls bar ─────────────────────────── */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    {/* Search */}
                    <div className="relative flex-1">
                        <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            ref={searchRef}
                            className="w-full bg-gray-900/60 border border-gray-800 rounded-xl pl-10 pr-9 py-3 text-sm placeholder-gray-600 focus:border-primary/50 focus:outline-none transition-colors"
                            placeholder="Search products, brands, categories…"
                            value={q}
                            onChange={(e) => setParam("q", e.target.value)}
                        />
                        {q && (
                            <button onClick={() => setParam("q", "")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
                                <HiOutlineX className="text-sm" />
                            </button>
                        )}
                    </div>

                    {/* Sort */}
                    <select
                        value={sort}
                        onChange={(e) => setParam("sort", e.target.value)}
                        className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary/50 focus:outline-none transition-colors"
                    >
                        {SORT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>

                    {/* View toggle */}
                    <div className="flex rounded-xl border border-gray-800 overflow-hidden flex-shrink-0">
                        <button onClick={() => setView("grid")}
                            className={`p-3 transition-all ${view === "grid" ? "bg-primary/20 text-primary" : "text-gray-500 hover:text-white"}`}>
                            <HiOutlineViewGrid />
                        </button>
                        <button onClick={() => setView("list")}
                            className={`p-3 transition-all border-l border-gray-800 ${view === "list" ? "bg-primary/20 text-primary" : "text-gray-500 hover:text-white"}`}>
                            <HiOutlineViewList />
                        </button>
                    </div>

                    {/* Mobile filter toggle */}
                    <button
                        onClick={() => setSidebarOpen((v) => !v)}
                        className="lg:hidden flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-800 text-sm font-bold text-gray-400 hover:text-white transition-all"
                    >
                        <HiOutlineAdjustments />
                        Filters
                        {activeFilters.length > 0 && (
                            <span className="bg-primary text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                                {activeFilters.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* ── Active filter pills ───────────────────────────────── */}
                {activeFilters.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {activeFilters.map(({ label, key }) => (
                            <FilterPill key={key} label={label}
                                onRemove={() => {
                                    if (key === "minPrice") setLocalMin("");
                                    if (key === "maxPrice") setLocalMax("");
                                    if (key === "minScore") setLocalScore("");
                                    setParam(key, "");
                                }}
                            />
                        ))}
                        <button onClick={clearAll} className="text-[11px] text-gray-600 hover:text-rose-400 font-bold transition-colors underline underline-offset-2">
                            Clear all
                        </button>
                    </div>
                )}

                {/* ── Layout: sidebar + grid ────────────────────────────── */}
                <div className="flex gap-8">

                    {/* Sidebar — desktop */}
                    <div className="hidden lg:block w-56 flex-shrink-0">
                        <div className="sticky top-24 glass-card p-5">
                            <Sidebar {...sidebarProps} />
                        </div>
                    </div>

                    {/* Mobile sidebar drawer */}
                    {sidebarOpen && (
                        <div className="fixed inset-0 z-50 lg:hidden flex">
                            <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
                            <div className="relative w-72 bg-gray-950 h-full p-6 overflow-y-auto border-r border-gray-800 animate-in-slide-left">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-black text-lg">Filters</h3>
                                    <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-white">
                                        <HiOutlineX className="text-xl" />
                                    </button>
                                </div>
                                <Sidebar {...sidebarProps} />
                            </div>
                        </div>
                    )}

                    {/* Main content */}
                    <div className="flex-1 min-w-0 space-y-6">

                        {/* Results count + AI verdict trigger */}
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            {loading
                                    ? "Loading…"
                                    : <>{products.length} product{products.length !== 1 ? "s" : ""} {q && `for "${q}"`}</>
                                }
                            </div>
                            <div className="flex items-center gap-3">
                                {!q && !category && (
                                    <button
                                        onClick={shuffleProducts}
                                        className="flex items-center gap-1.5 text-xs font-bold text-amber-400 border border-amber-400/30 px-3 py-1.5 rounded-full hover:bg-amber-400/10 transition-all"
                                    >
                                        <HiOutlineRefresh /> Discover Different
                                    </button>
                                )}
                                {q && !verdict && !verdictLoading && products.length > 0 && (
                                    <button
                                        onClick={() => fetchVerdict(q)}
                                        className="flex items-center gap-1.5 text-xs font-bold text-primary border border-primary/30 px-3 py-1.5 rounded-full hover:bg-primary/10 transition-all"
                                    >
                                        <HiOutlineSparkles /> Get AI Verdict
                                    </button>
                                )}
                            </div>
                            {verdictLoading && (
                                <span className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
                                    <HiOutlineRefresh className="animate-spin" /> Analyzing market…
                                </span>
                            )}
                        </div>

                        {/* AI verdict */}
                        <VerdictBanner verdict={verdict} onDismiss={() => setVerdict(null)} />

                        {/* Product grid / loading / empty */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="glass-card p-5 space-y-4 animate-pulse">
                                        <div className="w-full h-44 bg-gray-800 rounded-xl" />
                                        <div className="h-3 bg-gray-800 rounded w-3/4" />
                                        <div className="h-3 bg-gray-800 rounded w-1/2" />
                                        <div className="h-2 bg-gray-800 rounded w-full" />
                                        <div className="flex gap-2">
                                            <div className="h-9 bg-gray-800 rounded-xl flex-1" />
                                            <div className="h-9 w-9 bg-gray-800 rounded-xl" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div className={view === "grid"
                                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                                    : "products-grid-list"
                                }>
                                    {visible.map((p, i) => (
                                        <ProductCard key={p._id} product={p} index={i} listView={view === "list"} />
                                    ))}
                                </div>

                                {/* Load more */}
                                {visibleCount < products.length && (
                                    <div className="text-center pt-4">
                                        <button
                                            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                                            className="btn btn-primary flex items-center gap-2 mx-auto"
                                        >
                                            Load More
                                            <span className="text-xs opacity-70">
                                                ({visibleCount}/{products.length})
                                            </span>
                                        </button>
                                        {/* Progress bar */}
                                        <div className="mt-3 max-w-xs mx-auto h-1 bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary rounded-full transition-all duration-500"
                                                style={{ width: `${(visibleCount / products.length) * 100}%` }} />
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : q ? (
                            /* ── Empty search state ── */
                            <div className="space-y-8 animate-in">
                                <div className="glass-card p-8 text-center">
                                    <div className="text-5xl mb-4">🔍</div>
                                    <h2 className="text-2xl font-black mb-2">No results for &ldquo;{q}&rdquo;</h2>
                                    <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
                                        We couldn&apos;t find this in our catalog. Try searching on these platforms directly:
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-4">
                                        {[
                                            { name: "Daraz.pk", color: "#ff6c00", letter: "D", url: `https://www.daraz.pk/catalog/?q=${encodeURIComponent(q)}` },
                                            { name: "OLX Pakistan", color: "#3a77ff", letter: "O", url: `https://www.olx.com.pk/items/q-${encodeURIComponent(q)}` },
                                            { name: "Amazon", color: "#ff9900", letter: "A", url: `https://www.amazon.com/s?k=${encodeURIComponent(q)}` },
                                        ].map(({ name, color, letter, url }) => (
                                            <a key={name} href={url} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-gray-700 hover:border-gray-500 transition-all group">
                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                                                    style={{ backgroundColor: color }}>
                                                    {letter}
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-xs text-gray-500 font-bold">Search on</div>
                                                    <div className="text-sm font-black">{name}</div>
                                                </div>
                                                <HiOutlineExternalLink className="text-gray-600 group-hover:text-white transition-colors ml-1" />
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Suggested brands */}
                                {dbBrands.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">
                                            Top Brands in Our Catalog
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {dbBrands.slice(0, 6).map((b) => (
                                                <button key={b._id}
                                                    onClick={() => setParam("brand", b.name)}
                                                    className="glass-card p-4 text-left hover:border-primary/40 hover:bg-primary/5 transition-all group">
                                                    <div className="font-black text-sm truncate">{b.name}</div>
                                                    <div className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mt-0.5">{b.category}</div>
                                                    <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Browse <HiOutlineArrowRight />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* ── Default empty (no query, no category) ── */
                            <div className="flex flex-col items-center justify-center py-32 text-center gap-6">
                                <div className="w-24 h-24 rounded-3xl bg-gray-800/60 border border-gray-700 flex items-center justify-center">
                                    <HiOutlineCube className="text-5xl text-gray-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-400">Inventory is empty</h3>
                                    <p className="text-sm text-gray-600 max-w-xs mx-auto mt-2">
                                        Import sample products from DummyJSON to see the platform in action.
                                    </p>
                                </div>
                                <button
                                    onClick={handleImport}
                                    disabled={importing}
                                    className="btn btn-primary flex items-center gap-2"
                                >
                                    {importing ? (
                                        <><HiOutlineRefresh className="animate-spin" /> Importing…</>
                                    ) : (
                                        <><HiOutlineDownload /> Import Sample Data</>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}