import { Link } from "react-router-dom";
import {
    HiOutlineSparkles, HiOutlineShieldCheck, HiOutlineScale,
    HiOutlineLightningBolt, HiOutlineChartBar, HiOutlineGlobeAlt,
    HiOutlineBadgeCheck, HiOutlineStar, HiOutlineArrowRight,
    HiOutlineSearch, HiOutlineCode, HiOutlineTrendingUp,
} from "react-icons/hi";

const STEPS = [
    { n: "01", icon: <HiOutlineSearch />, color: "#6366f1", title: "Data Collection", desc: "We index products from verified stores across Pakistan and globally, capturing price, rating, seller history and product specifications in real time." },
    { n: "02", icon: <HiOutlineChartBar />, color: "#10b981", title: "Quality Analysis", desc: "Our AI evaluates build quality signals, user review sentiment, material descriptions and category benchmarks to generate a Quality Score." },
    { n: "03", icon: <HiOutlineShieldCheck />, color: "#f59e0b", title: "Brand Trust Index", desc: "Each brand is scored on its history, return policies, verified certifications, customer dispute rate and official presence across platforms." },
    { n: "04", icon: <HiOutlineTrendingUp />, color: "#ec4899", title: "Value Calculation", desc: "We combine price relative to category average, current discounts and historical price trends to produce a Value Score for every listing." },
    { n: "05", icon: <HiOutlineSparkles />, color: "#8b5cf6", title: "Overall Score", desc: "The final Product Score is a weighted combination: Quality 40% + Brand Trust 30% + Value 20% + User Ratings 10%." },
];

const TEAM = [
    { name: "AI Engine", role: "Scores 500+ products daily using NLP and structured data analysis", icon: "🤖", color: "#6366f1" },
    { name: "Data Team", role: "Maintains data pipelines from verified Pakistani and global retailers", icon: "📊", color: "#10b981" },
    { name: "Trust Layer", role: "Manually reviews brand applications and dispute resolutions", icon: "🛡️", color: "#f59e0b" },
];

const STATS = [
    { value: "500+", label: "Products Indexed", icon: <HiOutlineSearch /> },
    { value: "50+", label: "Verified Brands", icon: <HiOutlineBadgeCheck /> },
    { value: "2K+", label: "Registered Users", icon: <HiOutlineStar /> },
    { value: "99.9%", label: "Score Accuracy", icon: <HiOutlineTrendingUp /> },
];

