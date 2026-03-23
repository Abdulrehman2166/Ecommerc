import React, { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
    HiOutlineUser,
    HiOutlineMail,
    HiOutlineBadgeCheck,
    HiOutlineCog,
    HiOutlineLockClosed,
    HiOutlineBell,
    HiOutlineShieldCheck,
    HiOutlineLogout,
    HiOutlineCamera,
    HiOutlineEye,
    HiOutlineEyeOff,
    HiOutlineRefresh,
    HiOutlineCheckCircle,
    HiOutlineClipboardList,
    HiOutlineHeart,
    HiOutlineScale,
    HiOutlineSparkles,
    HiOutlineExclamation,
    HiOutlineX,
    HiOutlineArrowRight,
    HiOutlinePencil,
} from "react-icons/hi";

// ─── helpers ──────────────────────────────────────────────────────────────────
const TABS = [
    { key: "account", label: "Account", icon: <HiOutlineUser /> },
    { key: "security", label: "Security", icon: <HiOutlineLockClosed /> },
    { key: "notifs", label: "Notifications", icon: <HiOutlineBell /> },
    { key: "danger", label: "Danger Zone", icon: <HiOutlineExclamation />, danger: true },
];

function Field({ label, id, children, hint }) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{label}</label>
            {children}
            {hint && <p className="text-[11px] text-gray-700">{hint}</p>}
        </div>
    );
}

function Input({ id, type = "text", value, onChange, disabled, placeholder, rightEl }) {
    return (
        <div className={`flex items-center gap-3 bg-gray-950 border rounded-xl px-4 py-3 transition-all ${disabled ? "opacity-50 cursor-not-allowed border-gray-800" : "border-gray-800 hover:border-gray-700 focus-within:border-primary/50"
            }`}>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-700 focus:outline-none disabled:cursor-not-allowed"
            />
            {rightEl}
        </div>
    );
}

// ─── avatar component ─────────────────────────────────────────────────────────
function Avatar({ user, onUpload }) {
    const fileRef = useRef();
    const initials = (user?.name ?? "U").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => onUpload(reader.result);
        reader.readAsDataURL(file);
    };

    return (
        <div className="relative group w-24 h-24 mx-auto">
            {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover border-2 border-primary/30" />
            ) : (
                <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary text-2xl font-black">
                    {initials}
                </div>
            )}
            <button
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <HiOutlineCamera className="text-white text-xl" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
    );
}

// ─── stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, to, color }) {
    const Tag = to ? Link : "div";
    return (
        <Tag to={to} className={`glass-card p-4 flex flex-col items-center gap-2 text-center transition-all ${to ? "hover:border-gray-600 hover:-translate-y-0.5 cursor-pointer" : ""}`}>
            <div className={`text-xl ${color}`}>{icon}</div>
            <div className="text-xl font-black">{value ?? "—"}</div>
            <div className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{label}</div>
        </Tag>
    );
}

