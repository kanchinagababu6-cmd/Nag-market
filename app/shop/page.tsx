"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CATEGORIES: Record<string, string[]> = {
  "Staples & Grains": ["Atta, Flours & Sooji", "Rice & Rice Products", "Dals & Pulses", "Edible Oils & Ghee", "Sugar, Jaggery & Salt", "Whole & Ground Spices"],
  "Dairy & Breakfast": ["Fresh Milk & Curd", "Paneer, Butter & Cheese", "Bread, Pav & Bakery", "Eggs", "Cereals, Oats & Muesli", "Tea, Coffee & Health Drinks"],
  "Snacks & Packaged Foods": ["Biscuits, Cookies & Rusks", "Namkeen, Chips & Savory Snacks", "Noodles, Pasta & Vermicelli", "Chocolates & Candies", "Sauces, Ketchup, Spreads & Jams", "Instant Ready-to-Eat Mixes"],
  "Beverages": ["Soft Drinks & Carbonated Sodas", "Fruit Juices & Concentrates", "Packaged Bottled Water & Soda", "Energy & Sports Drinks"],
  "Fresh Produce": ["Daily Fresh Vegetables", "Seasonal & Exotic Fruits", "Herbs, Lemon, Ginger & Garlic"],
  "Personal Care & Hygiene": ["Bath Soaps, Body Wash & Handwash", "Hair Care", "Dental Care", "Skincare, Lotions & Powders", "Feminine Hygiene & Baby Care"],
  "Household & Cleaning": ["Detergents & Fabric Softeners", "Dishwashing Bars & Liquids", "Surface Cleaners & Disinfectants", "Mosquito Repellents & Freshers", "Kitchen Rolls, Foil & Garbage Bags"],
  "Puja & Pooja Essentials": ["Agarbatti, Dhoop & Camphor", "Puja Oil & Cotton Wicks"],
};

interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  subCategory: string;
  price: number;
  mrp?: number;
  discount?: number;
  stock: number;
  imageUrl?: string;
}

interface CartItem extends Product {
  cartQty: number;
}