export default function About() {
    return (
        <>
            <style>{`
                @keyframes fadeSlideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
                @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
                .animate-in { animation: fadeSlideUp 0.5s ease both; }
                .delay-1 { animation-delay:.1s; }
                .delay-2 { animation-delay:.2s; }
                .float { animation: float 5s ease-in-out infinite; }
            `}</style>

            <div className="max-w-5xl mx-auto space-y-20 pb-20">

                {/* Hero */}
                <section className="text-center animate-in relative pt-8">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.07]"
                            style={{ background: "radial-gradient(ellipse, #6366f1, transparent 70%)" }} />
                        <div className="absolute top-8 left-1/4 w-1.5 h-1.5 rounded-full bg-primary/40 float" />
                        <div className="absolute top-16 right-1/3 w-1 h-1 rounded-full bg-amber-400/30 float" style={{ animationDelay: "1s" }} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <HiOutlineSparkles className="text-primary" />
                            <span className="text-xs text-primary font-black uppercase tracking-widest">About CompareHub</span>
                        </div>
                        <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-5">
                            We help Pakistan<br />
                            <span className="text-primary">buy smarter</span>
                        </h1>
                        <p className="text-gray-400 text-base max-w-2xl mx-auto leading-relaxed">
                            CompareHub is an AI-powered product comparison engine that scores every listing on quality, brand trust,
                            and value — so you never overpay or buy from an unreliable seller again.
                        </p>
                    </div>
                </section>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in delay-1">
                    {STATS.map(({ value, label, icon }) => (
                        <div key={label} className="glass-card p-6 flex flex-col items-center gap-3 text-center">
                            <div className="text-primary text-xl">{icon}</div>
                            <div className="text-3xl font-black">{value}</div>
                            <div className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{label}</div>
                        </div>
                    ))}
                </div>

                {/* How scoring works */}
                <section className="animate-in delay-2">
                    <div className="text-center mb-10">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <HiOutlineCode className="text-primary" />
                            <span className="text-xs text-primary font-black uppercase tracking-widest">The Methodology</span>
                        </div>
                        <h2 className="text-3xl font-black">How we score products</h2>
                        <p className="text-gray-500 text-sm mt-2 max-w-lg mx-auto">
                            Every product score is reproducible and explained. Here's exactly how we calculate it.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {STEPS.map((s, i) => (
                            <div key={s.n} className="glass-card p-6 flex items-start gap-5 hover:border-gray-700 transition-all"
                                style={{ animation: "fadeSlideUp 0.4s ease both", animationDelay: `${i * 80}ms` }}>
                                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                                        style={{ backgroundColor: `${s.color}18`, border: `1px solid ${s.color}30`, color: s.color }}>
                                        {s.icon}
                                    </div>
                                    <span className="text-[10px] font-black" style={{ color: s.color }}>{s.n}</span>
                                </div>
                                <div>
                                    <h3 className="font-black text-base mb-1.5">{s.title}</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Score formula */}
                    <div className="mt-6 glass-card p-6 border-primary/20 bg-primary/5">
                        <div className="text-xs text-primary font-black uppercase tracking-widest mb-3">Score Formula</div>
                        <div className="flex flex-wrap gap-3 items-center text-sm font-black">
                            {[
                                ["Quality", "40%", "#6366f1"],
                                ["+", ""],
                                ["Brand Trust", "30%", "#10b981"],
                                ["+", ""],
                                ["Value", "20%", "#f59e0b"],
                                ["+", ""],
                                ["Ratings", "10%", "#ec4899"],
                                ["=", ""],
                                ["Product Score", "", "#fff"],
                            ].map(([label, pct, color], i) => (
                                ["+", "=", ""].includes(label) && !pct
                                    ? <span key={i} className="text-gray-600 text-lg">{label}</span>
                                    : (
                                        <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl border"
                                            style={{ borderColor: `${color}30`, backgroundColor: `${color}10` }}>
                                            <span style={{ color }}>{label}</span>
                                            {pct && <span className="text-xs opacity-60">{pct}</span>}
                                        </div>
                                    )
                            ))}
                        </div>
                    </div>
                </section>

                {/* Team/pillars */}
                <section>
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black">Built on trust</h2>
                        <p className="text-gray-500 text-sm mt-2">Three pillars keep our data honest and up-to-date.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {TEAM.map(({ name, role, icon, color }) => (
                            <div key={name} className="glass-card p-6 flex flex-col gap-4 hover:border-gray-600 hover:-translate-y-0.5 transition-all">
                                <div className="text-4xl">{icon}</div>
                                <div>
                                    <h3 className="font-black text-sm mb-1">{name}</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed">{role}</p>
                                </div>
                                <div className="h-0.5 rounded-full mt-auto" style={{ backgroundColor: `${color}40` }} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Mission statement */}
                <section className="glass-card p-10 text-center relative overflow-hidden border-primary/20"
                    style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.12), transparent)" }}>
                    <HiOutlineScale className="text-5xl text-primary mx-auto mb-4 opacity-80" />
                    <h2 className="text-2xl font-black mb-4">Our mission</h2>
                    <p className="text-gray-300 text-base leading-relaxed max-w-2xl mx-auto">
                        Every Pakistani shopper deserves access to honest, data-driven product comparisons.
                        We exist to level the playing field between informed and uninformed buyers — one AI score at a time.
                    </p>
                </section>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/products" className="btn btn-primary flex items-center gap-2 justify-center">
                        <HiOutlineSearch /> Start Comparing
                    </Link>
                    <Link to="/brands" className="flex items-center gap-2 justify-center text-sm font-bold border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white px-6 py-3 rounded-xl transition-all">
                        <HiOutlineShieldCheck /> View Verified Brands
                    </Link>
                </div>
            </div>
        </>
    );
}