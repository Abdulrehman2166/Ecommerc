import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
    HiOutlineBookOpen, HiOutlineClock, HiOutlineTag,
    HiOutlineArrowRight, HiOutlineSearch, HiOutlineX,
    HiOutlineSparkles, HiOutlineLightningBolt, HiOutlineArrowLeft,
} from "react-icons/hi";

// ─── static article data (replace with API call when backend ready) ───────────
const ARTICLES = [
    {
        slug: "best-phones-under-50k-pkr",
        title: "Best Smartphones Under PKR 50,000 in 2024",
        excerpt: "We tested and AI-scored 14 phones across Daraz, OLX, and brand stores. Here's the definitive ranking with price-to-performance analysis.",
        category: "Mobiles", readTime: 7, date: "2024-11-01",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
        tags: ["phones", "budget", "pakistan"], featured: true,
    },
    {
        slug: "how-we-score-products",
        title: "How Our AI Scores Every Product (Methodology Explained)",
        excerpt: "A transparent breakdown of the five-step process we use to generate Quality, Trust and Overall scores — and why it matters for your purchase.",
        category: "Guide", readTime: 5, date: "2024-10-20",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
        tags: ["ai", "scoring", "transparency"], featured: true,
    },
    {
        slug: "daraz-vs-olx-vs-brand-store",
        title: "Daraz vs OLX vs Brand Store: Where Should You Actually Buy?",
        excerpt: "Platform comparison based on buyer protection, return policies, price competitiveness and authentic product guarantee.",
        category: "Comparison", readTime: 6, date: "2024-10-15",
        image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80",
        tags: ["platforms", "buying-guide"], featured: false,
    },
    {
        slug: "avoid-fake-products-pakistan",
        title: "How to Spot Fake Products in Pakistan's Online Market",
        excerpt: "Our brand trust index flags suspicious listings. Here are the 8 red flags our AI looks for — and how you can spot them manually too.",
        category: "Guide", readTime: 8, date: "2024-10-10",
        image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&q=80",
        tags: ["trust", "safety", "guide"], featured: false,
    },
    {
        slug: "best-laptops-for-students",
        title: "Top 5 Laptops for Pakistani Students Under PKR 100,000",
        excerpt: "Value-focused picks with warranty, repairability and resale value factored into our AI scoring. Updated for 2024.",
        category: "Electronics", readTime: 6, date: "2024-09-28",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
        tags: ["laptops", "students", "budget"], featured: false,
    },
    {
        slug: "price-tracker-guide",
        title: "How to Set Price Alerts and Never Miss a Deal",
        excerpt: "Step-by-step guide to using our Price Tracker to monitor items and get notified when prices drop to your target.",
        category: "Guide", readTime: 3, date: "2024-09-15",
        image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80",
        tags: ["deals", "tracker", "how-to"], featured: false,
    },
];

const CATS = ["All", ...new Set(ARTICLES.map((a) => a.category))];

