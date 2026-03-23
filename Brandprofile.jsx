import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import {
    HiOutlineArrowLeft, HiOutlineShieldCheck, HiOutlineBadgeCheck,
    HiOutlineGlobeAlt, HiOutlineStar, HiOutlineSparkles,
    HiOutlineTrendingUp, HiOutlineExternalLink, HiOutlineScale,
    HiOutlineTag, HiOutlineRefresh,
} from "react-icons/hi";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";

const SCORE_COLOR  = (v) => v >= 80 ? "#10b981" : v >= 60 ? "#f59e0b" : "#ef4444";
const TIER_CONFIG  = {
    Elite:    { cls:"bg-amber-500/15 text-amber-300 border-amber-500/30",    label:"Elite Brand"    },
    Trusted:  { cls:"bg-emerald-500/15 text-emerald-300 border-emerald-500/30",label:"Trusted Brand" },
    Verified: { cls:"bg-blue-500/15 text-blue-300 border-blue-500/30",        label:"Verified"       },
    New:      { cls:"bg-gray-500/15 text-gray-400 border-gray-500/30",        label:"New Brand"      },
};
const getTier = (s) => s >= 90 ? "Elite" : s >= 75 ? "Trusted" : s >= 55 ? "Verified" : "New";

function ScoreRing({ score, label, size = 72 }) {
    const r = (size - 8) / 2, circ = 2 * Math.PI * r, dash = (score / 100) * circ;
    const color = SCORE_COLOR(score);
    return (
        <div className="flex flex-col items-center gap-1.5">
            <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"/>
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                    style={{ transition:"stroke-dasharray 1s ease" }}/>
                <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
                    fill={color} fontSize="13" fontWeight="800"
                    style={{ transform:`rotate(90deg)`, transformOrigin:`${size/2}px ${size/2}px` }}>{score}</text>
            </svg>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider text-center">{label}</div>
        </div>
    );
}

