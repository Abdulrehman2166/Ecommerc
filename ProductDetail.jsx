import { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
    HiOutlineStar, HiStar,
    HiOutlineShoppingCart,
    HiOutlineArrowLeft,
    HiOutlineSparkles,
    HiOutlineHeart, HiHeart,
    HiOutlineShieldCheck,
    HiOutlineScale,
    HiOutlineGlobeAlt,
    HiOutlineBadgeCheck,
    HiOutlineTrendingUp,
    HiOutlineLightningBolt,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineCheckCircle,
    HiOutlineRefresh,
    HiOutlineExternalLink,
    HiOutlineX,
    HiOutlineCash,
    HiOutlineChat,
    HiOutlineTag,
} from "react-icons/hi";

// ─── helpers ──────────────────────────────────────────────────────────────────
const SCORE_COLOR = (v) => v >= 80 ? "#10b981" : v >= 60 ? "#f59e0b" : "#ef4444";
const SCORE_LABEL = (v) => v >= 80 ? "Excellent" : v >= 60 ? "Good" : "Fair";
const CURRENCY_SYM = (c) => ({ PKR: "Rs.", INR: "₹", AED: "AED ", USD: "$" }[c] ?? "$");

// ─── circular score ring ──────────────────────────────────────────────────────
function ScoreRing({ score = 0, label, size = 80 }) {
    const r = (size - 10) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    const color = SCORE_COLOR(score);
    return (
        <div className="flex flex-col items-center gap-2">
            <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 1.2s ease" }} />
                <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
                    fill={color} fontSize="14" fontWeight="800"
                    style={{ transform: `rotate(90deg)`, transformOrigin: `${size / 2}px ${size / 2}px` }}>
                    {score}
                </text>
            </svg>
            <div className="text-center">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{label}</div>
                <div className="text-[10px] font-black" style={{ color }}>{SCORE_LABEL(score)}</div>
            </div>
        </div>
    );
}

