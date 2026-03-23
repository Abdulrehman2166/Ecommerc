import { useContext, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
    HiOutlineShieldCheck,
    HiOutlineTruck,
    HiOutlineCreditCard,
    HiOutlineCheckCircle,
    HiOutlineChevronRight,
    HiOutlineChevronLeft,
    HiOutlineLocationMarker,
    HiOutlineLockClosed,
    HiOutlineRefresh,
    HiOutlineBadgeCheck,
    HiOutlineTag,
    HiOutlineSparkles,
    HiOutlineX,
} from "react-icons/hi";

// ─── constants ────────────────────────────────────────────────────────────────
const FREE_SHIPPING = 50;
const SHIPPING_COST = 9.99;
const TAX_RATE      = 0.08;

const STEPS = [
    { id: 1, label: "Shipping",  icon: <HiOutlineLocationMarker /> },
    { id: 2, label: "Payment",   icon: <HiOutlineCreditCard />     },
    { id: 3, label: "Review",    icon: <HiOutlineCheckCircle />    },
];

const PAYMENT_METHODS = [
    { id: "card",   label: "Credit / Debit Card",  icon: "💳", hint: "Visa, Mastercard, Amex" },
    { id: "paypal", label: "PayPal",               icon: "🅿️",  hint: "Fast & secure"          },
    { id: "cod",    label: "Cash on Delivery",     icon: "💵", hint: "Pay when you receive"   },
];

const COUNTRIES = ["Pakistan","United States","United Kingdom","UAE","India","Canada","Australia","Germany","France"];

// ─── helpers ──────────────────────────────────────────────────────────────────
const required = (v) => v?.trim().length > 0;
const validPostal = (v) => /^[a-zA-Z0-9\s\-]{3,10}$/.test(v?.trim());

// ─── sub-components ───────────────────────────────────────────────────────────

