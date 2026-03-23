import React, { useState, useEffect, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import { HiOutlineHeart, HiOutlineTrash } from "react-icons/hi";

const Wishlist = () => {
    const { user } = useContext(AuthContext);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlist = async () => {
            if (!user) return;
            try {
                const res = await api.get("/auth/wishlist");
                setWishlist(res.wishlist || []);
            } catch (err) {
                console.error("Wishlist load error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWishlist();
    }, [user]);

    const removeFromWishlist = async (productId) => {
        try {
            await api.post("/auth/wishlist/remove", { productId });
            setWishlist(prev => prev.filter(p => p._id !== productId));
        } catch (err) {
            console.error("Remove from wishlist error:", err);
        }
    };

    if (loading) return <div className="loader-container"><div className="loader"></div></div>;

    if (wishlist.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon"><HiOutlineHeart /></div>
                <h3>Your Wishlist is Empty</h3>
                <p>Save products you love to your wishlist for later.</p>
            </div>
        );
    }

    return (
        <div className="animate-in">
            <div className="section-header">
                <h2>Your Wishlist</h2>
                <p>A curated collection of your favorites.</p>
            </div>

            <div className="products-grid mt-12">
                {wishlist.map((p, i) => (
                    <div key={p._id} className="relative group">
                        <ProductCard product={p} index={i} />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                removeFromWishlist(p._id);
                            }}
                            className="absolute top-4 right-4 z-10 p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-all border border-red-500/30 opacity-0 group-hover:opacity-100"
                        >
                            <HiOutlineTrash />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wishlist;