// ─── image gallery ────────────────────────────────────────────────────────────
function ImageGallery({ images = [], title }) {
    const [active, setActive] = useState(0);
    const [zoom, setZoom] = useState(false);
    const list = images.length ? images : ["https://via.placeholder.com/600x600?text=No+Image"];

    const prev = () => setActive((i) => (i - 1 + list.length) % list.length);
    const next = () => setActive((i) => (i + 1) % list.length);

    return (
        <div className="space-y-4">
            {/* Main image */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-900/60 border border-gray-800 aspect-square flex items-center justify-center group cursor-zoom-in"
                onClick={() => setZoom(true)}>
                <img
                    src={list[active]}
                    alt={title}
                    className="max-h-full max-w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                />
                {list.length > 1 && (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); prev(); }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border border-gray-700 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black">
                            <HiOutlineChevronLeft />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); next(); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border border-gray-700 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black">
                            <HiOutlineChevronRight />
                        </button>
                    </>
                )}
                <div className="absolute bottom-3 right-3 text-[10px] text-gray-500 bg-black/60 px-2 py-1 rounded-full font-bold">
                    {active + 1}/{list.length}
                </div>
            </div>

            {/* Thumbnails */}
            {list.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {list.map((img, i) => (
                        <button key={i} onClick={() => setActive(i)}
                            className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${active === i ? "border-primary" : "border-gray-800 hover:border-gray-600"
                                }`}>
                            <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            {/* Zoom modal */}
            {zoom && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setZoom(false)}>
                    <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-white">
                        <HiOutlineX />
                    </button>
                    <img src={list[active]} alt={title} className="max-h-[90vh] max-w-full object-contain" />
                </div>
            )}
        </div>
    );
}

// ─── star picker for review form ──────────────────────────────────────────────
function StarPicker({ value, onChange }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button"
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => onChange(n)}
                    className="text-2xl transition-transform hover:scale-110">
                    {n <= (hover || value)
                        ? <HiStar className="text-amber-400" />
                        : <HiOutlineStar className="text-gray-700" />
                    }
                </button>
            ))}
            <span className="text-xs text-gray-500 font-bold self-center ml-2">
                {["", "Poor", "Fair", "Good", "Great", "Excellent"][hover || value]}
            </span>
        </div>
    );
}

// ─── review form ──────────────────────────────────────────────────────────────
function ReviewForm({ productId, brandId }) {
    const [form, setForm] = useState({ rating: 5, platformUsed: "Daraz", foundTarget: true, qualityMatch: true, body: "" });
    const [submitting, setSub] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSub(true);
        try {
            await api.post("/reviews", { ...form, productId, brandId });
            setSuccess(true);
            toast.success("Review submitted! 🎉");
        } catch { toast.error("Failed to submit review"); }
        finally { setSub(false); }
    };

    if (success) return (
        <div className="glass-card p-8 text-center border-emerald-500/30 bg-emerald-500/5">
            <div className="text-5xl mb-4">🎯</div>
            <h4 className="text-lg font-black mb-2">Thank you!</h4>
            <p className="text-sm text-gray-400">Your review helps our AI improve recommendations for everyone.</p>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                    <HiOutlineChat />
                </div>
                <div>
                    <h4 className="font-black text-sm">Write a Review</h4>
                    <p className="text-[11px] text-gray-500">Help others make better purchase decisions</p>
                </div>
            </div>

            {/* Star rating */}
            <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Your Rating</label>
                <StarPicker value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
            </div>

            {/* Platform + toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Purchase Platform</label>
                    <select className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm focus:border-primary/50 focus:outline-none transition-colors"
                        value={form.platformUsed}
                        onChange={(e) => setForm({ ...form, platformUsed: e.target.value })}>
                        {["Daraz", "OLX", "Brand Website", "Local Mall", "Amazon", "Other"].map((p) => <option key={p}>{p}</option>)}
                    </select>
                </div>

                {[
                    { key: "foundTarget", label: "Found what you needed?" },
                    { key: "qualityMatch", label: "Good quality?" },
                ].map(({ key, label }) => (
                    <div key={key} className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{label}</label>
                        <button type="button"
                            onClick={() => setForm({ ...form, [key]: !form[key] })}
                            className={`w-full py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all ${form[key]
                                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                                    : "bg-gray-900 border-gray-700 text-gray-500"
                                }`}>
                            {form[key] ? "✓ Yes" : "✗ No"}
                        </button>
                    </div>
                ))}
            </div>

            {/* Body */}
            <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Review (optional)</label>
                <textarea
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm min-h-[90px] resize-none placeholder-gray-700 focus:border-primary/50 focus:outline-none transition-colors"
                    placeholder="Share your experience with the product and purchase platform…"
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                />
            </div>

            <button type="submit" disabled={submitting}
                className="w-full btn btn-primary py-3.5 font-black flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting
                    ? <><HiOutlineRefresh className="animate-spin" /> Submitting…</>
                    : <><HiOutlineSparkles /> Submit Review</>
                }
            </button>
        </form>
    );
}

// ─── tab component ────────────────────────────────────────────────────────────
const TABS = ["Overview", "Scores", "Reviews", "Compare"];

// ─── main component ───────────────────────────────────────────────────────────
export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inWishlist, setInWishlist] = useState(false);
    const [addingCart, setAddingCart] = useState(false);
    const [tab, setTab] = useState("Overview");

    // AI compare state
    const [aiData, setAiData] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    // Sticky buy bar visibility
    const [stickyVisible, setStickyVisible] = useState(false);
    useEffect(() => {
        const onScroll = () => setStickyVisible(window.scrollY > 500);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // ── fetch ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        const fetch_ = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/products/${id}`);
                const p = res.data?.results ?? res.data ?? res;
                setProduct(p);

                if (user) {
                    try {
                        const wRes = await api.get("/auth/wishlist");
                        const list = wRes.data?.wishlist ?? wRes.data ?? [];
                        setInWishlist(list.some((item) => (item._id ?? item) === id));
                    } catch { /* ignore */ }
                }
            } catch { /* handled below */ }
            finally { setLoading(false); }
        };
        fetch_();
    }, [id, user]);

    // ── actions ───────────────────────────────────────────────────────────────
    const handleAddToCart = useCallback(async () => {
        if (!user) return navigate("/login");
        setAddingCart(true);
        try {
            await addToCart(product._id, 1);
            toast.success("Added to cart! 🛒");
        } catch { toast.error("Failed to add to cart"); }
        finally { setAddingCart(false); }
    }, [user, product, addToCart, navigate]);

    const handleWishlist = useCallback(async () => {
        if (!user) return navigate("/login");
        try {
            const endpoint = inWishlist ? "/auth/wishlist/remove" : "/auth/wishlist/add";
            await api.post(endpoint, { productId: product._id });
            setInWishlist((v) => !v);
            toast.success(inWishlist ? "Removed from wishlist" : "Saved to wishlist ❤️");
        } catch { toast.error("Wishlist update failed"); }
    }, [user, product, inWishlist, navigate]);

    const handleAiCompare = useCallback(async () => {
        if (aiData) { setTab("Compare"); return; }
        setAiLoading(true);
        setTab("Compare");
        try {
            const res = await api.post("/products/ai-compare", {
                productName: product.title,
                category: product.category,
            });
            setAiData(res.data?.comparison ?? res.data);
        } catch { toast.error("AI comparison unavailable"); }
        finally { setAiLoading(false); }
    }, [product, aiData]);

    // ── loading / error ───────────────────────────────────────────────────────
    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="loader" />
            <p className="text-gray-500 text-sm animate-pulse">Loading product…</p>
        </div>
    );

    if (!product) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
            <div className="text-5xl">📦</div>
            <h3 className="text-2xl font-black">Product not found</h3>
            <button className="btn btn-primary" onClick={() => navigate("/products")}>Back to Shop</button>
        </div>
    );

    const sym = CURRENCY_SYM(product.currency);
    const score = product.productScore ?? 0;
    const images = product.images ?? [];

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity:0; transform:translateY(14px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                .animate-in { animation: fadeSlideUp 0.4s ease both; }
                .delay-1 { animation-delay: 0.08s; }
                .delay-2 { animation-delay: 0.16s; }
                .delay-3 { animation-delay: 0.24s; }
            `}</style>

            <div className="animate-in pb-32">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-8 font-bold"
                >
                    <HiOutlineArrowLeft /> Back
                </button>

                {/* ── Main grid ────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

                    {/* Left: gallery */}
                    <div className="animate-in">
                        <ImageGallery images={images} title={product.title} />
                    </div>

                    {/* Right: info */}
                    <div className="flex flex-col gap-6 animate-in delay-1">

                        {/* Breadcrumb badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-full">
                                {product.category}
                            </span>
                            {product.subcategory && (
                                <span className="text-[10px] text-gray-500 font-bold">/ {product.subcategory}</span>
                            )}
                            <span className="flex items-center gap-1 text-[10px] bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-full text-gray-400 font-bold ml-auto">
                                <HiOutlineGlobeAlt className="text-gray-600" />
                                {product.storeName ?? "Verified Store"}
                                {product.country && ` · ${product.country}`}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl lg:text-4xl font-black leading-tight">{product.title}</h1>

                        {/* Rating + reviews */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <span key={n}>
                                        {n <= Math.round(product.rating ?? 0)
                                            ? <HiStar className="text-amber-400 text-base" />
                                            : <HiOutlineStar className="text-gray-700 text-base" />
                                        }
                                    </span>
                                ))}
                                <span className="text-sm font-bold text-white ml-1">{Number(product.rating ?? 0).toFixed(1)}</span>
                            </div>
                            {product.reviewCount > 0 && (
                                <span className="text-xs text-gray-500">{product.reviewCount} reviews</span>
                            )}
                            {product.rating >= 4.5 && (
                                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                                    <HiOutlineBadgeCheck /> Highly Rated
                                </span>
                            )}
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-black text-white">{sym}{Number(product.price).toFixed(2)}</span>
                            {product.originalPrice && (
                                <span className="text-lg text-gray-600 line-through">{sym}{product.originalPrice}</span>
                            )}
                            {product.originalPrice && (
                                <span className="text-sm font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                    -{Math.round(100 - (product.price / product.originalPrice * 100))}%
                                </span>
                            )}
                        </div>

                        {/* Score rings */}
                        <div className="flex gap-6 py-4 border-y border-gray-800/60">
                            <ScoreRing score={product.qualityScore ?? 0} label="Quality" size={72} />
                            <ScoreRing score={product.reputationScore ?? 0} label="Reputation" size={72} />
                            <ScoreRing score={score} label="Overall" size={72} />
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={addingCart}
                                className="btn btn-primary flex-1 flex items-center justify-center gap-2 py-4 text-base font-black disabled:opacity-50"
                            >
                                {addingCart
                                    ? <><HiOutlineRefresh className="animate-spin" /> Adding…</>
                                    : <><HiOutlineShoppingCart /> Add to Cart</>
                                }
                            </button>
                            <button
                                onClick={handleWishlist}
                                className={`w-14 h-14 rounded-xl border flex items-center justify-center text-xl transition-all ${inWishlist
                                        ? "bg-rose-500 border-rose-500 text-white"
                                        : "bg-gray-900 border-gray-700 text-gray-400 hover:border-rose-500/50 hover:text-rose-400"
                                    }`}
                            >
                                {inWishlist ? <HiHeart /> : <HiOutlineHeart />}
                            </button>
                            <button
                                onClick={() => navigate(`/comparison?ids=${product._id}`)}
                                className="w-14 h-14 rounded-xl border bg-gray-900 border-gray-700 text-gray-400 hover:border-primary/50 hover:text-primary flex items-center justify-center text-xl transition-all"
                                title="Add to comparison"
                            >
                                <HiOutlineScale />
                            </button>
                        </div>

                        {/* AI Compare CTA */}
                        <button
                            onClick={handleAiCompare}
                            disabled={aiLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-primary/30 text-primary bg-primary/8 hover:bg-primary/15 transition-all text-sm font-black"
                        >
                            {aiLoading
                                ? <><HiOutlineRefresh className="animate-spin" /> Generating comparison…</>
                                : <><HiOutlineSparkles /> AI Compare with Alternatives</>
                            }
                        </button>

                        {/* Buy link */}
                        {product.productLink && (
                            <a href={product.productLink} target="_blank" rel="noreferrer"
                                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white transition-all text-sm font-bold">
                                <HiOutlineExternalLink /> View on {product.storeName ?? "Store"}
                            </a>
                        )}

                        {/* Trust strip */}
                        <div className="flex flex-wrap gap-4 text-[10px] text-gray-600 font-bold uppercase tracking-wider pt-2 border-t border-gray-800/40">
                            {[
                                [<HiOutlineShieldCheck />, "Verified Seller"],
                                [<HiOutlineBadgeCheck />, "AI Scored"],
                                [<HiOutlineTrendingUp />, "Live Data"],
                                [<HiOutlineCash />, "Best Price"],
                            ].map(([icon, label]) => (
                                <span key={label} className="flex items-center gap-1.5">
                                    <span className="text-gray-700 text-sm">{icon}</span>{label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Tabs ─────────────────────────────────────────────── */}
                <div className="mt-14 animate-in delay-2">
                    <div className="flex gap-2 border-b border-gray-800/60 pb-0 mb-8 overflow-x-auto">
                        {TABS.map((t) => (
                            <button key={t} onClick={() => { setTab(t); if (t === "Compare") handleAiCompare(); }}
                                className={`px-5 py-3 text-sm font-black whitespace-nowrap border-b-2 transition-all -mb-px ${tab === t
                                        ? "border-primary text-primary"
                                        : "border-transparent text-gray-500 hover:text-gray-300"
                                    }`}>
                                {t === "Compare" && <HiOutlineSparkles className="inline mr-1.5 mb-0.5 text-xs" />}
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* Overview */}
                    {tab === "Overview" && (
                        <div className="space-y-6 animate-in">
                            <p className="text-gray-300 leading-relaxed text-base">
                                {product.description || "Experience premium quality with this top-rated selection. Handpicked for excellence and value."}
                            </p>

                            {/* Key details grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { label: "Brand", value: product.brand || "—" },
                                    { label: "Category", value: product.category || "—" },
                                    { label: "Store", value: product.storeName || "—" },
                                    { label: "Origin", value: product.country || "—" },
                                ].map(({ label, value }) => (
                                    <div key={label} className="glass-card p-4 text-center">
                                        <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1">{label}</div>
                                        <div className="text-sm font-black truncate">{value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Product link */}
                            {product.productLink && (
                                <div className="glass-card p-5 flex items-center justify-between gap-4 border-primary/20 bg-primary/5">
                                    <div>
                                        <div className="text-xs font-black text-primary mb-0.5">Buy from Official Store</div>
                                        <div className="text-[11px] text-gray-500 truncate">{product.productLink.slice(0, 60)}…</div>
                                    </div>
                                    <a href={product.productLink} target="_blank" rel="noreferrer"
                                        className="btn btn-primary text-xs flex items-center gap-1.5 flex-shrink-0 py-2 px-4">
                                        Visit <HiOutlineExternalLink />
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Scores tab */}
                    {tab === "Scores" && (
                        <div className="space-y-6 animate-in">
                            {[
                                { label: "Quality Score", value: product.qualityScore ?? 0, desc: "Based on materials, build quality and durability" },
                                { label: "Brand Reputation", value: product.reputationScore ?? 0, desc: "Calculated from brand history, trust signals and reviews" },
                                { label: "Overall Score", value: score, desc: "Weighted combination of all quality and trust metrics" },
                                { label: "User Rating", value: Math.round((product.rating ?? 0) * 20), desc: `${Number(product.rating ?? 0).toFixed(1)}/5 from verified buyers` },
                            ].map(({ label, value, desc }) => (
                                <div key={label} className="glass-card p-5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-black text-sm">{label}</div>
                                            <div className="text-[11px] text-gray-500 mt-0.5">{desc}</div>
                                        </div>
                                        <div className="text-2xl font-black flex-shrink-0" style={{ color: SCORE_COLOR(value) }}>
                                            {value}<span className="text-sm text-gray-600">/100</span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${value}%`, backgroundColor: SCORE_COLOR(value) }} />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-700">
                                        <span>Poor</span><span>Fair</span><span>Good</span><span>Excellent</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Reviews tab */}
                    {tab === "Reviews" && (
                        <div className="space-y-6 animate-in">
                            <ReviewForm productId={product._id} brandId={product.brand?._id ?? product.brand} />
                        </div>
                    )}

                    {/* AI Compare tab */}
                    {tab === "Compare" && (
                        <div className="space-y-6 animate-in">
                            {aiLoading && (
                                <div className="flex flex-col items-center py-16 gap-4">
                                    <HiOutlineRefresh className="text-4xl text-primary animate-spin" />
                                    <p className="text-gray-500 text-sm">AI is comparing alternatives…</p>
                                </div>
                            )}

                            {!aiLoading && !aiData && (
                                <div className="glass-card p-8 text-center space-y-4 border-primary/20">
                                    <HiOutlineSparkles className="text-4xl text-primary mx-auto" />
                                    <h4 className="font-black text-lg">AI Comparison Engine</h4>
                                    <p className="text-gray-500 text-sm max-w-sm mx-auto">
                                        Get an AI-generated comparison of this product against top alternatives in the same category.
                                    </p>
                                    <button onClick={handleAiCompare} className="btn btn-primary flex items-center gap-2 mx-auto">
                                        <HiOutlineLightningBolt /> Generate Comparison
                                    </button>
                                </div>
                            )}

                            {!aiLoading && aiData && (
                                <div className="space-y-4">
                                    {/* Recommendation */}
                                    {aiData.recommendation && (
                                        <div className="glass-card p-5 flex items-start gap-4 border-primary/20 bg-primary/5">
                                            <HiOutlineSparkles className="text-primary text-xl flex-shrink-0 mt-0.5" />
                                            <div>
                                                <div className="text-xs text-primary font-black uppercase tracking-widest mb-1">AI Verdict</div>
                                                <p className="text-sm text-gray-300 leading-relaxed">{aiData.recommendation}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Alternative products */}
                                    {(aiData.alternatives ?? aiData.offers ?? []).map((alt, i) => (
                                        <div key={i} className="glass-card p-5 flex items-center gap-4">
                                            {alt.image && (
                                                <img src={alt.image} alt={alt.name} className="w-14 h-14 object-cover rounded-xl bg-gray-800 flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-black text-sm truncate">{alt.name ?? alt.title}</div>
                                                <div className="text-xs text-gray-500">{alt.brand} · {alt.storeName}</div>
                                                {alt.pros && <div className="text-[11px] text-emerald-400 mt-1">✓ {alt.pros}</div>}
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="font-black text-primary">${Number(alt.price ?? 0).toFixed(2)}</div>
                                                {alt.productScore > 0 && (
                                                    <div className="text-[11px] font-black mt-0.5" style={{ color: SCORE_COLOR(alt.productScore) }}>
                                                        {alt.productScore}/100
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    <Link to={`/comparison?ids=${product._id}`}
                                        className="flex items-center justify-center gap-2 btn btn-primary w-full mt-2">
                                        <HiOutlineScale /> Full Comparison Table
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Sticky buy bar ─────────────────────────────────────── */}
            <div className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${stickyVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                }`}>
                <div className="border-t border-gray-800 bg-gray-950/95 backdrop-blur-xl px-4 py-3">
                    <div className="max-w-5xl mx-auto flex items-center gap-4">
                        {images[0] && (
                            <img src={images[0]} alt={product.title} className="w-10 h-10 object-cover rounded-xl bg-gray-800 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-black truncate">{product.title}</div>
                            <div className="text-xs text-primary font-black">{sym}{Number(product.price).toFixed(2)}</div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <button onClick={handleWishlist}
                                className={`p-2.5 rounded-xl border transition-all ${inWishlist ? "bg-rose-500 border-rose-500 text-white" : "border-gray-700 text-gray-400 hover:text-rose-400"}`}>
                                {inWishlist ? <HiHeart /> : <HiOutlineHeart />}
                            </button>
                            <button onClick={handleAddToCart} disabled={addingCart}
                                className="btn btn-primary flex items-center gap-2 py-2.5 px-5 text-sm font-black disabled:opacity-50">
                                {addingCart
                                    ? <HiOutlineRefresh className="animate-spin" />
                                    : <><HiOutlineShoppingCart /> Add to Cart</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}