import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    HiOutlineHome, HiOutlineSearch, HiOutlineScale,
    HiOutlineArrowLeft, HiOutlineSparkles, HiOutlineLightningBolt,
} from "react-icons/hi";

const SUGGESTIONS = [
    { label: "Home", to: "/", icon: <HiOutlineHome /> },
    { label: "Products", to: "/products", icon: <HiOutlineSearch /> },
    { label: "Best Deals", to: "/best-deals", icon: <HiOutlineSparkles /> },
    { label: "Compare", to: "/comparison", icon: <HiOutlineScale /> },
];

export default function NotFound() {
    const navigate = useNavigate();
    const [count, setCount] = useState(10);

    useEffect(() => {
        const t = setInterval(() => setCount((c) => {
            if (c <= 1) { clearInterval(t); navigate("/"); }
            return c - 1;
        }), 1000);
        return () => clearInterval(t);
    }, [navigate]);

    return (
        <>
            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity:0; transform:translateY(20px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                @keyframes float {
                    0%,100% { transform:translateY(0) rotate(0deg); }
                    50%     { transform:translateY(-12px) rotate(3deg); }
                }
                @keyframes spin-slow { to { transform: rotate(360deg); } }
                .animate-in   { animation: fadeSlideUp 0.5s ease both; }
                .delay-1 { animation-delay:.1s; }
                .delay-2 { animation-delay:.2s; }
                .delay-3 { animation-delay:.3s; }
                .float   { animation: float 5s ease-in-out infinite; }
                .spin-slow { animation: spin-slow 20s linear infinite; }
            `}</style>

            <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden text-center">

                {/* Ambient */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06]"
                        style={{ background: "radial-gradient(ellipse, #6366f1, transparent 70%)" }} />
                    <div className="absolute top-10 left-10 w-32 h-32 border border-gray-800 rounded-full spin-slow opacity-30" />
                    <div className="absolute bottom-20 right-10 w-20 h-20 border border-gray-800 rounded-full spin-slow opacity-20" style={{ animationDirection: "reverse", animationDuration: "15s" }} />
                    <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 rounded-full bg-primary/40 float" />
                    <div className="absolute top-1/2 right-1/4 w-1 h-1 rounded-full bg-amber-400/30 float" style={{ animationDelay: "1.5s" }} />
                </div>

                {/* 404 giant text */}
                <div className="relative animate-in">
                    <div className="text-[180px] sm:text-[220px] font-black leading-none tracking-tighter select-none float"
                        style={{ WebkitTextStroke: "2px rgba(99,102,241,0.3)", color: "transparent" }}>
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-[180px] sm:text-[220px] font-black leading-none tracking-tighter select-none opacity-[0.06]"
                            style={{ color: "#6366f1", filter: "blur(40px)" }}>
                            404
                        </div>
                    </div>
                </div>

                {/* Message */}
                <div className="relative z-10 -mt-8 space-y-4 animate-in delay-1">
                    <h1 className="text-3xl sm:text-4xl font-black">Page not found</h1>
                    <p className="text-gray-500 text-base max-w-md mx-auto leading-relaxed">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                        You&apos;ll be redirected to Home in{" "}
                        <span className="text-primary font-black">{count}s</span>.
                    </p>
                </div>

                {/* Quick links */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 w-full max-w-xl animate-in delay-2">
                    {SUGGESTIONS.map(({ label, to, icon }) => (
                        <Link key={to} to={to}
                            className="glass-card p-4 flex flex-col items-center gap-2 hover:border-primary/40 hover:bg-primary/5 hover:-translate-y-0.5 transition-all">
                            <span className="text-primary text-xl">{icon}</span>
                            <span className="text-xs font-black">{label}</span>
                        </Link>
                    ))}
                </div>

                {/* Back button */}
                <button onClick={() => navigate(-1)}
                    className="mt-8 flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors font-bold animate-in delay-3">
                    <HiOutlineArrowLeft /> Go back
                </button>
            </div>
        </>
    );
}