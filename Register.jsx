import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
    HiOutlineUser,
    HiOutlineMail,
    HiOutlineLockClosed,
    HiOutlineEye,
    HiOutlineEyeOff,
    HiOutlineSparkles,
    HiOutlineArrowRight,
    HiOutlineScale,
    HiOutlineHeart,
    HiOutlineStar,
    HiOutlineRefresh,
    HiOutlineShieldCheck,
    HiOutlineCheckCircle,
    HiOutlineBadgeCheck,
} from "react-icons/hi";

// ─── perks shown on the left panel ───────────────────────────────────────────
const PERKS = [
    { icon: <HiOutlineScale />, title: "Compare Anything", desc: "Side-by-side analysis across every major store", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
    { icon: <HiOutlineSparkles />, title: "AI Deal Scoring", desc: "Every product scored for quality, price & trust", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    { icon: <HiOutlineHeart />, title: "Save Wishlists", desc: "Bookmark products and track price drops over time", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
    { icon: <HiOutlineStar />, title: "Earn Trust Points", desc: "Review products and help others shop smarter", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
];

// ─── password strength ────────────────────────────────────────────────────────
function getStrength(pwd) {
    const checks = [
        pwd.length >= 8,
        /[A-Z]/.test(pwd),
        /[0-9]/.test(pwd),
        /[^a-zA-Z0-9]/.test(pwd),
    ];
    const score = checks.filter(Boolean).length;
    return {
        score,
        label: ["", "Weak", "Fair", "Good", "Strong"][score],
        color: ["", "#ef4444", "#f59e0b", "#f59e0b", "#10b981"][score],
        checks,
    };
}

// ─── reusable field ───────────────────────────────────────────────────────────
function Field({ id, label, type, value, onChange, placeholder, error, icon, rightEl }) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                {label}
            </label>
            <div className={`flex items-center gap-3 bg-gray-950 border rounded-xl px-4 py-3 transition-all duration-200 ${error
                    ? "border-rose-500/60 bg-rose-500/5"
                    : "border-gray-800 hover:border-gray-700 focus-within:border-primary/50"
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
            {error && <p className="text-[11px] text-rose-400 font-bold">{error}</p>}
        </div>
    );
}

// ─── main ─────────────────────────────────────────────────────────────────────
export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const strength = getStrength(password);

    // ── validation ────────────────────────────────────────────────────────────
    const validate = () => {
        const e = {};
        if (!name.trim()) e.name = "Full name is required";
        else if (name.trim().length < 2) e.name = "Name too short";
        if (!email.trim()) e.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
        if (!password) e.password = "Password is required";
        else if (password.length < 6) e.password = "Minimum 6 characters";
        if (!agreed) e.agreed = "Please accept the terms to continue";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ── submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await api.post("/auth/register", { name, email, password });
            login(res.data);
            toast.success("Welcome to CompareHub! 🎉");
            navigate("/");
        } catch (err) {
            const msg = err.response?.data?.message || "Registration failed";
            toast.error(msg);
            if (msg.toLowerCase().includes("email")) setErrors({ email: msg });
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
                .float-1 { animation: float 4s ease-in-out infinite; }
                .float-2 { animation: float 4s ease-in-out infinite 1.2s; }
                .float-3 { animation: float 4s ease-in-out infinite 2.1s; }
            `}</style>

            <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden">

                {/* Ambient blobs */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-1/4 w-[600px] h-[400px] rounded-full opacity-[0.07]"
                        style={{ background: "radial-gradient(ellipse, #10b981, transparent 70%)" }} />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[300px] rounded-full opacity-[0.05]"
                        style={{ background: "radial-gradient(ellipse, #6366f1, transparent 70%)" }} />
                    <div className="absolute top-24 right-20 w-2 h-2 rounded-full bg-emerald-400/30 float-1" />
                    <div className="absolute top-48 left-16 w-1.5 h-1.5 rounded-full bg-primary/30 float-2" />
                    <div className="absolute bottom-28 right-1/3 w-1 h-1 rounded-full bg-amber-400/30 float-3" />
                </div>

                {/* Card */}
                <div className="w-full max-w-4xl animate-in">
                    <div className="grid grid-cols-1 lg:grid-cols-2 glass-card overflow-hidden border-gray-700/60 shadow-2xl">

                        {/* ── Left panel ─────────────────────────────────── */}
                        <div className="hidden lg:flex flex-col justify-between p-10 relative overflow-hidden order-last lg:order-first"
                            style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.03) 100%)" }}
                        >
                            <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent" />
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

                            {/* Brand */}
                            <div>
                                <div className="flex items-center gap-2 mb-8">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
                                        <HiOutlineScale className="text-white text-base" />
                                    </div>
                                    <span className="font-black text-lg tracking-tight">CompareHub</span>
                                </div>
                                <h2 className="text-3xl font-black leading-tight mb-3">
                                    Join 2,000+<br />
                                    <span className="text-emerald-400">smart shoppers.</span>
                                </h2>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Free forever. No credit card required. Start comparing in 30 seconds.
                                </p>
                            </div>

                            {/* Perk cards */}
                            <div className="space-y-3 my-8">
                                {PERKS.map(({ icon, title, desc, color, bg }, i) => (
                                    <div key={i}
                                        className={`flex items-start gap-3 p-3 rounded-xl border ${bg} transition-all`}
                                        style={{ animation: `fadeSlideUp 0.4s ease both`, animationDelay: `${i * 80 + 150}ms` }}
                                    >
                                        <div className={`text-lg flex-shrink-0 mt-0.5 ${color}`}>{icon}</div>
                                        <div>
                                            <div className={`text-xs font-black ${color}`}>{title}</div>
                                            <div className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Bottom */}
                            <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                                <HiOutlineShieldCheck className="text-emerald-600" />
                                Free to join · No spam · Cancel anytime
                            </div>
                        </div>

                        {/* ── Right panel: form ───────────────────────────── */}
                        <div className="p-8 sm:p-10 flex flex-col justify-center">

                            {/* Mobile brand */}
                            <div className="flex items-center gap-2 mb-8 lg:hidden">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">
                                    <HiOutlineScale className="text-white text-sm" />
                                </div>
                                <span className="font-black tracking-tight">CompareHub</span>
                            </div>

                            <div className="mb-8">
                                <h1 className="text-2xl font-black mb-1">Create your account</h1>
                                <p className="text-gray-500 text-sm">
                                    Already have one?{" "}
                                    <Link to="/login" className="text-primary font-bold hover:underline">
                                        Sign in
                                    </Link>
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} noValidate className="space-y-4">

                                {/* Name */}
                                <Field
                                    id="reg-name"
                                    label="Full Name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                                    placeholder="John Doe"
                                    error={errors.name}
                                    icon={<HiOutlineUser />}
                                />

                                {/* Email */}
                                <Field
                                    id="reg-email"
                                    label="Email Address"
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                                    placeholder="you@example.com"
                                    error={errors.email}
                                    icon={<HiOutlineMail />}
                                />

                                {/* Password */}
                                <Field
                                    id="reg-password"
                                    label="Password"
                                    type={showPass ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
                                    placeholder="Minimum 6 characters"
                                    error={errors.password}
                                    icon={<HiOutlineLockClosed />}
                                    rightEl={
                                        <button type="button" tabIndex={-1}
                                            onClick={() => setShowPass((v) => !v)}
                                            className="text-gray-600 hover:text-gray-300 transition-colors flex-shrink-0">
                                            {showPass ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                                        </button>
                                    }
                                />

                                {/* Password strength */}
                                {password.length > 0 && (
                                    <div className="space-y-2 pt-1">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                                                    style={{ backgroundColor: i <= strength.score ? strength.color : "#1f2937" }} />
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black" style={{ color: strength.color }}>
                                                {strength.label}
                                            </span>
                                            <div className="flex gap-3">
                                                {[
                                                    [strength.checks[0], "8+ chars"],
                                                    [strength.checks[1], "A-Z"],
                                                    [strength.checks[2], "0-9"],
                                                    [strength.checks[3], "Symbol"],
                                                ].map(([met, label]) => (
                                                    <span key={label} className={`text-[10px] font-bold flex items-center gap-0.5 transition-colors ${met ? "text-emerald-400" : "text-gray-700"}`}>
                                                        {met ? <HiOutlineCheckCircle className="text-emerald-400" /> : "·"} {label}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Terms */}
                                <div className="pt-1">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div
                                            className={`w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-all ${agreed ? "bg-primary border-primary" : "border-gray-700 group-hover:border-gray-500"
                                                }`}
                                            onClick={() => { setAgreed((v) => !v); setErrors((p) => ({ ...p, agreed: "" })); }}
                                        >
                                            {agreed && (
                                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                                                    <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500 leading-relaxed">
                                            I agree to the{" "}
                                            <button type="button" className="text-primary hover:underline font-bold">Terms of Service</button>
                                            {" "}and{" "}
                                            <button type="button" className="text-primary hover:underline font-bold">Privacy Policy</button>
                                        </span>
                                    </label>
                                    {errors.agreed && <p className="text-[11px] text-rose-400 font-bold mt-1.5">{errors.agreed}</p>}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    id="register-submit"
                                    disabled={loading}
                                    className="w-full btn btn-primary py-3.5 text-sm font-black flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ background: loading ? undefined : "linear-gradient(135deg, #10b981, #059669)" }}
                                >
                                    {loading
                                        ? <><HiOutlineRefresh className="animate-spin" /> Creating account…</>
                                        : <><HiOutlineSparkles /> Create Free Account <HiOutlineArrowRight /></>
                                    }
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="flex items-center gap-3 my-5">
                                <div className="flex-1 h-px bg-gray-800" />
                                <span className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">or</span>
                                <div className="flex-1 h-px bg-gray-800" />
                            </div>

                            {/* Browse without account */}
                            <Link
                                to="/products"
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-800 text-gray-500 hover:border-gray-600 hover:text-white transition-all text-sm font-bold"
                            >
                                <HiOutlineScale className="text-emerald-500" />
                                Explore without signing up
                            </Link>

                            {/* Trust strip */}
                            <div className="flex items-center justify-center gap-4 mt-6 text-[10px] text-gray-700 font-bold uppercase tracking-wider">
                                <span className="flex items-center gap-1"><HiOutlineShieldCheck className="text-emerald-600" /> Free Forever</span>
                                <span className="flex items-center gap-1"><HiOutlineLockClosed className="text-gray-600" /> Encrypted</span>
                                <span className="flex items-center gap-1"><HiOutlineBadgeCheck className="text-primary/60" /> No Spam</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}