export default function BrandProfile() {
    const { id } = useParams();
    const [brand,    setBrand]    = useState(null);
    const [products, setProducts] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [tab,      setTab]      = useState("products");
    const [visible,  setVisible]  = useState(8);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [bRes, pRes] = await Promise.allSettled([
                    api.get(`/products/brands/${id}`),
                    api.get(`/products?brand=${id}&limit=50&sort=score`),
                ]);
                if (bRes.status === "fulfilled") setBrand(bRes.value.data?.results ?? bRes.value.data);
                if (pRes.status === "fulfilled") {
                    const d = pRes.value.data;
                    setProducts(d?.results ?? d ?? []);
                }
            } catch { /* handled */ }
            finally { setLoading(false); }
        };
        load();
    }, [id]);

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="loader"/></div>;
    if (!brand)  return (
        <div className="text-center py-20">
            <h3 className="text-xl font-black">Brand not found</h3>
            <Link to="/brands" className="btn btn-primary mt-4 inline-flex">Back to Brands</Link>
        </div>
    );

    const rep   = brand.reputationScore ?? 0;
    const tier  = getTier(rep);
    const tierC = TIER_CONFIG[tier];
    const radarData = [
        { metric:"Quality",    value: brand.qualityScore    ?? 0 },
        { metric:"Trust",      value: brand.trustScore      ?? rep },
        { metric:"Service",    value: brand.serviceScore    ?? 0 },
        { metric:"Value",      value: brand.valueScore      ?? 0 },
        { metric:"Reputation", value: rep },
    ];

    return (
        <>
            <style>{`
                @keyframes fadeSlideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
                .animate-in { animation: fadeSlideUp 0.4s ease both; }
            `}</style>
            <div className="animate-in max-w-6xl mx-auto space-y-10">

                <Link to="/brands" className="flex items-center gap-2 text-sm text-gray-500 hover:text-white font-bold transition-colors">
                    <HiOutlineArrowLeft /> All Brands
                </Link>

                {/* Hero */}
                <div className="relative overflow-hidden glass-card p-8 flex flex-col sm:flex-row items-start gap-8">
                    <div className="absolute inset-0 pointer-events-none"
                        style={{ background:`radial-gradient(ellipse 60% 80% at 0% 50%, ${brand.color ?? "#6366f1"}18, transparent)` }}/>

                    {/* Logo */}
                    <div className="w-24 h-24 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center text-3xl font-black flex-shrink-0 relative z-10"
                        style={{ color: brand.color ?? "#6366f1" }}>
                        {brand.logo
                            ? <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain rounded-2xl p-2" />
                            : brand.name?.[0]?.toUpperCase()
                        }
                    </div>

                    <div className="flex-1 min-w-0 relative z-10">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                            <h1 className="text-3xl font-black">{brand.name}</h1>
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${tierC.cls}`}>
                                {tierC.label}
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xl mb-4">
                            {brand.description ?? `${brand.name} is a verified brand in our catalog with an AI-calculated reputation score of ${rep}/100.`}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-bold mb-5">
                            {brand.category && <span className="flex items-center gap-1"><HiOutlineTag className="text-gray-600"/> {brand.category}</span>}
                            {brand.country  && <span className="flex items-center gap-1"><HiOutlineGlobeAlt className="text-gray-600"/> {brand.country}</span>}
                            {products.length > 0 && <span className="flex items-center gap-1"><HiOutlineSparkles className="text-gray-600"/> {products.length} products</span>}
                        </div>
                        {brand.website && (
                            <a href={brand.website} target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-2 text-xs font-bold border border-primary/40 text-primary px-4 py-2 rounded-xl hover:bg-primary/10 transition-all">
                                Visit Official Store <HiOutlineExternalLink />
                            </a>
                        )}
                    </div>

                    {/* Score rings */}
                    <div className="flex gap-6 flex-shrink-0 relative z-10">
                        <ScoreRing score={rep} label="Reputation" size={80} />
                        {brand.qualityScore > 0 && <ScoreRing score={brand.qualityScore} label="Quality" size={80} />}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-gray-800/60 overflow-x-auto">
                    {[["products","Products"],["scores","Scores"],["about","About"]].map(([k,l]) => (
                        <button key={k} onClick={() => setTab(k)}
                            className={`px-5 py-3 text-xs font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all -mb-px ${tab===k ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-300"}`}>
                            {l}
                        </button>
                    ))}
                </div>

                {/* Products tab */}
                {tab === "products" && (
                    <div className="space-y-6 animate-in">
                        <div className="text-sm text-gray-500 font-bold">{products.length} products from {brand.name}</div>
                        {products.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {products.slice(0, visible).map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
                                </div>
                                {visible < products.length && (
                                    <div className="text-center">
                                        <button onClick={() => setVisible((v) => v + 8)} className="btn btn-primary flex items-center gap-2 mx-auto">
                                            Load More ({visible}/{products.length})
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="glass-card p-10 text-center text-gray-500">
                                <HiOutlineTag className="text-4xl mx-auto mb-3 text-gray-700"/>
                                <p className="font-bold">No products listed yet</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Scores tab */}
                {tab === "scores" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in">
                        <div className="space-y-4">
                            {radarData.map(({ metric, value }) => (
                                <div key={metric} className="glass-card p-5 space-y-2">
                                    <div className="flex justify-between text-sm font-black">
                                        <span>{metric}</span>
                                        <span style={{ color: SCORE_COLOR(value) }}>{value}/100</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-1000"
                                            style={{ width:`${value}%`, backgroundColor: SCORE_COLOR(value) }}/>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="glass-card p-6">
                            <h3 className="font-black text-sm mb-4">Score Radar</h3>
                            <ResponsiveContainer width="100%" height={260}>
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.06)"/>
                                    <PolarAngleAxis dataKey="metric" tick={{ fill:"#6b7280", fontSize:11, fontWeight:700 }}/>
                                    <Tooltip contentStyle={{ background:"#111827", border:"1px solid #1f2937", borderRadius:10, fontSize:12 }}/>
                                    <Radar dataKey="value" stroke={brand.color ?? "#6366f1"} fill={brand.color ?? "#6366f1"} fillOpacity={0.15} strokeWidth={2}/>
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* About tab */}
                {tab === "about" && (
                    <div className="glass-card p-8 space-y-6 animate-in max-w-2xl">
                        <h3 className="font-black text-lg">About {brand.name}</h3>
                        <p className="text-gray-400 leading-relaxed">
                            {brand.about ?? brand.description ?? `${brand.name} is listed in our verified brand directory. Our AI scoring system evaluates quality, customer satisfaction, and market reputation continuously.`}
                        </p>
                        {brand.website && (
                            <a href={brand.website} target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                                {brand.website} <HiOutlineExternalLink />
                            </a>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}