export default function CustomerStorefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubCategory, setActiveSubCategory] = useState("All");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Checkout form
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Order Tracking modal
  const [trackPhone, setTrackPhone] = useState("");
  const [trackingOrders, setTrackingOrders] = useState<any[]>([]);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [fetchingTrack, setFetchingTrack] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch((err) => console.error("Error loading products:", err));
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, cartQty: item.cartQty + 1 } : item
        );
      }
      return [...prev, { ...product, cartQty: 1 }];
    });
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const next = item.cartQty + delta;
            return next > 0 ? { ...item, cartQty: next } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.cartQty, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return alert("Please enter your name and phone number");
    if (!cart.length) return alert("Your cart is empty");

    setSubmittingOrder(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          deliveryAddress,
          paymentMethod,
          totalAmount,
          items: cart.map((i) => ({
            productId: i.id,
            quantity: i.cartQty,
            price: i.price,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("🎉 Order placed successfully! The store has received your order.");
        setCart([]);
        setIsCartOpen(false);
        setIsCheckingOut(false);
      } else {
        alert("Error: " + (data.error || "Could not place order"));
      }
    } catch (err: any) {
      alert("Network Error: " + err.message);
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleTrackOrders = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackPhone) return;
    setFetchingTrack(true);
    try {
      const res = await fetch(`/api/orders/user?phone=${encodeURIComponent(trackPhone)}`);
      const data = await res.json();
      if (Array.isArray(data)) setTrackingOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingTrack(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSub = activeSubCategory === "All" || p.subCategory === activeSubCategory;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSub && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <div>
        {/* Customer Top Header: Brand on left, ONLY Track on right */}
        <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-2.5">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-sm sm:text-base font-black tracking-wider text-emerald-400 font-mono group-hover:text-emerald-300 transition">
                NAG SUPERMARKET
              </span>
              <span className="hidden sm:inline text-xs text-slate-500">• Express Storefront</span>
            </Link>

            <button
              onClick={() => setIsTrackOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <span>📍</span>
              <span>Track Orders</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Cart */}
        <div className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search fresh groceries, atta, snacks, dairy, oils..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white outline-none focus:border-blue-500"
              />
              <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition shadow"
            >
              <span>🛒 Cart</span>
              <span className="px-1.5 py-0.5 bg-emerald-800 rounded-full text-[10px] font-mono">
                {cart.reduce((s, it) => s + it.cartQty, 0)}
              </span>
            </button>
          </div>
        </div>

        {/* Storefront Products */}
        <main className="max-w-6xl mx-auto p-4 space-y-4">
          <div className="bg-gradient-to-r from-blue-900/40 via-emerald-900/30 to-slate-900 border border-blue-500/20 rounded-3xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-lg">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Fresh Stock Daily
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-white mt-1">
                Order Online • Quick Store Pickup & Doorstep Delivery
              </h2>
              <p className="text-xs text-slate-400">Guaranteed quality on groceries, staples, dairy & essentials.</p>
            </div>
            <button
              onClick={() => { setActiveCategory("All"); setActiveSubCategory("All"); }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow whitespace-nowrap"
            >
              Shop All Deals →
            </button>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => { setActiveCategory("All"); setActiveSubCategory("All"); }}
              className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
                activeCategory === "All"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              All Categories
            </button>
            {Object.keys(CATEGORIES).map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setActiveSubCategory("All"); }}
                className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white shadow"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sub-Category Filter */}
          {activeCategory !== "All" && CATEGORIES[activeCategory] && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <button
                onClick={() => setActiveSubCategory("All")}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                  activeSubCategory === "All"
                    ? "bg-slate-800 text-emerald-400 border border-emerald-500/30 font-semibold"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                All {activeCategory}
              </button>
              {CATEGORIES[activeCategory].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSubCategory(sub)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                    activeSubCategory === sub
                      ? "bg-slate-800 text-emerald-400 border border-emerald-500/30 font-semibold"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full p-12 text-center text-slate-500 text-xs font-mono bg-slate-900/50 rounded-3xl border border-slate-800">
                No items found in this section.
              </div>
            ) : (
              filteredProducts.map((p) => {
                const inCart = cart.find((i) => i.id === p.id);
                return (
                  <div
                    key={p.id}
                    className="bg-slate-900 border border-slate-800/90 rounded-2xl p-3 flex flex-col justify-between hover:border-slate-700 transition group shadow"
                  >
                    <div>
                      <div className="w-full h-32 rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center mb-2.5">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        ) : (
                          <span className="text-3xl">📦</span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-blue-400 line-clamp-1">
                        {p.subCategory || p.category}
                      </span>
                      <h3 className="text-xs font-bold text-white line-clamp-2 mt-0.5 leading-snug">
                        {p.name}
                      </h3>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex justify-between items-center">
                      <div>
                        {p.mrp && p.mrp > p.price && (
                          <span className="text-[10px] font-mono text-slate-500 line-through block">
                            ₹{p.mrp.toFixed(2)}
                          </span>
                        )}
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          ₹{p.price.toFixed(2)}
                        </span>
                      </div>

                      {inCart ? (
                        <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                          <button
                            onClick={() => updateCartQty(p.id, -1)}
                            className="text-slate-400 hover:text-white font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="text-xs font-mono text-white px-1">{inCart.cartQty}</span>
                          <button
                            onClick={() => updateCartQty(p.id, 1)}
                            className="text-slate-400 hover:text-white font-bold text-xs"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(p)}
                          className="px-3 py-1 bg-slate-800 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col p-4 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🛒 Shopping Cart</span>
                <span className="text-xs text-slate-400">({cart.length} items)</span>
              </h2>
              <button
                onClick={() => { setIsCartOpen(false); setIsCheckingOut(false); }}
                className="text-slate-400 hover:text-white text-sm px-2"
              >
                ✕
              </button>
            </div>

            {!isCheckingOut ? (
              <>
                <div className="flex-1 overflow-y-auto space-y-2.5 divide-y divide-slate-800/60">
                  {cart.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs font-mono">
                      Your shopping bag is empty.
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="pt-2 flex justify-between items-center text-xs">
                        <div className="pr-2">
                          <h4 className="font-semibold text-white line-clamp-1">{item.name}</h4>
                          <span className="text-emerald-400 font-mono font-bold">
                            ₹{item.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
                          <button onClick={() => updateCartQty(item.id, -1)} className="text-slate-400 hover:text-white px-1">-</button>
                          <span className="font-mono text-white text-xs">{item.cartQty}</span>
                          <button onClick={() => updateCartQty(item.id, 1)} className="text-slate-400 hover:text-white px-1">+</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-slate-800 pt-3 space-y-2">
                  <div className="flex justify-between items-center font-mono text-xs">
                    <span className="text-slate-400">Total Bill Amount:</span>
                    <span className="text-emerald-400 font-bold text-base">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <button
                    disabled={cart.length === 0}
                    onClick={() => setIsCheckingOut(true)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow"
                  >
                    Proceed to Checkout →
                  </button>
                </div>               
              </>
            ) : (
              <form onSubmit={handlePlaceOrder} className="flex-1 flex flex-col justify-between space-y-3 text-xs">
                <div className="space-y-3 overflow-y-auto pr-1">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Babu"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">WhatsApp / Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Delivery Address</label>
                    <textarea
                      rows={2}
                      placeholder="Door No, Street name, Landmark"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                    >
                      <option value="Cash on Delivery">Cash on Delivery</option>
                      <option value="UPI / QR on Delivery">UPI / QR on Delivery</option>
                      <option value="Store Pickup">Store Pickup</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 space-y-2">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Total Payable:</span>
                    <span className="text-emerald-400 font-bold text-sm">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCheckingOut(false)}
                      className="w-1/3 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={submittingOrder}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl shadow"
                    >
                      {submittingOrder ? "Confirming..." : "Confirm & Place Order"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Track Modal */}
      {isTrackOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">📍 Track My Grocery Orders</h3>
              <button onClick={() => setIsTrackOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleTrackOrders} className="flex gap-2">
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={trackPhone}
                onChange={(e) => setTrackPhone(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono outline-none"
              />
              <button
                type="submit"
                disabled={fetchingTrack}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
              >
                {fetchingTrack ? "Searching..." : "Track"}
              </button>
            </form>

            <div className="max-h-60 overflow-y-auto space-y-2.5">
              {trackingOrders.length === 0 ? (
                <p className="text-center text-slate-500 text-xs py-4 font-mono">
                  Enter your number above to view recent orders.
                </p>
              ) : (
                trackingOrders.map((o) => (
                  <div key={o.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-blue-400 font-bold">#{o.id.slice(0, 8).toUpperCase()}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                        {o.status}
                      </span>
                    </div>
                    <div className="flex justify-between font-mono text-slate-400 text-[11px] pt-1">
                      <span>Total: ₹{o.totalAmount.toFixed(2)}</span>
                      <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
