import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import {
  HiOutlineSearch,
  HiOutlineLightningBolt,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineFire,
  HiOutlineTrendingUp,
  HiOutlineStar,
  HiOutlineArrowRight,
  HiOutlineScale,
  HiOutlineCheckCircle,
  HiOutlineGlobeAlt,
  HiOutlineBadgeCheck,
  HiOutlineCash,
  HiOutlineX,
  HiOutlineChevronRight,
  HiOutlineRefresh,
  HiOutlineCube,
  HiOutlineDownload,
} from "react-icons/hi";

// ─── constants ────────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "iPhone 15", "Samsung Galaxy", "Nike Air Max",
  "Sony Headphones", "MacBook Pro", "Gaming Chair",
  "Smart Watch", "Running Shoes", "Wireless Earbuds",
];

const FEATURES = [
  { icon: <HiOutlineScale />, title: "Multi-Platform", desc: "Compare across all major stores simultaneously", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  { icon: <HiOutlineSparkles />, title: "AI Scoring", desc: "Every product scored on quality, price & reputation", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  { icon: <HiOutlineShieldCheck />, title: "Brand Trust", desc: "Verified brand reputation index for every seller", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { icon: <HiOutlineLightningBolt />, title: "Instant Results", desc: "Real-time data pulled from live product listings", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
];

const SCORE_COLOR = (v) =>
  v >= 80 ? "text-emerald-400" : v >= 60 ? "text-amber-400" : "text-rose-400";

const SCORE_BG = (v) =>
  v >= 80 ? "bg-emerald-400" : v >= 60 ? "bg-amber-400" : "bg-rose-400";

// ─── animated typing placeholder ─────────────────────────────────────────────
function useTypingPlaceholder(words, speed = 80, pause = 1800) {
  const [text, setText] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIdx % words.length];
    const delay = deleting
      ? speed / 2
      : charIdx === word.length ? pause : speed;

    const t = setTimeout(() => {
      if (!deleting && charIdx < word.length) {
        setText(word.slice(0, charIdx + 1));
        setCharIdx((c) => c + 1);
      } else if (!deleting && charIdx === word.length) {
        setDeleting(true);
      } else if (deleting && charIdx > 0) {
        setText(word.slice(0, charIdx - 1));
        setCharIdx((c) => c - 1);
      } else {
        setDeleting(false);
        setWordIdx((w) => (w + 1) % words.length);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [text, charIdx, deleting, wordIdx, words, speed, pause]);

  return text;
}

// ─── stat counter ─────────────────────────────────────────────────────────────
function StatCard({ value, label, icon, color }) {
  return (
    <div className="flex flex-col items-center gap-1 py-6 px-4">
      <div className={`text-3xl font-black ${color}`}>{value}</div>
      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold uppercase tracking-wider">
        <span className={`${color} opacity-70`}>{icon}</span>
        {label}
      </div>
    </div>
  );
}

// ─── comparison result card ───────────────────────────────────────────────────
function ComparisonOfferCard({ offer, isWinner, rank }) {
  const score = offer.score ?? offer.productScore ?? 0;
  return (
    <div className={`glass-card p-5 flex flex-col gap-4 relative transition-all duration-200 hover:-translate-y-0.5
            ${isWinner ? "border-amber-500/40 bg-amber-500/3" : ""}`}
    >
      {isWinner && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-amber-500 text-black text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
          🏆 Best Pick
        </div>
      )}
      {!isWinner && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-[9px] font-black text-gray-500">
          #{rank}
        </div>
      )}

      {/* Store + badge */}
      <div className="flex items-center gap-3 pr-6">
        <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-lg flex-shrink-0">
          {offer.storeIcon ?? "🛍️"}
        </div>
        <div>
          <div className="font-black text-sm">{offer.storeName ?? offer.platform}</div>
          <div className="text-[10px] text-gray-500 font-bold">{offer.seller ?? offer.country}</div>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-primary">${offer.price?.toFixed ? offer.price.toFixed(2) : offer.price}</span>
        {offer.originalPrice && (
          <span className="text-xs text-gray-600 line-through">${offer.originalPrice}</span>
        )}
      </div>

      {/* Score bar */}
      {score > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-600 font-bold uppercase tracking-wider">AI Score</span>
            <span className={`font-black ${SCORE_COLOR(score)}`}>{score}/100</span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${SCORE_BG(score)}`} style={{ width: `${score}%` }} />
          </div>
        </div>
      )}

      {/* Meta */}
      <div className="space-y-1.5 text-xs text-gray-400">
        {offer.rating > 0 && (
          <div className="flex items-center gap-1.5">
            <HiOutlineStar className="text-amber-400 flex-shrink-0" />
            <span className="font-bold text-white">{Number(offer.rating).toFixed(1)}</span>
            {offer.reviews && <span className="text-gray-600">({offer.reviews} reviews)</span>}
          </div>
        )}
        {offer.delivery && (
          <div className="flex items-center gap-1.5">
            <HiOutlineCheckCircle className="text-emerald-400 flex-shrink-0" />
            <span>{offer.delivery}</span>
          </div>
        )}
        {offer.badge && (
          <span className="inline-flex text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
            {offer.badge}
          </span>
        )}
      </div>

      {/* CTA */}
      {offer.productLink && (
        <a
          href={offer.productLink}
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary text-xs py-2.5 text-center flex items-center justify-center gap-1.5"
        >
          View Deal <HiOutlineArrowRight />
        </a>
      )}
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [term, setTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [comparison, setComparison] = useState(null);
  const [stats, setStats] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg] = useState(false);
  const [importing, setImporting] = useState(false);

  const placeholder = useTypingPlaceholder(SUGGESTIONS);

  const handleImport = async () => {
    setImporting(true);
    try {
      await api.get("/products/import/dummy");
      window.location.reload();
    } catch {
      alert("Import failed. Make sure the backend is running.");
    } finally {
      setImporting(false);
    }
  };

  // ── initial data ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [prodRes, trendRes, statsRes] = await Promise.allSettled([
          api.get("/products?sort=score&limit=12"),
          api.get("/products?sort=score&limit=6"),
          api.get("/admin/dashboard"),
        ]);

        if (prodRes.status === "fulfilled") {
          const d = prodRes.value.data;
          setProducts(d?.results ?? d ?? []);
        }
        if (trendRes.status === "fulfilled") {
          const d = trendRes.value.data;
          setTrending((d?.results ?? d ?? []).slice(0, 6));
        }
        if (statsRes.status === "fulfilled") {
          setStats(statsRes.value.data);
        }
      } catch (e) {
        console.error("Home load error", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── search suggestions ────────────────────────────────────────────────────
  useEffect(() => {
    if (!term.trim()) { setSuggestions([]); return; }
    const id = setTimeout(async () => {
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(term)}&limit=5`);
        const d = res.data?.results ?? res.data ?? [];
        setSuggestions(d.slice(0, 5));
      } catch { setSuggestions([]); }
    }, 300);
    return () => clearTimeout(id);
  }, [term]);

  // ── search / compare ──────────────────────────────────────────────────────
  const handleSearch = useCallback(async (e) => {
    e?.preventDefault();
    const q = term.trim();
    if (!q) return;
    setShowSugg(false);
    setSearching(true);
    setComparison(null);

    try {
      // Hit your real comparison endpoint
      const res = await api.get(`/products/compare-search?q=${encodeURIComponent(q)}&limit=4`);
      const data = res.data;

      if (data && (data.results?.length > 0 || data.offers?.length > 0)) {
        setComparison(data);
      } else {
        // Fallback: search products and build comparison from results
        const fallback = await api.get(`/products?search=${encodeURIComponent(q)}&limit=6`);
        const items = fallback.data?.results ?? fallback.data ?? [];
        if (items.length > 0) {
          const sorted = [...items].sort((a, b) => (b.productScore ?? 0) - (a.productScore ?? 0));
          setComparison({
            query: q,
            recommendation: `Based on AI scoring across quality, price and brand reputation, ${sorted[0]?.brand ?? "the top result"} offers the best overall value for "${q}".`,
            offers: sorted.slice(0, 3),
          });
          // Also update the products grid
          setProducts(items);
        } else {
          setComparison({ query: q, offers: [], recommendation: `No results found for "${q}". Try a different search term.` });
        }
      }
    } catch (err) {
      console.error("Search error", err);
      setComparison({ query: q, offers: [], recommendation: "Search failed. Please try again." });
    } finally {
      setSearching(false);
      // Scroll to results
      setTimeout(() => {
        document.getElementById("comparison-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [term]);

  // ── derived ───────────────────────────────────────────────────────────────
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];
  const filtered = activeTab === "All" ? products : products.filter((p) => p.category === activeTab);
  const winner = comparison?.offers?.length > 0
    ? comparison.offers.reduce((best, o) =>
      (o.productScore ?? o.score ?? 0) > (best.productScore ?? best.score ?? 0) ? o : best
    )
    : null;

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
                @keyframes fadeSlideUp {
                    from { opacity:0; transform:translateY(18px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                @keyframes float {
                    0%,100% { transform:translateY(0px); }
                    50%     { transform:translateY(-8px); }
                }
                @keyframes pulse-ring {
                    0%   { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
                    70%  { box-shadow: 0 0 0 12px rgba(99,102,241,0); }
                    100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
                }
                .animate-in  { animation: fadeSlideUp 0.5s ease both; }
                .float        { animation: float 4s ease-in-out infinite; }
                .pulse-ring   { animation: pulse-ring 2.5s ease-in-out infinite; }
                .delay-1 { animation-delay:0.1s; }
                .delay-2 { animation-delay:0.2s; }
                .delay-3 { animation-delay:0.3s; }
            `}</style>

      <div className="space-y-20 pb-20">

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="relative pt-8 pb-4 overflow-hidden">

          {/* Background ambient */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-[0.06]"
              style={{ background: "radial-gradient(ellipse, #6366f1, transparent 70%)" }} />
            <div className="absolute top-20 left-10 w-2 h-2 rounded-full bg-primary/30 float" style={{ animationDelay: "0s" }} />
            <div className="absolute top-32 right-16 w-1.5 h-1.5 rounded-full bg-amber-400/40 float" style={{ animationDelay: "1s" }} />
            <div className="absolute top-16 right-1/3 w-1 h-1 rounded-full bg-emerald-400/30 float" style={{ animationDelay: "0.5s" }} />
            <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 rounded-full bg-rose-400/30 float" style={{ animationDelay: "1.5s" }} />
          </div>

          <div className="max-w-4xl mx-auto text-center px-4 relative z-10">

            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-primary mb-6 animate-in">
              <HiOutlineLightningBolt />
              Pakistan&apos;s #1 AI Product Comparison Engine
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] animate-in delay-1">
              Find the{" "}
              <span className="relative inline-block">
                <span className="text-primary">Best Deal</span>
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary/40 rounded-full" />
              </span>
              <br />across every store
            </h1>

            <p className="mt-5 text-gray-400 max-w-xl mx-auto text-base leading-relaxed animate-in delay-2">
              Search once. We compare prices, quality scores and brand reputation
              across all major platforms — so you always buy smart.
            </p>

            {/* Search bar */}
            <div className="mt-10 max-w-2xl mx-auto animate-in delay-3 relative">
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-3 glass-card p-2 pl-5 border-gray-700 hover:border-primary/40 transition-colors"
              >
                <HiOutlineSearch className="text-gray-500 text-lg flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={term}
                  onChange={(e) => { setTerm(e.target.value); setShowSugg(true); }}
                  onFocus={() => setShowSugg(true)}
                  onBlur={() => setTimeout(() => setShowSugg(false), 150)}
                  placeholder={`Search "${placeholder}"…`}
                  className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-gray-600 focus:outline-none"
                />
                {term && (
                  <button type="button" onClick={() => { setTerm(""); setComparison(null); }} className="text-gray-600 hover:text-white transition-colors">
                    <HiOutlineX />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={searching || !term.trim()}
                  className="btn btn-primary flex items-center gap-2 px-6 py-3 rounded-xl flex-shrink-0 disabled:opacity-50"
                >
                  {searching
                    ? <><HiOutlineRefresh className="animate-spin" /> Comparing…</>
                    : <><HiOutlineScale /> Compare</>
                  }
                </button>
              </form>

              {/* Suggestions dropdown */}
              {showSugg && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-card p-2 z-50 border-gray-700 shadow-2xl">
                  {suggestions.map((p) => (
                    <button
                      key={p._id}
                      onMouseDown={() => {
                        setTerm(p.title ?? p.name);
                        setShowSugg(false);
                        setTimeout(() => handleSearch(), 50);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800/60 transition-colors text-left"
                    >
                      <img src={p.images?.[0]} alt={p.title} className="w-9 h-9 object-cover rounded-lg bg-gray-800 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">{p.title ?? p.name}</div>
                        <div className="text-xs text-gray-500">{p.brand} · ${p.price}</div>
                      </div>
                      <span className={`text-xs font-black ${SCORE_COLOR(p.productScore ?? 0)}`}>
                        {p.productScore ?? "—"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick search chips */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center animate-in delay-3">
              {["iPhone 15", "Sony Headphones", "Nike Shoes", "MacBook", "Smart Watch"].map((q) => (
                <button
                  key={q}
                  onClick={() => { setTerm(q); setTimeout(() => handleSearch(), 50); }}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-800 text-gray-500 hover:border-primary/40 hover:text-primary transition-all font-bold"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── STATS BAR ────────────────────────────────────────────── */}
        <div className="glass-card border-gray-800/60">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-800/60">
            <StatCard value={stats?.totalProducts ?? "500+"} label="Products Indexed" icon={<HiOutlineSparkles />} color="text-primary" />
            <StatCard value={stats?.totalUsers ?? "2K+"} label="Happy Users" icon={<HiOutlineStar />} color="text-amber-400" />
            <StatCard value="50+" label="Brands Tracked" icon={<HiOutlineBadgeCheck />} color="text-emerald-400" />
            <StatCard value="100%" label="AI Powered" icon={<HiOutlineLightningBolt />} color="text-rose-400" />
          </div>
        </div>

        {/* ── COMPARISON RESULT ─────────────────────────────────────── */}
        {comparison && (
          <section id="comparison-result" className="animate-in space-y-6">
            {/* Report header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <HiOutlineScale className="text-primary" />
                  <span className="text-xs text-primary font-black uppercase tracking-widest">Comparison Report</span>
                </div>
                <h2 className="text-2xl font-black">
                  Best options for &ldquo;{comparison.query}&rdquo;
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  AI-scored across price, quality & brand reputation
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/comparison?ids=${comparison.offers?.map((o) => o._id).filter(Boolean).join(",")}`}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl border border-primary/40 text-primary hover:bg-primary/10 transition-all"
                >
                  Full Report <HiOutlineChevronRight />
                </Link>
                <button
                  onClick={() => setComparison(null)}
                  className="p-2 rounded-xl border border-gray-700 text-gray-500 hover:text-white hover:border-gray-500 transition-all"
                >
                  <HiOutlineX />
                </button>
              </div>
            </div>

            {/* Offer cards */}
            {comparison.offers?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {comparison.offers.map((offer, i) => (
                  <ComparisonOfferCard
                    key={offer._id ?? offer.platform ?? i}
                    offer={offer}
                    isWinner={winner && (offer._id === winner._id || offer.platform === winner.platform)}
                    rank={i + 1}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-card p-10 text-center text-gray-500">
                <HiOutlineSearch className="text-4xl mx-auto mb-3 text-gray-700" />
                <p className="font-bold">{comparison.recommendation}</p>
              </div>
            )}

            {/* AI recommendation text */}
            {comparison.recommendation && comparison.offers?.length > 0 && (
              <div className="glass-card p-5 flex items-start gap-4 border-primary/20 bg-primary/5">
                <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  <HiOutlineSparkles />
                </div>
                <div>
                  <div className="text-xs text-primary font-black uppercase tracking-widest mb-1">AI Recommendation</div>
                  <p className="text-sm text-gray-300 leading-relaxed">{comparison.recommendation}</p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── FEATURES ─────────────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <HiOutlineLightningBolt className="text-primary" />
              <span className="text-xs text-primary font-black uppercase tracking-widest">Why choose us</span>
            </div>
            <h2 className="text-3xl font-black">Built to help you buy smarter</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon, title, desc, color, bg }, i) => (
              <div
                key={title}
                className={`glass-card p-6 flex flex-col gap-3 border hover:border-gray-600 transition-all hover:-translate-y-0.5`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl ${bg} ${color}`}>
                  {icon}
                </div>
                <div>
                  <div className="font-black text-sm mb-1">{title}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TRENDING ─────────────────────────────────────────────── */}
        {trending.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <HiOutlineFire className="text-rose-400" />
                  <span className="text-xs text-rose-400 font-black uppercase tracking-widest">Trending Now</span>
                </div>
                <h2 className="text-2xl font-black">Top Picks This Week</h2>
              </div>
              <Link to="/best-deals" className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors">
                View all <HiOutlineArrowRight />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {trending.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ── PRODUCT GRID ─────────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <HiOutlineTrendingUp className="text-primary" />
                <span className="text-xs text-primary font-black uppercase tracking-widest">Our Catalog</span>
              </div>
              <h2 className="text-2xl font-black">Browse All Products</h2>
            </div>
            <Link to="/products" className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors self-start sm:self-auto">
              View full catalog <HiOutlineArrowRight />
            </Link>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${activeTab === cat
                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                    : "border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="glass-card p-5 space-y-4 animate-pulse">
                  <div className="w-full h-40 bg-gray-800 rounded-xl" />
                  <div className="h-3 bg-gray-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-800 rounded w-1/2" />
                  <div className="h-2 bg-gray-800 rounded w-full" />
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="products-grid">
              {filtered.slice(0, 12).map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-gray-800/60 border border-gray-700 flex items-center justify-center mx-auto">
                <HiOutlineCube className="text-4xl text-gray-600" />
              </div>
              <div>
                <p className="font-black text-xl text-gray-400">Our catalog is currently empty</p>
                <p className="text-gray-600 text-sm mt-2">Import sample products to explore the platform features.</p>
              </div>
              <button
                onClick={handleImport}
                disabled={importing}
                className="btn btn-primary mx-auto flex items-center gap-2"
              >
                {importing ? (
                  <><HiOutlineRefresh className="animate-spin" /> Importing…</>
                ) : (
                  <><HiOutlineDownload /> Import Sample Data</>
                )}
              </button>
            </div>
          )}

          {filtered.length > 12 && (
            <div className="text-center pt-4">
              <Link to="/products" className="btn btn-primary flex items-center gap-2 mx-auto w-fit">
                See all products <HiOutlineArrowRight />
              </Link>
            </div>
          )}
        </section>

        {/* ── CTA BANNER ───────────────────────────────────────────── */}
        <section
          className="relative rounded-3xl border border-primary/30 overflow-hidden p-10 text-center"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.15), transparent)" }}
        >
          <div className="absolute top-4 left-8  w-1.5 h-1.5 rounded-full bg-primary/40 float" />
          <div className="absolute top-8 right-12 w-1   h-1   rounded-full bg-amber-400/40 float" style={{ animationDelay: "0.8s" }} />

          <div className="flex items-center justify-center gap-2 mb-3">
            <HiOutlineGlobeAlt className="text-primary" />
            <span className="text-xs text-primary font-black uppercase tracking-widest">Start comparing</span>
          </div>
          <h2 className="text-3xl font-black mb-3">Ready to buy smarter?</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-8">
            Join thousands of shoppers who use our AI engine to find the best deals every day.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => { inputRef.current?.focus(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="btn btn-primary flex items-center gap-2 pulse-ring"
            >
              <HiOutlineSearch /> Search Now
            </button>
            <Link to="/best-deals" className="flex items-center gap-2 text-sm font-bold text-gray-300 border border-gray-700 hover:border-gray-500 px-5 py-2.5 rounded-xl transition-all">
              <HiOutlineCash /> Best Deals
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}