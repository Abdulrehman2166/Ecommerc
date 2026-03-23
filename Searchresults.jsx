import { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import {
    HiOutlineSearch, HiOutlineX, HiOutlineFilter,
    HiOutlineSparkles, HiOutlineArrowRight, HiOutlineClock,
} from "react-icons/hi";

const SORT_OPTIONS = [
    { value: "score", label: "Best Match" },
    { value: "-rating", label: "Top Rated" },
    { value: "price", label: "Price: Low → High" },
    { value: "-price", label: "Price: High → Low" },
    { value: "-createdAt", label: "Newest" },
];

const RECENT_KEY = "ch_recent_searches";
const getRecent = () => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); } catch { return []; } };
const addRecent = (q) => {
    const list = [q, ...getRecent().filter((r) => r !== q)].slice(0, 8);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
};

export default function SearchResults() {
    const [searchParams, setSearchParams] = useSearchParams();
    const q = searchParams.get("q") || "";
    const sort = searchParams.get("sort") || "score";
    const category = searchParams.get("category") || "";

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [brands, setBrands] = useState([]);
    const [cats, setCats] = useState([]);
    const [recent, setRecent] = useState(getRecent());
    const [input, setInput] = useState(q);
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [minScore, setMinScore] = useState("");
    const [brand, setBrand] = useState(searchParams.get("brand") || "");
    const [showFilt, setShowFilt] = useState(false);

    const setParam = (key, val) => {
        const p = new URLSearchParams(searchParams);
        val ? p.set(key, val) : p.delete(key);
        setSearchParams(p);
    };

    const doSearch = (query = input) => {
        if (!query.trim()) return;
        addRecent(query.trim());
        setRecent(getRecent());
        const p = new URLSearchParams(searchParams);
        p.set("q", query.trim());
        setSearchParams(p);
    };

    useEffect(() => {
        if (!q) { setLoading(false); return; }
        setLoading(true);
        const params = {
            query: q, sort, ...(category && { category }), ...(brand && { brand }),
            ...(minPrice && { minPrice }), ...(maxPrice && { maxPrice }), ...(minScore && { minScore }), limit: 60
        };
        api.get("/products", { params })
            .then((res) => {
                const d = res.data;
                const list = d?.results ?? d ?? [];
                setResults(list);
                setTotal(d?.total ?? list.length);
                setCats([...new Set(list.map((p) => p.category).filter(Boolean))]);
                setBrands([...new Set(list.map((p) => p.brand).filter(Boolean))].slice(0, 12));
            })
            .catch(() => setResults([]))
            .finally(() => setLoading(false));
    }, [q, sort, category, brand, minPrice, maxPrice, minScore]);

    const didYouMean = useMemo(() => {
        if (results.length > 0 || !q) return null;
        const words = q.split(" ");
        return words.length > 1 ? words[0] : null;
    }, [results, q]);

    return (
        <>
            <style>{`
                @keyframes fadeSlideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
                .animate-in { animation: fadeSlideUp 0.4s ease both; }
            `}</style>

            <div className="animate-in space-y-8 max-w-6xl mx-auto">

                {/* Search bar */}
                <div className="relative max-w-2xl">
                    <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                    <input
                        className="w-full bg-gray-900/70 border border-gray-700 rounded-2xl pl-12 pr-16 py-4 text-base placeholder-gray-600 focus:border-primary/50 focus:outline-none transition-colors"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && doSearch()}
                        placeholder="Search products, brands…"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                        {input && <button onClick={() => { setInput(""); setParam("q", ""); }}
                            className="p-2 text-gray-500 hover:text-white transition-colors"><HiOutlineX /></button>}
                        <button onClick={() => doSearch()}
                            className="btn btn-primary px-4 py-2 text-sm rounded-xl">Search</button>
                    </div>
                </div>

                {/* No query: show recent */}
                {!q && (
                    <div className="space-y-6">
                        {recent.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 font-black uppercase tracking-widest">
                                    <HiOutlineClock /> Recent Searches
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {recent.map((r) => (
                                        <button key={r} onClick={() => { setInput(r); doSearch(r); }}
                                            className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl border border-gray-800 text-gray-400 hover:border-primary/40 hover:text-primary transition-all font-bold">
                                            <HiOutlineClock className="text-xs text-gray-600" /> {r}
                                        </button>
                                    ))}
                                    <button onClick={() => { localStorage.removeItem(RECENT_KEY); setRecent([]); }}
                                        className="text-xs text-gray-700 hover:text-rose-400 font-bold transition-colors px-2">
                                        Clear
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="glass-card p-10 text-center">
                            <HiOutlineSearch className="text-5xl text-gray-700 mx-auto mb-4" />
                            <h3 className="text-xl font-black mb-2">Search our catalog</h3>
                            <p className="text-gray-500 text-sm">Find products, compare prices, and get AI-scored recommendations.</p>
                        </div>
                    </div>
                )}

                {/* Results header + filters */}
                {q && (
                    <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-black">
                                    {loading ? "Searching…" : `${total} result${total !== 1 ? "s" : ""} for`}{" "}
                                    {!loading && <span className="text-primary">&ldquo;{q}&rdquo;</span>}
                                </h2>
                                {didYouMean && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Did you mean{" "}
                                        <button onClick={() => { setInput(didYouMean); doSearch(didYouMean); }}
                                            className="text-primary font-bold hover:underline">{didYouMean}</button>?
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <select value={sort} onChange={(e) => setParam("sort", e.target.value)}
                                    className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm font-bold focus:border-primary/50 focus:outline-none">
                                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                                <button onClick={() => setShowFilt((v) => !v)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-bold transition-all ${showFilt ? "bg-primary/15 border-primary/40 text-primary" : "border-gray-800 text-gray-400 hover:text-white"}`}>
                                    <HiOutlineFilter /> Filters
                                </button>
                            </div>
                        </div>

                        {/* Filter panel */}
                        {showFilt && (
                            <div className="glass-card p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in">
                                {[["Min Price", "$", minPrice, setMinPrice], ["Max Price", "$", maxPrice, setMaxPrice], ["Min Score", "/100", minScore, setMinScore]].map(([label, suffix, val, setVal]) => (
                                    <div key={label} className="space-y-1.5">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{label}</label>
                                        <div className="flex items-center bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 gap-1">
                                            <span className="text-gray-600 text-xs">{suffix}</span>
                                            <input type="number" value={val} onChange={(e) => setVal(e.target.value)}
                                                className="flex-1 bg-transparent text-sm focus:outline-none min-w-0" placeholder="Any" />
                                        </div>
                                    </div>
                                ))}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Brand</label>
                                    <select value={brand} onChange={(e) => setBrand(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm focus:outline-none">
                                        <option value="">All brands</option>
                                        {brands.map((b) => <option key={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-full flex gap-2">
                                    <button onClick={() => { setMinPrice(""); setMaxPrice(""); setMinScore(""); setBrand(""); }}
                                        className="text-xs text-gray-500 hover:text-white font-bold transition-colors">Reset</button>
                                </div>
                            </div>
                        )}

                        {/* Category chips */}
                        {cats.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                                <button onClick={() => setParam("category", "")}
                                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${!category ? "bg-primary border-primary text-white" : "border-gray-800 text-gray-400 hover:border-gray-600"}`}>
                                    All
                                </button>
                                {cats.map((c) => (
                                    <button key={c} onClick={() => setParam("category", category === c ? "" : c)}
                                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${category === c ? "bg-primary border-primary text-white" : "border-gray-800 text-gray-400 hover:border-gray-600"}`}>
                                        {c}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Results */}
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
                        ) : results.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {results.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
                            </div>
                        ) : (
                            <div className="glass-card p-12 text-center space-y-4">
                                <HiOutlineSearch className="text-5xl text-gray-700 mx-auto" />
                                <h3 className="text-xl font-black">No results found</h3>
                                <p className="text-gray-500 text-sm">Try a different search term or browse by category.</p>
                                <div className="flex gap-3 justify-center pt-2">
                                    <Link to="/products" className="btn btn-primary text-sm flex items-center gap-2">
                                        Browse All <HiOutlineArrowRight />
                                    </Link>
                                    <Link to="/best-deals" className="flex items-center gap-2 text-sm font-bold border border-gray-700 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:border-gray-500 transition-all">
                                        <HiOutlineSparkles /> Best Deals
                                    </Link>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}