function ArticleCard({ article, index, featured = false }) {
    return (
        <Link to={`/blog/${article.slug}`}
            className={`glass-card overflow-hidden group hover:border-gray-600 hover:-translate-y-0.5 transition-all flex flex-col ${featured ? "lg:flex-row" : ""}`}
            style={{ animation: "fadeSlideUp 0.4s ease both", animationDelay: `${index * 60}ms` }}>
            <div className={`overflow-hidden bg-gray-900 ${featured ? "lg:w-64 h-48 lg:h-auto flex-shrink-0" : "h-44"}`}>
                <img src={article.image} alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-70 group-hover:opacity-90" />
            </div>
            <div className="p-5 flex flex-col gap-3 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary">
                        {article.category}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-gray-600 font-bold ml-auto">
                        <HiOutlineClock className="text-xs" />{article.readTime} min read
                    </span>
                </div>
                <div>
                    <h3 className={`font-black leading-snug group-hover:text-primary transition-colors ${featured ? "text-lg" : "text-sm"}`}>
                        {article.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed mt-2 line-clamp-2">{article.excerpt}</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-800/60">
                    <span className="text-[10px] text-gray-700 font-bold">
                        {new Date(article.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Read <HiOutlineArrowRight className="text-xs" />
                    </span>
                </div>
            </div>
        </Link>
    );
}

// ─── article detail view ──────────────────────────────────────────────────────
function ArticleDetail({ slug }) {
    const article = ARTICLES.find((a) => a.slug === slug);
    if (!article) return (
        <div className="text-center py-20">
            <h3 className="text-xl font-black mb-4">Article not found</h3>
            <Link to="/blog" className="btn btn-primary">Back to Blog</Link>
        </div>
    );
    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in">
            <Link to="/blog" className="flex items-center gap-2 text-sm text-gray-500 hover:text-white font-bold transition-colors">
                <HiOutlineArrowLeft /> Back to Guides
            </Link>
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary">{article.category}</span>
                    <span className="flex items-center gap-1 text-[10px] text-gray-600 font-bold"><HiOutlineClock className="text-xs" />{article.readTime} min read</span>
                </div>
                <h1 className="text-4xl font-black leading-tight mb-4">{article.title}</h1>
                <p className="text-gray-400 text-base leading-relaxed mb-6">{article.excerpt}</p>
                <img src={article.image} alt={article.title} className="w-full h-64 object-cover rounded-2xl mb-8 opacity-80" />
                <div className="glass-card p-8 text-center text-gray-500 space-y-3">
                    <HiOutlineBookOpen className="text-4xl mx-auto text-gray-700" />
                    <p className="font-bold">Full article content goes here.</p>
                    <p className="text-sm">Connect a CMS or add article body content to your backend at <code className="text-primary">/blog/{article.slug}</code></p>
                </div>
            </div>
        </div>
    );
}

// ─── main ─────────────────────────────────────────────────────────────────────
export default function Blog() {
    const { slug } = useParams();
    const [search, setSearch] = useState("");
    const [cat, setCat] = useState("All");

    const featured = ARTICLES.filter((a) => a.featured);
    const filtered = useMemo(() => {
        let list = ARTICLES;
        if (cat !== "All") list = list.filter((a) => a.category === cat);
        if (search.trim()) list = list.filter((a) =>
            a.title.toLowerCase().includes(search.toLowerCase()) ||
            a.tags.some((t) => t.includes(search.toLowerCase()))
        );
        return list;
    }, [cat, search]);

    if (slug) return <ArticleDetail slug={slug} />;

    return (
        <>
            <style>{`
                @keyframes fadeSlideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
                .animate-in { animation: fadeSlideUp 0.4s ease both; }
            `}</style>

            <div className="animate-in max-w-5xl mx-auto space-y-10">

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <HiOutlineBookOpen className="text-primary" />
                        <span className="text-xs text-primary font-black uppercase tracking-widest">Guides & Insights</span>
                    </div>
                    <h2 className="text-3xl font-black">The CompareHub Blog</h2>
                    <p className="text-gray-500 text-sm mt-1">Buying guides, methodology explainers and Pakistan market insights</p>
                </div>

                {/* Featured */}
                {featured.length > 0 && (
                    <section className="space-y-4">
                        <div className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Featured</div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {featured.map((a, i) => <ArticleCard key={a.slug} article={a} index={i} featured />)}
                        </div>
                    </section>
                )}

                {/* Search + filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-gray-900/60 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-sm placeholder-gray-600 focus:border-primary/50 focus:outline-none"
                            placeholder="Search articles…" />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {CATS.map((c) => (
                            <button key={c} onClick={() => setCat(c)}
                                className={`px-3 py-2.5 rounded-xl border text-xs font-black transition-all ${cat === c ? "bg-primary border-primary text-white" : "border-gray-800 text-gray-400 hover:border-gray-600"}`}>
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* All articles */}
                <div>
                    <div className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-4">
                        All Articles · {filtered.length} posts
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map((a, i) => <ArticleCard key={a.slug} article={a} index={i} />)}
                    </div>
                    {filtered.length === 0 && (
                        <div className="glass-card p-12 text-center text-gray-500">
                            <HiOutlineSearch className="text-4xl mx-auto mb-3 text-gray-700" />
                            <p className="font-bold">No articles match your search</p>
                            <button onClick={() => { setSearch(""); setCat("All"); }} className="text-primary text-sm font-bold mt-2 hover:underline">Clear filters</button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}