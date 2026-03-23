import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
    HiOutlineMail,
    HiOutlineLockClosed,
    HiOutlineEye,
    HiOutlineEyeOff,
    HiOutlineShieldCheck,
    HiOutlineLightningBolt,
    HiOutlineSparkles,
    HiOutlineArrowRight,
    HiOutlineBadgeCheck,
    HiOutlineStar,
    HiOutlineScale,
    HiOutlineRefresh,
} from "react-icons/hi";

// ─── trust points shown on the left panel ────────────────────────────────────
const TRUST_POINTS = [
    { icon: <HiOutlineScale />, text: "Compare products across all major stores" },
    { icon: <HiOutlineSparkles />, text: "AI-powered scoring on every product" },
    { icon: <HiOutlineShieldCheck />, text: "Verified brand reputation index" },
    { icon: <HiOutlineStar />, text: "Save wishlists and track price drops" },
];

// ─── field component ──────────────────────────────────────────────────────────
function Field({ id, label, type, value, onChange, placeholder, error, icon, rightEl }) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-1">
                {label}
            </label>
            <div className={`flex items-center gap-3 bg-gray-950 border rounded-xl px-4 py-3 transition-all duration-200 ${error ? "border-rose-500/60 bg-rose-500/5" : "border-gray-800 hover:border-gray-700 focus-within:border-primary/50"
                }`}>
                <span className={`text-base flex-shrink-0 ${error ? "text-rose-400" : "text-gray-600"}`}>{icon}</span>
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required
                    className="flex-1 bg-transparent text-sm text-white placeholder-gray-700 focus:outline-none"
                />
                {rightEl}
            </div>
            {error && <p className="text-[11px] text-rose-400 font-bold mt-1">{error}</p>}
        </div>
    );
}