// ─── toggle ───────────────────────────────────────────────────────────────────
function Toggle({ value, onChange, label, desc }) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-gray-800/60 last:border-0">
            <div>
                <div className="text-sm font-bold">{label}</div>
                {desc && <div className="text-xs text-gray-600 mt-0.5">{desc}</div>}
            </div>
            <button
                onClick={() => onChange(!value)}
                className={`relative w-10 h-6 rounded-full transition-all duration-200 flex-shrink-0 ${value ? "bg-primary" : "bg-gray-800"}`}
            >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${value ? "left-5" : "left-1"}`} />
            </button>
        </div>
    );
}

// ─── main ─────────────────────────────────────────────────────────────────────
const Profile = () => {
    const { user, logout, setUser } = useContext(AuthContext);

    const [tab, setTab] = useState("account");
    const [saving, setSaving] = useState(false);
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

    // account form
    const [name, setName] = useState(user?.name ?? "");
    const [phone, setPhone] = useState(user?.phone ?? "");
    const [location, setLocation] = useState(user?.location ?? "");

    // password form
    const [curPwd, setCurPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [pwdErrors, setPwdErrors] = useState({});

    // notifications
    const [notifs, setNotifs] = useState({
        dealAlerts: user?.notifs?.dealAlerts ?? true,
        weeklyDigest: user?.notifs?.weeklyDigest ?? true,
        orderUpdates: user?.notifs?.orderUpdates ?? true,
        priceDrops: user?.notifs?.priceDrops ?? false,
        newArrivals: user?.notifs?.newArrivals ?? false,
    });

    // stats
    const [stats, setStats] = useState(null);
    useEffect(() => {
        api.get("/auth/profile-stats").then((r) => setStats(r.data)).catch(() => { });
    }, []);

    // delete account
    const [deleteConfirm, setDeleteConfirm] = useState("");

    // ── guard ─────────────────────────────────────────────────────────────────
    if (!user) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
            <HiOutlineUser className="text-5xl text-gray-600" />
            <h3 className="text-xl font-black">Please sign in to view your profile</h3>
            <Link to="/login" className="btn btn-primary flex items-center gap-2">
                Sign In <HiOutlineArrowRight />
            </Link>
        </div>
    );

    // ── save profile ──────────────────────────────────────────────────────────
    const saveProfile = async (e) => {
        e.preventDefault();
        if (!name.trim()) return toast.error("Name is required");
        setSaving(true);
        try {
            const res = await api.put("/auth/profile", { name, phone, location });
            if (setUser) setUser({ ...user, ...res.data });
            toast.success("Profile updated ✓");
        } catch (err) {
            toast.error(err.response?.data?.message ?? "Update failed");
        } finally { setSaving(false); }
    };

    // ── avatar upload ─────────────────────────────────────────────────────────
    const handleAvatarUpload = async (dataUrl) => {
        try {
            const res = await api.put("/auth/avatar", { avatar: dataUrl });
            if (setUser) setUser({ ...user, avatar: res.data?.avatar ?? dataUrl });
            toast.success("Avatar updated ✓");
        } catch { toast.error("Avatar upload failed"); }
    };

    // ── password change ───────────────────────────────────────────────────────
    const savePassword = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!curPwd) errs.current = "Required";
        if (newPwd.length < 8) errs.new = "At least 8 characters";
        if (newPwd !== confirmPwd) errs.confirm = "Passwords don't match";
        setPwdErrors(errs);
        if (Object.keys(errs).length) return;

        setSaving(true);
        try {
            await api.put("/auth/password", { currentPassword: curPwd, newPassword: newPwd });
            toast.success("Password updated ✓");
            setCurPwd(""); setNewPwd(""); setConfirmPwd("");
        } catch (err) {
            toast.error(err.response?.data?.message ?? "Password update failed");
        } finally { setSaving(false); }
    };

    // ── notif save ────────────────────────────────────────────────────────────
    const saveNotifs = async () => {
        setSaving(true);
        try {
            await api.put("/auth/notifications", notifs);
            toast.success("Notification preferences saved ✓");
        } catch { toast.error("Failed to save preferences"); }
        finally { setSaving(false); }
    };

    // ── delete account ────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (deleteConfirm !== "DELETE") return toast.error('Type DELETE to confirm');
        try {
            await api.delete("/auth/account");
            logout();
            toast.success("Account deleted");
        } catch { toast.error("Deletion failed"); }
    };

    const pwdField = (key, label, val, setVal) => (
        <Field label={label} id={`pwd-${key}`}>
            <Input
                id={`pwd-${key}`}
                type={showPass[key] ? "text" : "password"}
                value={val}
                onChange={(e) => setVal(e.target.value)}
                placeholder="••••••••"
                rightEl={
                    <button type="button" onClick={() => setShowPass((p) => ({ ...p, [key]: !p[key] }))}
                        className="text-gray-600 hover:text-gray-300 transition-colors flex-shrink-0">
                        {showPass[key] ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                    </button>
                }
            />
            {pwdErrors[key] && <p className="text-[11px] text-rose-400 font-bold mt-1">{pwdErrors[key]}</p>}
        </Field>
    );

    // ─── render ───────────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity:0; transform:translateY(12px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                .animate-in { animation: fadeSlideUp 0.4s ease both; }
            `}</style>

            <div className="animate-in max-w-4xl mx-auto space-y-8">

                {/* ── Profile hero card ─────────────────────────────────── */}
                <div className="glass-card p-8 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none"
                        style={{ background: "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(99,102,241,0.08), transparent)" }} />

                    <Avatar user={user} onUpload={handleAvatarUpload} />

                    <div className="text-center sm:text-left flex-1 min-w-0">
                        <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap mb-1">
                            <h2 className="text-2xl font-black">{user.name}</h2>
                            {user.isAdmin && (
                                <span className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-full">
                                    <HiOutlineBadgeCheck /> Admin
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 justify-center sm:justify-start">
                            <HiOutlineMail className="text-gray-600" /> {user.email}
                        </div>
                        {user.location && (
                            <div className="text-xs text-gray-600 mt-1">{user.location}</div>
                        )}
                        <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
                            <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                                <HiOutlineShieldCheck /> Verified Account
                            </span>
                            <span className="text-[10px] text-gray-700 font-bold">
                                Member since {new Date(user.createdAt ?? Date.now()).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-xs font-bold text-gray-500 border border-gray-700 hover:border-rose-500/50 hover:text-rose-400 px-4 py-2.5 rounded-xl transition-all flex-shrink-0"
                    >
                        <HiOutlineLogout /> Sign Out
                    </button>
                </div>

                {/* ── Stats row ─────────────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard icon={<HiOutlineClipboardList />} value={stats?.orders ?? 0} label="Orders" to="/orders" color="text-primary" />
                    <StatCard icon={<HiOutlineHeart />} value={stats?.wishlist ?? 0} label="Wishlisted" to="/wishlist" color="text-rose-400" />
                    <StatCard icon={<HiOutlineScale />} value={stats?.compares ?? 0} label="Compared" to="/comparison" color="text-violet-400" />
                    <StatCard icon={<HiOutlineSparkles />} value={stats?.reviews ?? 0} label="Reviews" color="text-amber-400" />
                </div>

                {/* ── Tabs + content ─────────────────────────────────────── */}
                <div className="glass-card overflow-hidden">
                    {/* Tab bar */}
                    <div className="flex border-b border-gray-800/60 overflow-x-auto">
                        {TABS.map((t) => (
                            <button key={t.key} onClick={() => setTab(t.key)}
                                className={`flex items-center gap-2 px-5 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all -mb-px ${tab === t.key
                                        ? t.danger ? "border-rose-500 text-rose-400" : "border-primary text-primary"
                                        : t.danger ? "border-transparent text-gray-700 hover:text-rose-400" : "border-transparent text-gray-500 hover:text-gray-300"
                                    }`}
                            >
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6 sm:p-8">

                        {/* ── Account tab ───────────────────────────────── */}
                        {tab === "account" && (
                            <form onSubmit={saveProfile} className="space-y-6 animate-in">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                                        <HiOutlinePencil />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm">Account Settings</h4>
                                        <p className="text-[11px] text-gray-500">Update your personal information</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <Field label="Full Name" id="profile-name">
                                        <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                                    </Field>
                                    <Field label="Email Address" id="profile-email" hint="Email cannot be changed">
                                        <Input id="profile-email" value={user.email} disabled />
                                    </Field>
                                    <Field label="Phone Number" id="profile-phone">
                                        <Input id="profile-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 0000000" />
                                    </Field>
                                    <Field label="Location / City" id="profile-location">
                                        <Input id="profile-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Karachi, PK" />
                                    </Field>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <button type="submit" disabled={saving}
                                        className="btn btn-primary flex items-center gap-2 disabled:opacity-50">
                                        {saving
                                            ? <><HiOutlineRefresh className="animate-spin" /> Saving…</>
                                            : <><HiOutlineCheckCircle /> Save Changes</>
                                        }
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ── Security tab ──────────────────────────────── */}
                        {tab === "security" && (
                            <form onSubmit={savePassword} className="space-y-5 animate-in">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                                        <HiOutlineLockClosed />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm">Change Password</h4>
                                        <p className="text-[11px] text-gray-500">Use a strong password of at least 8 characters</p>
                                    </div>
                                </div>

                                {pwdField("current", "Current Password", curPwd, setCurPwd)}
                                {pwdField("new", "New Password", newPwd, setNewPwd)}
                                {pwdField("confirm", "Confirm Password", confirmPwd, setConfirmPwd)}

                                {/* Password strength */}
                                {newPwd.length > 0 && (
                                    <div className="space-y-1">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map((i) => {
                                                const strength = [newPwd.length >= 8, /[A-Z]/.test(newPwd), /[0-9]/.test(newPwd), /[^a-zA-Z0-9]/.test(newPwd)];
                                                const filled = strength.filter(Boolean).length;
                                                return (
                                                    <div key={i} className="flex-1 h-1 rounded-full transition-all"
                                                        style={{ backgroundColor: i <= filled ? ["#ef4444", "#f59e0b", "#f59e0b", "#10b981"][filled - 1] : "#1f2937" }} />
                                                );
                                            })}
                                        </div>
                                        <p className="text-[10px] text-gray-600 font-bold">
                                            {["Weak", "Fair", "Good", "Strong"][[newPwd.length >= 8, /[A-Z]/.test(newPwd), /[0-9]/.test(newPwd), /[^a-zA-Z0-9]/.test(newPwd)].filter(Boolean).length - 1] || ""}
                                        </p>
                                    </div>
                                )}

                                <button type="submit" disabled={saving}
                                    className="btn btn-primary flex items-center gap-2 disabled:opacity-50">
                                    {saving
                                        ? <><HiOutlineRefresh className="animate-spin" /> Updating…</>
                                        : <><HiOutlineLockClosed /> Update Password</>
                                    }
                                </button>
                            </form>
                        )}

                        {/* ── Notifications tab ──────────────────────────── */}
                        {tab === "notifs" && (
                            <div className="space-y-2 animate-in">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                                        <HiOutlineBell />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm">Notification Preferences</h4>
                                        <p className="text-[11px] text-gray-500">Choose what emails you receive</p>
                                    </div>
                                </div>

                                <Toggle value={notifs.orderUpdates} onChange={(v) => setNotifs((p) => ({ ...p, orderUpdates: v }))}
                                    label="Order Updates" desc="Shipping confirmations and delivery notifications" />
                                <Toggle value={notifs.priceDrops} onChange={(v) => setNotifs((p) => ({ ...p, priceDrops: v }))}
                                    label="Price Drop Alerts" desc="Get notified when wishlisted items drop in price" />
                                <Toggle value={notifs.dealAlerts} onChange={(v) => setNotifs((p) => ({ ...p, dealAlerts: v }))}
                                    label="Best Deal Alerts" desc="Weekly curated deals based on your preferences" />
                                <Toggle value={notifs.weeklyDigest} onChange={(v) => setNotifs((p) => ({ ...p, weeklyDigest: v }))}
                                    label="Weekly Digest" desc="Summary of top-scored products every Monday" />
                                <Toggle value={notifs.newArrivals} onChange={(v) => setNotifs((p) => ({ ...p, newArrivals: v }))}
                                    label="New Arrivals" desc="Be the first to know about new products" />

                                <div className="pt-4">
                                    <button onClick={saveNotifs} disabled={saving}
                                        className="btn btn-primary flex items-center gap-2 disabled:opacity-50">
                                        {saving
                                            ? <><HiOutlineRefresh className="animate-spin" /> Saving…</>
                                            : <><HiOutlineCheckCircle /> Save Preferences</>
                                        }
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── Danger zone tab ───────────────────────────── */}
                        {tab === "danger" && (
                            <div className="space-y-6 animate-in">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                                        <HiOutlineExclamation />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm text-rose-400">Danger Zone</h4>
                                        <p className="text-[11px] text-gray-500">Irreversible actions — proceed with caution</p>
                                    </div>
                                </div>

                                {/* Logout all devices */}
                                <div className="glass-card p-5 border-gray-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <div className="font-bold text-sm mb-0.5">Sign out of all devices</div>
                                        <div className="text-xs text-gray-500">Revokes all active sessions including this one</div>
                                    </div>
                                    <button onClick={logout}
                                        className="text-xs font-black px-4 py-2.5 rounded-xl border border-gray-600 text-gray-400 hover:border-rose-500/50 hover:text-rose-400 transition-all flex-shrink-0">
                                        Sign Out All
                                    </button>
                                </div>

                                {/* Delete account */}
                                <div className="glass-card p-5 border-rose-500/20 bg-rose-500/5 flex flex-col gap-4">
                                    <div>
                                        <div className="font-bold text-sm text-rose-400 mb-0.5">Delete Account</div>
                                        <div className="text-xs text-gray-500 leading-relaxed">
                                            Permanently deletes your account, orders, wishlists, and reviews. This cannot be undone.
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                                            Type <span className="text-rose-400">DELETE</span> to confirm
                                        </label>
                                        <input
                                            value={deleteConfirm}
                                            onChange={(e) => setDeleteConfirm(e.target.value)}
                                            placeholder="DELETE"
                                            className="w-full bg-gray-950 border border-rose-500/30 rounded-xl px-4 py-3 text-sm text-rose-300 placeholder-gray-700 focus:outline-none focus:border-rose-500/60 transition-colors"
                                        />
                                    </div>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleteConfirm !== "DELETE"}
                                        className="flex items-center gap-2 text-sm font-black px-5 py-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed self-start"
                                    >
                                        <HiOutlineX /> Permanently Delete Account
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Quick links ───────────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                        { to: "/orders", icon: <HiOutlineClipboardList />, label: "My Orders", color: "text-primary" },
                        { to: "/wishlist", icon: <HiOutlineHeart />, label: "Wishlist", color: "text-rose-400" },
                        { to: "/comparison", icon: <HiOutlineScale />, label: "Compare", color: "text-violet-400" },
                    ].map(({ to, icon, label, color }) => (
                        <Link key={to} to={to}
                            className="glass-card p-4 flex items-center gap-3 hover:border-gray-600 hover:-translate-y-0.5 transition-all group">
                            <span className={`text-xl ${color}`}>{icon}</span>
                            <span className="text-sm font-bold">{label}</span>
                            <HiOutlineArrowRight className="ml-auto text-gray-700 group-hover:text-gray-400 transition-colors" />
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Profile;