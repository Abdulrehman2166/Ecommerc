import { useEffect, useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import {
    HiOutlineTrash,
    HiOutlineMinus,
    HiOutlinePlus,
    HiOutlineShoppingBag,
    HiOutlineArrowRight,
    HiOutlineTag,
    HiOutlineBadgeCheck,
    HiOutlineLightningBolt,
    HiOutlineTruck,
    HiOutlineShieldCheck,
    HiOutlineRefresh,
    HiOutlineSparkles,
    HiOutlineHeart,
    HiOutlineX,
} from "react-icons/hi";

// ─── constants ────────────────────────────────────────────────────────────────
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 9.99;
const TAX_RATE = 0.08;

// ─── helpers ──────────────────────────────────────────────────────────────────
const SCORE_COLOR = (v) =>
    v >= 80 ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
    : v >= 60 ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
    : "text-gray-500 border-gray-700 bg-gray-800/40";

// ─── sub-components ───────────────────────────────────────────────────────────

// Animated qty counter
function QtyControl({ productId, quantity, onUpdate, onRemove, loading }) {
    return (
        <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
            <button
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all disabled:opacity-30"
                onClick={() => quantity > 1 ? onUpdate(productId, quantity - 1) : onRemove(productId)}
                disabled={loading}
            >
                {quantity === 1 ? <HiOutlineTrash className="text-xs text-rose-400" /> : <HiOutlineMinus className="text-xs" />}
            </button>
            <span className="w-8 text-center text-sm font-black tabular-nums">{quantity}</span>
            <button
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all disabled:opacity-30"
                onClick={() => onUpdate(productId, quantity + 1)}
                disabled={loading}
            >
                <HiOutlinePlus className="text-xs" />
            </button>
        </div>
    );
}

// Shipping progress bar
function ShippingProgress({ subtotal }) {
    const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
    const pct = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const achieved = subtotal >= FREE_SHIPPING_THRESHOLD;

    return (
        <div className="glass-card p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                    <HiOutlineTruck className={achieved ? "text-emerald-400" : "text-gray-400"} />
                    {achieved
                        ? <span className="text-emerald-400">Free shipping unlocked! 🎉</span>
                        : <span className="text-gray-300">Add <span className="text-white font-black">${remaining.toFixed(2)}</span> for free shipping</span>
                    }
                </span>
                <span className={achieved ? "text-emerald-400" : "text-gray-500"}>{Math.round(pct)}%</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${achieved ? "bg-emerald-400" : "bg-primary"}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

// Trust badges strip
function TrustBadges() {
    const badges = [
        { icon: <HiOutlineShieldCheck />, label: "Secure checkout" },
        { icon: <HiOutlineRefresh />,     label: "Easy returns"    },
        { icon: <HiOutlineTruck />,       label: "Fast delivery"   },
        { icon: <HiOutlineBadgeCheck />,  label: "Verified brands" },
    ];
    return (
        <div className="grid grid-cols-2 gap-2 mt-4">
            {badges.map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    <span className="text-gray-600 text-sm">{icon}</span> {label}
                </div>
            ))}
        </div>
    );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function Cart() {
    const { cart, fetchCart, updateCartItem, removeFromCart } = useContext(CartContext);
    const navigate  = useNavigate();
    const [loadingId, setLoadingId]   = useState(null);   // which item is updating
    const [removingId, setRemovingId] = useState(null);   // which item is removing
    const [promoCode, setPromoCode]   = useState("");
    const [promoApplied, setPromoApplied] = useState(false);
    const [promoError, setPromoError]    = useState("");

    useEffect(() => { fetchCart(); }, [fetchCart]);

    const items    = cart.items || [];
    const subtotal = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const discount = promoApplied ? subtotal * 0.1 : 0;
    const tax      = (subtotal - discount) * TAX_RATE;
    const total    = subtotal - discount + shipping + tax;
    const savings  = discount + (subtotal > FREE_SHIPPING_THRESHOLD ? SHIPPING_COST : 0);

    const handleUpdate = async (productId, qty) => {
        setLoadingId(productId);
        await updateCartItem(productId, qty);
        setLoadingId(null);
    };

    const handleRemove = async (productId) => {
        setRemovingId(productId);
        await removeFromCart(productId);
        setRemovingId(null);
    };

    const applyPromo = () => {
        if (promoCode.trim().toUpperCase() === "SAVE10") {
            setPromoApplied(true);
            setPromoError("");
        } else {
            setPromoError("Invalid code. Try SAVE10");
            setPromoApplied(false);
        }
    };

    // ── empty state ───────────────────────────────────────────────────────────
    if (items.length === 0) {
        return (
            <div className="page container">
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in text-center">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-3xl bg-gray-800/60 border border-gray-700 flex items-center justify-center">
                            <HiOutlineShoppingBag className="text-4xl text-gray-500" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-black text-white">0</div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black mb-2">Your cart is empty</h3>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto">
                            Discover top-rated products with our AI comparison engine.
                        </p>
                    </div>
                    <div className="flex gap-3 flex-wrap justify-center">
                        <Link to="/products" className="btn btn-primary flex items-center gap-2">
                            <HiOutlineSparkles /> Browse Products
                        </Link>
                        <Link to="/best-deals" className="btn flex items-center gap-2 border border-gray-700 text-gray-300 hover:border-gray-500 px-5 py-2.5 rounded-xl text-sm font-bold transition-all">
                            <HiOutlineLightningBolt /> Best Deals
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ── main cart ─────────────────────────────────────────────────────────────
    return (
        <div className="page container animate-in">

            {/* Header */}
            <div className="flex items-end justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black">Shopping Cart</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {items.length} item{items.length !== 1 ? "s" : ""} ·{" "}
                        <span className="text-white font-bold">${subtotal.toFixed(2)}</span>
                    </p>
                </div>
                <Link
                    to="/products"
                    className="text-xs text-gray-500 hover:text-primary transition-colors flex items-center gap-1 font-bold"
                >
                    Continue shopping
                </Link>
            </div>

            {/* Shipping progress */}
            <ShippingProgress subtotal={subtotal} />

            {/* Layout */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

                {/* ── Cart items ────────────────────────────────────────── */}
                <div className="space-y-4">
                    {items.map((item, idx) => {
                        const product   = item.product;
                        const pid       = product?._id;
                        const isLoading = loadingId  === pid;
                        const isRemoving = removingId === pid;
                        const score     = product?.productScore ?? product?.qualityScore ?? 0;
                        const lineTotal = (product?.price || 0) * item.quantity;

                        return (
                            <div
                                key={pid || item._id}
                                className={`glass-card p-5 flex gap-5 transition-all duration-300 hover:border-gray-700 ${isRemoving ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"}`}
                                style={{ animationDelay: `${idx * 60}ms`, animation: "fadeSlideUp 0.35s ease both" }}
                            >
                                {/* Product image */}
                                <div
                                    className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-800 cursor-pointer group"
                                    onClick={() => navigate(`/product/${pid}`)}
                                >
                                    <img
                                        src={product?.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200"}
                                        alt={product?.name || product?.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {/* Score badge on image */}
                                    {score > 0 && (
                                        <div className={`absolute bottom-1 right-1 text-[9px] font-black px-1.5 py-0.5 rounded-lg border ${SCORE_COLOR(score)}`}>
                                            {score}
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            {product?.brand && (
                                                <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-0.5">
                                                    {product.brand}
                                                </div>
                                            )}
                                            <div
                                                className="font-bold text-sm leading-tight truncate cursor-pointer hover:text-primary transition-colors"
                                                onClick={() => navigate(`/product/${pid}`)}
                                            >
                                                {product?.name || product?.title}
                                            </div>
                                            {product?.category && (
                                                <div className="text-[10px] text-gray-600 mt-0.5">{product.category}</div>
                                            )}
                                        </div>

                                        {/* Remove */}
                                        <button
                                            onClick={() => handleRemove(pid)}
                                            className="text-gray-600 hover:text-rose-400 transition-colors flex-shrink-0 p-1"
                                            disabled={isRemoving}
                                        >
                                            <HiOutlineX />
                                        </button>
                                    </div>

                                    {/* Price row */}
                                    <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-lg font-black text-white">
                                                ${product?.price?.toFixed(2)}
                                            </span>
                                            <span className="text-xs text-gray-600">each</span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <QtyControl
                                                productId={pid}
                                                quantity={item.quantity}
                                                onUpdate={handleUpdate}
                                                onRemove={handleRemove}
                                                loading={isLoading}
                                            />
                                            <div className="text-right">
                                                <div className="text-sm font-black text-primary">
                                                    ${lineTotal.toFixed(2)}
                                                </div>
                                                {item.quantity > 1 && (
                                                    <div className="text-[10px] text-gray-600">subtotal</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Brand reputation hint */}
                                    {score >= 80 && (
                                        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                                            <HiOutlineBadgeCheck />
                                            <span>Top-rated · Score {score}/100</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Move to wishlist hint */}
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-600 pt-2">
                        <HiOutlineHeart className="text-gray-700" />
                        <span>Visit <Link to="/wishlist" className="text-gray-400 hover:text-primary transition-colors font-bold">Wishlist</Link> to save items for later</span>
                    </div>
                </div>

                {/* ── Order Summary ─────────────────────────────────────── */}
                <div className="space-y-4 lg:sticky lg:top-24">
                    <div className="glass-card p-6 space-y-4">
                        <h3 className="font-black text-lg">Order Summary</h3>

                        {/* Line items */}
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-400">
                                <span>Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})</span>
                                <span className="font-bold text-white">${subtotal.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between text-gray-400">
                                <span className="flex items-center gap-1">
                                    <HiOutlineTruck className="text-xs" /> Shipping
                                </span>
                                <span className={`font-bold ${shipping === 0 ? "text-emerald-400" : "text-white"}`}>
                                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                                </span>
                            </div>

                            <div className="flex justify-between text-gray-400">
                                <span>Tax (8%)</span>
                                <span className="font-bold text-white">${tax.toFixed(2)}</span>
                            </div>

                            {promoApplied && (
                                <div className="flex justify-between text-emerald-400">
                                    <span className="flex items-center gap-1">
                                        <HiOutlineTag /> Promo SAVE10
                                    </span>
                                    <span className="font-bold">-${discount.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        {/* Promo code */}
                        <div className="border-t border-gray-800/60 pt-4 space-y-2">
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Promo Code</div>
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm placeholder-gray-700 focus:border-primary/50 focus:outline-none transition-colors"
                                    placeholder="Enter code…"
                                    value={promoCode}
                                    onChange={(e) => { setPromoCode(e.target.value); setPromoError(""); }}
                                    onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                                    disabled={promoApplied}
                                />
                                <button
                                    onClick={promoApplied ? () => { setPromoApplied(false); setPromoCode(""); } : applyPromo}
                                    className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${promoApplied ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-gray-700 text-gray-300 hover:border-gray-500"}`}
                                >
                                    {promoApplied ? "✓ Applied" : "Apply"}
                                </button>
                            </div>
                            {promoError && <div className="text-[11px] text-rose-400 font-bold">{promoError}</div>}
                            {!promoApplied && <div className="text-[10px] text-gray-600">Try: SAVE10</div>}
                        </div>

                        {/* Total */}
                        <div className="border-t border-gray-800/60 pt-4 flex justify-between items-baseline">
                            <span className="font-black text-base">Total</span>
                            <div className="text-right">
                                <span className="text-2xl font-black text-white">${total.toFixed(2)}</span>
                                {savings > 0 && (
                                    <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                                        You save ${savings.toFixed(2)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Checkout CTA */}
                        <button
                            className="btn btn-primary w-full py-4 text-base font-black flex items-center justify-center gap-2 mt-2"
                            onClick={() => navigate("/checkout")}
                        >
                            Proceed to Checkout <HiOutlineArrowRight />
                        </button>

                        {/* Trust badges */}
                        <TrustBadges />
                    </div>

                    {/* Comparison nudge */}
                    <div className="glass-card p-4 flex items-center gap-3 border-primary/20 bg-primary/5">
                        <HiOutlineSparkles className="text-primary text-xl flex-shrink-0" />
                        <div>
                            <div className="text-xs font-black text-white">Not sure yet?</div>
                            <div className="text-[11px] text-gray-400 mt-0.5">
                                <Link to="/comparison" className="text-primary hover:underline font-bold">Compare products</Link> side-by-side before you buy.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0);    }
                }
            `}</style>
        </div>
    );
}