function StepBar({ current }) {
    return (
        <div className="flex items-center justify-center gap-0 mb-10">
            {STEPS.map((step, i) => {
                const done    = current > step.id;
                const active  = current === step.id;
                return (
                    <div key={step.id} className="flex items-center">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                            done   ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                            active ? "bg-primary/20 text-primary border border-primary/40" :
                                     "bg-gray-900 text-gray-600 border border-gray-800"
                        }`}>
                            {done
                                ? <HiOutlineCheckCircle className="text-base" />
                                : <span className="text-base">{step.icon}</span>
                            }
                            <span className="hidden sm:inline">{step.label}</span>
                            <span className="sm:hidden">{step.id}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`w-8 sm:w-12 h-px mx-1 transition-all duration-500 ${current > step.id ? "bg-emerald-500/50" : "bg-gray-800"}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function FieldError({ msg }) {
    return msg ? <p className="text-[11px] text-rose-400 font-bold mt-1 flex items-center gap-1"><HiOutlineX className="text-xs" />{msg}</p> : null;
}

function FormInput({ label, name, value, onChange, placeholder, error, type = "text", required: req }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-1">
                {label}{req && <span className="text-rose-500">*</span>}
            </label>
            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full bg-gray-950 border rounded-xl px-4 py-3 text-sm placeholder-gray-700 focus:outline-none transition-all duration-200 ${
                    error
                        ? "border-rose-500/60 focus:border-rose-400 bg-rose-500/5"
                        : "border-gray-800 focus:border-primary/50 hover:border-gray-700"
                }`}
            />
            <FieldError msg={error} />
        </div>
    );
}

function OrderItemRow({ item }) {
    const product  = item.product;
    const lineAmt  = (product?.price || 0) * item.quantity;
    return (
        <div className="flex items-center gap-4 py-3 border-b border-gray-800/60 last:border-0">
            <div className="relative w-12 h-12 flex-shrink-0">
                <img
                    src={product?.images?.[0]}
                    alt={product?.name || product?.title}
                    className="w-full h-full object-cover rounded-xl bg-gray-800"
                />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 border border-gray-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {item.quantity}
                </span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{product?.name || product?.title}</div>
                {product?.brand && <div className="text-[10px] text-primary font-bold">{product.brand}</div>}
            </div>
            <span className="font-black text-sm flex-shrink-0">${lineAmt.toFixed(2)}</span>
        </div>
    );
}

function TrustRow() {
    return (
        <div className="flex flex-wrap justify-center gap-4 text-[10px] text-gray-600 font-bold uppercase tracking-wider pt-4 border-t border-gray-800/40">
            {[
                [<HiOutlineLockClosed />,  "256-bit SSL"],
                [<HiOutlineShieldCheck />, "Secure payment"],
                [<HiOutlineRefresh />,     "Easy returns"],
                [<HiOutlineBadgeCheck />,  "Verified seller"],
            ].map(([icon, label]) => (
                <span key={label} className="flex items-center gap-1.5">
                    <span className="text-gray-700 text-sm">{icon}</span>{label}
                </span>
            ))}
        </div>
    );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function Checkout() {
    const { cart, clearCart } = useContext(CartContext);
    const navigate = useNavigate();

    const [step,    setStep]    = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors,  setErrors]  = useState({});
    const [payMethod, setPayMethod] = useState("card");

    const [form, setForm] = useState({
        fullName:   "",
        address:    "",
        city:       "",
        postalCode: "",
        country:    "Pakistan",
        // card fields
        cardNumber: "",
        cardExpiry: "",
        cardCvv:    "",
        cardName:   "",
    });

    const items     = cart.items || [];
    const subtotal  = items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
    const shipping  = subtotal >= FREE_SHIPPING ? 0 : SHIPPING_COST;
    const tax       = subtotal * TAX_RATE;
    const total     = subtotal + shipping + tax;

    // redirect if empty
    useEffect(() => { if (items.length === 0) navigate("/cart"); }, [items.length]);

    const set = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
        setErrors((p) => ({ ...p, [name]: "" }));
    };

    // ── validation ────────────────────────────────────────────────────────────
    const validateStep1 = () => {
        const e = {};
        if (!required(form.fullName))   e.fullName   = "Full name is required";
        if (!required(form.address))    e.address    = "Address is required";
        if (!required(form.city))       e.city       = "City is required";
        if (!validPostal(form.postalCode)) e.postalCode = "Enter a valid postal code";
        if (!required(form.country))    e.country    = "Country is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep2 = () => {
        if (payMethod !== "card") return true;
        const e = {};
        if (!/^\d{16}$/.test(form.cardNumber.replace(/\s/g,""))) e.cardNumber = "Enter a valid 16-digit card number";
        if (!/^\d{2}\/\d{2}$/.test(form.cardExpiry))             e.cardExpiry = "Format: MM/YY";
        if (!/^\d{3,4}$/.test(form.cardCvv))                     e.cardCvv    = "Enter 3 or 4 digit CVV";
        if (!required(form.cardName))                             e.cardName   = "Name on card required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const nextStep = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        setStep((s) => s + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const prevStep = () => {
        setStep((s) => s - 1);
        setErrors({});
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // ── submit ────────────────────────────────────────────────────────────────
    const handleOrder = async () => {
        setLoading(true);
        try {
            const orderItems = items.map((item) => ({
                product:  item.product?._id,
                name:     item.product?.name || item.product?.title,
                price:    item.product?.price,
                quantity: item.quantity,
                image:    item.product?.images?.[0],
            }));

            await api.post("/orders", {
                items:           orderItems,
                totalAmount:     total,
                shippingAddress: {
                    fullName:   form.fullName,
                    address:    form.address,
                    city:       form.city,
                    postalCode: form.postalCode,
                    country:    form.country,
                },
                paymentMethod: payMethod,
                paymentId:     "demo_" + Date.now(),
            });

            await clearCart();
            toast.success("Order placed successfully! 🎉");
            navigate("/orders");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to place order. Try again.");
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) return null;

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <div className="page container animate-in max-w-5xl mx-auto">

            {/* Header */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <HiOutlineLockClosed className="text-primary" />
                    <span className="text-xs text-primary font-bold uppercase tracking-widest">Secure Checkout</span>
                </div>
                <h2 className="text-3xl font-black">Complete Your Order</h2>
            </div>

            {/* Step bar */}
            <StepBar current={step} />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

                {/* ── Left: step content ────────────────────────────────── */}
                <div>

                    {/* STEP 1 — Shipping */}
                    {step === 1 && (
                        <div className="glass-card p-8 space-y-6 animate-in">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                                    <HiOutlineLocationMarker />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg">Shipping Address</h3>
                                    <p className="text-xs text-gray-500">Where should we deliver?</p>
                                </div>
                            </div>

                            <FormInput label="Full Name" name="fullName" value={form.fullName} onChange={set} placeholder="John Doe" error={errors.fullName} required />
                            <FormInput label="Street Address" name="address" value={form.address} onChange={set} placeholder="123 Main Street, Apt 4B" error={errors.address} required />

                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="City" name="city" value={form.city} onChange={set} placeholder="Karachi" error={errors.city} required />
                                <FormInput label="Postal Code" name="postalCode" value={form.postalCode} onChange={set} placeholder="75600" error={errors.postalCode} required />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-1">
                                    Country <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    name="country"
                                    value={form.country}
                                    onChange={set}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:outline-none hover:border-gray-700 transition-all cursor-pointer"
                                >
                                    {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                                </select>
                                <FieldError msg={errors.country} />
                            </div>

                            {/* Delivery estimate */}
                            <div className="flex items-center gap-3 p-4 bg-gray-900/60 rounded-xl border border-gray-800">
                                <HiOutlineTruck className="text-primary text-xl flex-shrink-0" />
                                <div>
                                    <div className="text-xs font-black text-white">
                                        {shipping === 0 ? "Free Standard Shipping" : `Standard Shipping — $${SHIPPING_COST.toFixed(2)}`}
                                    </div>
                                    <div className="text-[10px] text-gray-500 mt-0.5">Estimated 3–7 business days</div>
                                </div>
                                {shipping === 0 && (
                                    <span className="ml-auto text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">FREE</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 2 — Payment */}
                    {step === 2 && (
                        <div className="glass-card p-8 space-y-6 animate-in">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                                    <HiOutlineCreditCard />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg">Payment Method</h3>
                                    <p className="text-xs text-gray-500">Choose how you'd like to pay</p>
                                </div>
                            </div>

                            {/* Method selector */}
                            <div className="space-y-3">
                                {PAYMENT_METHODS.map((m) => (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => setPayMethod(m.id)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                                            payMethod === m.id
                                                ? "border-primary/50 bg-primary/8 shadow-sm shadow-primary/10"
                                                : "border-gray-800 hover:border-gray-700 bg-gray-900/40"
                                        }`}
                                    >
                                        <span className="text-2xl">{m.icon}</span>
                                        <div className="flex-1">
                                            <div className="text-sm font-black">{m.label}</div>
                                            <div className="text-[10px] text-gray-500 font-bold">{m.hint}</div>
                                        </div>
                                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                                            payMethod === m.id ? "border-primary bg-primary" : "border-gray-600"
                                        }`}>
                                            {payMethod === m.id && <div className="w-full h-full rounded-full bg-white scale-50" />}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Card fields */}
                            {payMethod === "card" && (
                                <div className="space-y-4 pt-2 border-t border-gray-800/60 animate-in">
                                    <FormInput
                                        label="Card Number" name="cardNumber"
                                        value={form.cardNumber} onChange={set}
                                        placeholder="4242 4242 4242 4242"
                                        error={errors.cardNumber} required
                                    />
                                    <FormInput
                                        label="Name on Card" name="cardName"
                                        value={form.cardName} onChange={set}
                                        placeholder="John Doe"
                                        error={errors.cardName} required
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormInput
                                            label="Expiry Date" name="cardExpiry"
                                            value={form.cardExpiry} onChange={set}
                                            placeholder="MM/YY"
                                            error={errors.cardExpiry} required
                                        />
                                        <FormInput
                                            label="CVV" name="cardCvv"
                                            value={form.cardCvv} onChange={set}
                                            placeholder="123"
                                            error={errors.cardCvv} required
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold">
                                        <HiOutlineLockClosed className="text-gray-500" />
                                        Your card details are encrypted and never stored
                                    </div>
                                </div>
                            )}

                            {payMethod === "cod" && (
                                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs text-amber-300 font-bold flex items-start gap-2 animate-in">
                                    <HiOutlineTag className="mt-0.5 flex-shrink-0" />
                                    Cash on delivery available. Please have exact amount ready upon delivery.
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 3 — Review */}
                    {step === 3 && (
                        <div className="space-y-4 animate-in">
                            {/* Shipping review */}
                            <div className="glass-card p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-black flex items-center gap-2">
                                        <HiOutlineLocationMarker className="text-primary" /> Shipping to
                                    </h4>
                                    <button onClick={() => setStep(1)} className="text-xs text-gray-500 hover:text-primary transition-colors font-bold flex items-center gap-1">
                                        Edit
                                    </button>
                                </div>
                                <div className="text-sm space-y-1 text-gray-300">
                                    <div className="font-bold text-white">{form.fullName}</div>
                                    <div>{form.address}</div>
                                    <div>{form.city}, {form.postalCode}</div>
                                    <div>{form.country}</div>
                                </div>
                            </div>

                            {/* Payment review */}
                            <div className="glass-card p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-black flex items-center gap-2">
                                        <HiOutlineCreditCard className="text-primary" /> Payment
                                    </h4>
                                    <button onClick={() => setStep(2)} className="text-xs text-gray-500 hover:text-primary transition-colors font-bold">
                                        Edit
                                    </button>
                                </div>
                                <div className="text-sm text-gray-300">
                                    {PAYMENT_METHODS.find((m) => m.id === payMethod)?.label}
                                    {payMethod === "card" && form.cardNumber && (
                                        <span className="text-gray-500 ml-2 font-mono">
                                            •••• {form.cardNumber.replace(/\s/g,"").slice(-4)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Items review */}
                            <div className="glass-card p-6">
                                <h4 className="font-black mb-4 flex items-center gap-2">
                                    <HiOutlineSparkles className="text-primary" />
                                    {items.length} Item{items.length !== 1 ? "s" : ""}
                                </h4>
                                <div className="space-y-1">
                                    {items.map((item) => <OrderItemRow key={item.product?._id} item={item} />)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation buttons */}
                    <div className={`flex mt-6 gap-3 ${step > 1 ? "justify-between" : "justify-end"}`}>
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white text-sm font-bold transition-all"
                            >
                                <HiOutlineChevronLeft /> Back
                            </button>
                        )}

                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="btn btn-primary flex items-center gap-2 ml-auto"
                            >
                                Continue <HiOutlineChevronRight />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleOrder}
                                disabled={loading}
                                className="btn btn-primary flex items-center gap-2 ml-auto py-4 px-8 text-base font-black disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <><HiOutlineRefresh className="animate-spin" /> Placing Order…</>
                                ) : (
                                    <><HiOutlineShieldCheck /> Place Order — ${total.toFixed(2)}</>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Right: order summary ──────────────────────────────── */}
                <div className="space-y-4 lg:sticky lg:top-24">
                    <div className="glass-card p-6 space-y-4">
                        <h3 className="font-black text-base flex items-center gap-2">
                            Order Summary
                            <span className="text-[10px] text-gray-600 font-bold bg-gray-800 px-2 py-0.5 rounded-full ml-auto">
                                {items.length} item{items.length !== 1 ? "s" : ""}
                            </span>
                        </h3>

                        {/* Item thumbnails */}
                        <div className="space-y-0">
                            {items.map((item) => <OrderItemRow key={item.product?._id} item={item} />)}
                        </div>

                        {/* Totals */}
                        <div className="space-y-2 pt-2 border-t border-gray-800/60 text-sm">
                            <div className="flex justify-between text-gray-400">
                                <span>Subtotal</span>
                                <span className="font-bold text-white">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Shipping</span>
                                <span className={`font-bold ${shipping === 0 ? "text-emerald-400" : "text-white"}`}>
                                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Tax (8%)</span>
                                <span className="font-bold text-white">${tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-baseline pt-2 border-t border-gray-800/60">
                                <span className="font-black text-base">Total</span>
                                <span className="text-2xl font-black text-white">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Free shipping nudge */}
                        {shipping > 0 && (
                            <div className="flex items-center gap-2 text-[11px] text-amber-400 font-bold bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-2.5">
                                <HiOutlineTruck />
                                Add ${(FREE_SHIPPING - subtotal).toFixed(2)} more for free shipping
                            </div>
                        )}

                        <TrustRow />
                    </div>

                    <div className="text-center text-[10px] text-gray-700 font-bold space-y-1">
                        <div>Questions? <Link to="/products" className="text-gray-500 hover:text-primary transition-colors">Continue shopping</Link></div>
                        <div className="flex items-center justify-center gap-1">
                            <HiOutlineLockClosed className="text-gray-600" /> Secured by 256-bit SSL encryption
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity:0; transform:translateY(12px); }
                    to   { opacity:1; transform:translateY(0);    }
                }
                .animate-in { animation: fadeSlideUp 0.35s ease both; }
                .bg-primary\/8 { background-color: rgba(99,102,241,0.08); }
            `}</style>
        </div>
    );
}