// ─── main ─────────────────────────────────────────────────────────────────────
export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // ── validation ────────────────────────────────────────────────────────────
    const validate = () => {
        const e = {};
        if (!email.trim()) e.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
        if (!password) e.password = "Password is required";
        else if (password.length < 6) e.password = "At least 6 characters";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ── submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await api.post("/auth/login", { email, password });
            login(res.data);
            toast.success("Welcome back! 👋");
            navigate("/");
        } catch (err) {
            const msg = err.response?.data?.message || "Login failed. Check your credentials.";
            toast.error(msg);
            // Surface server error under the right field
            if (msg.toLowerCase().includes("email")) setErrors({ email: msg });
            else if (msg.toLowerCase().includes("pass")) setErrors({ password: msg });
            else setErrors({ password: msg });
        } finally {
            setLoading(false);
        }
    };

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity:0; transform:translateY(18px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                @keyframes float {
                    0%,100% { transform:translateY(0); }
                    50%     { transform:translateY(-6px); }
                }
                .animate-in { animation: fadeSlideUp 0.45s ease both; }
                .float-1    { animation: float 4s ease-in-out infinite; }
                .float-2    { animation: float 4s ease-in-out infinite 1s; }
                .float-3    { animation: float 4s ease-in-out infinite 2s; }
            `}</style>

            <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden">

                {/* Background ambient blobs */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-[0.07]"
                        style={{ background: "radial-gradient(ellipse, #6366f1, transparent 70%)" }} />
                    <div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full opacity-[0.05]"
                        style={{ background: "radial-gradient(ellipse, #10b981, transparent 70%)" }} />
                    {/* Floating dots */}
                    <div className="absolute top-20 left-16 w-2 h-2 rounded-full bg-primary/30 float-1" />
                    <div className="absolute top-40 right-20 w-1.5 h-1.5 rounded-full bg-amber-400/30 float-2" />
                    <div className="absolute bottom-32 left-1/4 w-1 h-1 rounded-full bg-emerald-400/30 float-3" />
                </div>

                {/* Card container */}
                <div className="w-full max-w-4xl animate-in">
                    <div className="grid grid-cols-1 lg:grid-cols-2 glass-card overflow-hidden border-gray-700/60 shadow-2xl">

                        {/* ── Left panel ─────────────────────────────────── */}
                        <div className="hidden lg:flex flex-col justify-between p-10 relative overflow-hidden"
                            style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.04) 100%)" }}
                        >
                            {/* Decorative accent */}
                            <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                            {/* Brand */}
                            <div>
                                <div className="flex items-center gap-2 mb-8">
                                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                                        <HiOutlineScale className="text-white text-base" />
                                    </div>
                                    <span className="font-black text-lg tracking-tight">CompareHub</span>
                                </div>

                                <h2 className="text-3xl font-black leading-tight mb-3">
                                    Shop smarter.<br />
                                    <span className="text-primary">Buy better.</span>
                                </h2>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Pakistan&apos;s #1 AI-powered product comparison engine. Sign in to access your saved comparisons and wishlists.
                                </p>
                            </div>

                            {/* Trust points */}
                            <div className="space-y-4 my-8">
                                {TRUST_POINTS.map(({ icon, text }, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 text-sm text-gray-400"
                                        style={{ animationDelay: `${i * 80 + 200}ms`, animation: "fadeSlideUp 0.4s ease both" }}
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                                            {icon}
                                        </div>
                                        {text}
                                    </div>
                                ))}
                            </div>

                            {/* Bottom badge */}
                            <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                                <HiOutlineBadgeCheck className="text-emerald-500" />
                                Trusted by 2,000+ shoppers
                            </div>
                        </div>

                        {/* ── Right panel: form ───────────────────────────── */}
                        <div className="p-8 sm:p-10 flex flex-col justify-center">

                            {/* Mobile brand mark */}
                            <div className="flex items-center gap-2 mb-8 lg:hidden">
                                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                                    <HiOutlineScale className="text-white text-sm" />
                                </div>
                                <span className="font-black tracking-tight">CompareHub</span>
                            </div>

                            <div className="mb-8">
                                <h1 className="text-2xl font-black mb-1">Welcome back</h1>
                                <p className="text-gray-500 text-sm">
                                    Don&apos;t have an account?{" "}
                                    <Link to="/register" className="text-primary font-bold hover:underline">
                                        Create one free
                                    </Link>
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} noValidate className="space-y-5">

                                {/* Email */}
                                <Field
                                    id="login-email"
                                    label="Email address"
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                                    placeholder="you@example.com"
                                    error={errors.email}
                                    icon={<HiOutlineMail />}
                                />

                                {/* Password */}
                                <Field
                                    id="login-password"
                                    label="Password"
                                    type={showPass ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
                                    placeholder="••••••••"
                                    error={errors.password}
                                    icon={<HiOutlineLockClosed />}
                                    rightEl={
                                        <button
                                            type="button"
                                            onClick={() => setShowPass((v) => !v)}
                                            className="text-gray-600 hover:text-gray-300 transition-colors flex-shrink-0"
                                            tabIndex={-1}
                                        >
                                            {showPass ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                                        </button>
                                    }
                                />

                                {/* Remember me + forgot */}
                                <div className="flex items-center justify-between pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div
                                            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${rememberMe ? "bg-primary border-primary" : "border-gray-700 group-hover:border-gray-500"
                                                }`}
                                            onClick={() => setRememberMe((v) => !v)}
                                        >
                                            {rememberMe && (
                                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                                                    <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500 font-bold">Remember me</span>
                                    </label>
                                    <button
                                        type="button"
                                        className="text-xs text-gray-500 hover:text-primary transition-colors font-bold"
                                        onClick={() => toast("Password reset coming soon", { icon: "🔑" })}
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    id="login-submit"
                                    disabled={loading}
                                    className="w-full btn btn-primary py-3.5 text-sm font-black flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading
                                        ? <><HiOutlineRefresh className="animate-spin" /> Signing in…</>
                                        : <><HiOutlineLightningBolt /> Sign In <HiOutlineArrowRight /></>
                                    }
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="flex items-center gap-3 my-6">
                                <div className="flex-1 h-px bg-gray-800" />
                                <span className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">or continue as</span>
                                <div className="flex-1 h-px bg-gray-800" />
                            </div>

                            {/* Guest browse */}
                            <Link
                                to="/products"
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-800 text-gray-500 hover:border-gray-600 hover:text-white transition-all text-sm font-bold"
                            >
                                <HiOutlineSparkles className="text-primary" />
                                Browse without account
                            </Link>

                            {/* Trust strip */}
                            <div className="flex items-center justify-center gap-4 mt-8 text-[10px] text-gray-700 font-bold uppercase tracking-wider">
                                <span className="flex items-center gap-1"><HiOutlineShieldCheck className="text-emerald-600" /> SSL Secure</span>
                                <span className="flex items-center gap-1"><HiOutlineLockClosed className="text-gray-600" /> Encrypted</span>
                                <span className="flex items-center gap-1"><HiOutlineBadgeCheck className="text-primary/60" /> Verified</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}