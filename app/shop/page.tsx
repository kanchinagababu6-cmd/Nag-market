"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CATEGORIES = [
  "All",
  "Biscuits, Cookies & Rusks",
  "Chocolates & Candies",
  "Staples & Grains",
  "Dairy & Breakfast",
  "Snacks & Packaged Foods",
  "Beverages",
  "Household & Cleaning",
  "Puja Essentials",
];

const FREE_DELIVERY_THRESHOLD = 499;
const DELIVERY_FEE = 40;

interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  subCategory?: string;
  price: number;
  mrp?: number;
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

  // Customer Account Session
  const [customer, setCustomer] = useState<{ name: string; phone: string } | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");

  // Cart & Fulfillment State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderType, setOrderType] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("⚡ Express (30–45 Mins)");
  const [deliveryNotes, setDeliveryNotes] = useState<string[]>([]);
  const [driverTip, setDriverTip] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "UPI">("UPI");
  const [locating, setLocating] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Tracking Modal State
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [trackPhone, setTrackPhone] = useState("");
  const [trackedOrders, setTrackedOrders] = useState<any[]>([]);
  const [loadingTrack, setLoadingTrack] = useState(false);

  // Post-Order Confirmation State
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);

  useEffect(() => {
    // Load customer profile from local storage if available
    const savedProfile = localStorage.getItem("sirilwoods_customer_session");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setCustomer(parsed);
        setCustomerName(parsed.name || "");
        setCustomerPhone(parsed.phone || "");
        setTrackPhone(parsed.phone || "");
      } catch (err) {
        console.error(err);
      }
    }

    // Load Live Products
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch((err) => console.error("Error loading products:", err));
  }, []);

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPhone.match(/^[6-9]\d{9}$/)) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    const profile = {
      name: authName.trim() || "Customer",
      phone: authPhone.trim(),
    };
    localStorage.setItem("sirilwoods_customer_session", JSON.stringify(profile));
    setCustomer(profile);
    setCustomerName(profile.name);
    setCustomerPhone(profile.phone);
    setTrackPhone(profile.phone);
    setIsAuthOpen(false);
  };

  const handleCustomerLogout = () => {
    localStorage.removeItem("sirilwoods_customer_session");
    setCustomer(null);
    setCustomerName("");
    setCustomerPhone("");
  };

  const addToCart = (product: Product) => {
    if (Number(product.stock) <= 0) {
      alert("Sorry, this product is currently out of stock!");
      return;
    }
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        if (exists.cartQty >= Number(product.stock)) {
          alert(`Only ${product.stock} units available in store.`);
          return prev;
        }
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
            if (delta > 0 && next > Number(item.stock)) {
              alert(`Only ${item.stock} units available!`);
              return item;
            }
            return next > 0 ? { ...item, cartQty: next } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Calculations
  const rawTotal = cart.reduce((sum, item) => sum + item.price * item.cartQty, 0);
  const isFreeDelivery = rawTotal >= FREE_DELIVERY_THRESHOLD || orderType === "PICKUP";
  const appliedDeliveryFee = isFreeDelivery ? 0 : DELIVERY_FEE;
  const finalPayable = rawTotal + appliedDeliveryFee + (orderType === "DELIVERY" ? driverTip : 0);

  // GPS Geolocation Auto-Detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          setDeliveryAddress(data.display_name || `Lat: ${latitude}, Lon: ${longitude}`);
        } catch {
          setDeliveryAddress(`GPS Coordinates: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        } finally {
          setLocating(false);
        }
      },
      () => {
        alert("Location access denied. Please type your address manually.");
        setLocating(false);
      }
    );
  };

  const toggleDeliveryNote = (note: string) => {
    setDeliveryNotes((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    );
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      return alert("Please enter your name and phone number");
    }
    if (orderType === "DELIVERY" && !deliveryAddress.trim()) {
      return alert("Please enter delivery address");
    }

    setSubmittingOrder(true);
    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        orderType,
        deliveryAddress:
          orderType === "DELIVERY"
            ? `${deliveryAddress} | Slot: ${deliverySlot} | Notes: ${deliveryNotes.join(", ") || "None"} | Tip: ₹${driverTip}`
            : "Store Counter Pickup",
        paymentMethod: paymentMethod === "UPI" ? "UPI" : "COD",
        totalAmount: finalPayable,
        items: cart.map((i) => ({
          productId: i.id,
          quantity: i.cartQty,
          price: i.price,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (res.ok) {
        setPlacedOrder({
          id: data.orderId || "ORD" + Math.floor(100000 + Math.random() * 900000),
          amount: finalPayable,
          customerName,
          customerPhone,
          method: paymentMethod,
        });
        setCart([]);
        setIsCartOpen(false);
        setIsCheckingOut(false);
      } else {
        alert("Error: " + (data.error || "Order placement failed"));
      }
    } catch (err: any) {
      alert("Network Error: " + err.message);
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackPhone) return;
    setLoadingTrack(true);
    try {
      const res = await fetch(`/api/orders/user?phone=${encodeURIComponent(trackPhone)}`);
      const data = await res.json();
      if (Array.isArray(data)) setTrackedOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTrack(false);
    }
  };

  // Strictly filter products: hide zero & negative stock items completely
  const filteredProducts = products.filter((p) => {
    const stockQty = Number(p.stock);
    const hasStock = !isNaN(stockQty) && stockQty > 0;
    const catMatch =
      activeCategory === "All" ||
      p.category === activeCategory ||
      p.subCategory === activeCategory;
    const searchMatch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(search.toLowerCase());
    return hasStock && catMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-start">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/shop" className="flex items-center gap-2 group">
            <span className="text-base sm:text-lg font-black tracking-wider text-emerald-400 font-mono">
              SIRILWOODS
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 hidden sm:inline">
              Supermarket Express
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTrackOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-1 transition"
            >
              <span>📍</span>
              <span className="hidden sm:inline">Track Orders</span>
            </button>

            {customer ? (
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700">
                <div className="text-right hidden sm:block text-[11px] leading-tight">
                  <p className="font-bold text-white">{customer.name}</p>
                </div>
                <button
                  onClick={handleCustomerLogout}
                  className="text-slate-400 hover:text-rose-400 text-xs px-1"
                  title="Sign out"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition"
              >
                👤 Sign In
              </button>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow"
            >
              <span>🛒 Cart</span>
              <span className="bg-emerald-800 px-1.5 py-0.5 rounded-full text-[10px] font-mono">
                {cart.reduce((s, c) => s + c.cartQty, 0)}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6 w-full space-y-5">
        {/* Delivery Promo Banner */}
        <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-blue-950/60 border border-emerald-500/20 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">
              ⚡ 30–45 Mins Quick Commerce
            </span>
            <h1 className="text-lg sm:text-xl font-extrabold text-white mt-2">
              Order Online • Fresh Groceries, Atta, Dairy & Staples
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Free delivery on all online orders above ₹{FREE_DELIVERY_THRESHOLD}
            </p>
          </div>
          <div className="text-xs font-mono text-emerald-400 bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800">
            Open Daily: 7:00 AM – 10:00 PM
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search groceries, flour, milk, chocolates, biscuits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white outline-none focus:border-emerald-500 transition shadow-inner"
          />
          <span className="absolute left-3.5 top-3 text-slate-500 text-sm">🔍</span>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-3 text-slate-500 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                activeCategory === cat
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              In-Stock Products ({filteredProducts.length})
            </h2>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono text-slate-500 bg-slate-900/50 rounded-3xl border border-slate-800">
              No products found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {filteredProducts.map((p) => {
                const inCart = cart.find((i) => i.id === p.id);
                return (
                  <div
                    key={p.id}
                    className="bg-slate-900 border border-slate-800/90 hover:border-slate-700 p-3 rounded-2xl flex flex-col justify-between transition group shadow-md"
                  >
                    <div>
                      <div className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl mb-2.5 flex items-center justify-center overflow-hidden">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="object-cover w-full h-full group-hover:scale-105 transition"
                          />
                        ) : (
                          <span className="text-3xl">📦</span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 line-clamp-1">
                        {p.subCategory || p.category || "Grocery"}
                      </span>
                      <h3 className="text-xs font-bold text-white line-clamp-2 mt-0.5 leading-snug">
                        {p.name}
                      </h3>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex justify-between items-center">
                      <div>
                        {p.mrp && p.mrp > p.price && (
                          <span className="text-[10px] font-mono text-slate-500 line-through block">
                            ₹{p.mrp}
                          </span>
                        )}
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          ₹{p.price}
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
                          <span className="text-xs font-mono text-white px-1">
                            {inCart.cartQty}
                          </span>
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
              })}
            </div>
          )}
        </div>
      </main>

      {/* Cart & Intelligent Checkout Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/75 z-50 flex justify-end">
          <div className="w-full max-w-md bg-slate-900 h-full p-4 flex flex-col justify-between border-l border-slate-800 overflow-y-auto">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <h3 className="font-bold text-sm">Shopping Cart ({cart.length})</h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Free Delivery Meter */}
              {orderType === "DELIVERY" && (
                <div className="my-3 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                  {rawTotal >= FREE_DELIVERY_THRESHOLD ? (
                    <span className="text-emerald-400 font-bold">🎉 You unlocked FREE Delivery!</span>
                  ) : (
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Add ₹{FREE_DELIVERY_THRESHOLD - rawTotal} for FREE Delivery</span>
                        <span>{Math.round((rawTotal / FREE_DELIVERY_THRESHOLD) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, (rawTotal / FREE_DELIVERY_THRESHOLD) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2 my-2 max-h-52 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6 font-mono">Your basket is empty.</p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-xs py-1.5 border-b border-slate-800/40"
                    >
                      <div>
                        <p className="font-semibold text-white">{item.name}</p>
                        <span className="text-emerald-400 font-mono">₹{item.price}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                        <button
                          onClick={() => updateCartQty(item.id, -1)}
                          className="text-slate-400 hover:text-white"
                        >
                          -
                        </button>
                        <span className="text-xs font-mono">{item.cartQty}</span>
                        <button
                          onClick={() => updateCartQty(item.id, 1)}
                          className="text-slate-400 hover:text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout Form */}
              {isCheckingOut && (
                <div className="space-y-3 pt-2 text-xs border-t border-slate-800">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType("DELIVERY")}
                      className={`p-2 rounded-xl border font-bold ${
                        orderType === "DELIVERY"
                          ? "bg-blue-600 text-white border-blue-500"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                    >
                      🛵 Home Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType("PICKUP")}
                      className={`p-2 rounded-xl border font-bold ${
                        orderType === "PICKUP"
                          ? "bg-blue-600 text-white border-blue-500"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                    >
                      🏬 Store Pickup
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Full Name *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-emerald-500"
                  />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="WhatsApp Mobile Number *"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl font-mono outline-none focus:border-emerald-500"
                  />

                  {orderType === "DELIVERY" && (
                    <>
                      <div className="flex justify-between items-center">
                        <label className="text-slate-400 font-semibold">Delivery Address *</label>
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          disabled={locating}
                          className="text-[11px] text-blue-400 hover:underline"
                        >
                          📍 {locating ? "Locating..." : "Use Current GPS"}
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        required
                        placeholder="Flat / House no, Street name, Landmark"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-emerald-500"
                      />

                      <div>
                        <label className="text-slate-400 block mb-1">Preferred Delivery Slot</label>
                        <select
                          value={deliverySlot}
                          onChange={(e) => setDeliverySlot(e.target.value)}
                          className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl"
                        >
                          <option>⚡ Express (30–45 Mins)</option>
                          <option>🌅 Morning Slot (8:00 AM – 11:00 AM)</option>
                          <option>🌆 Evening Slot (5:00 PM – 8:00 PM)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Rider Instructions</label>
                        <div className="flex flex-wrap gap-1.5">
                          {["Leave at Door", "Don't Ring Bell", "Beware of Dog", "Call on Arrival"].map(
                            (note) => (
                              <button
                                key={note}
                                type="button"
                                onClick={() => toggleDeliveryNote(note)}
                                className={`px-2 py-1 rounded-lg text-[10px] border ${
                                  deliveryNotes.includes(note)
                                    ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/40 font-bold"
                                    : "bg-slate-950 text-slate-400 border-slate-800"
                                }`}
                              >
                                {note}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Driver Tip</label>
                        <div className="flex gap-2">
                          {[0, 10, 20, 30].map((tip) => (
                            <button
                              key={tip}
                              type="button"
                              onClick={() => setDriverTip(tip)}
                              className={`flex-1 py-1 rounded-lg border text-[11px] ${
                                driverTip === tip
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold"
                                  : "bg-slate-950 text-slate-400 border-slate-800"
                              }`}
                            >
                              {tip === 0 ? "No Tip" : `₹${tip}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="text-slate-400 block mb-1">Payment Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("UPI")}
                        className={`p-2 rounded-xl border font-bold ${
                          paymentMethod === "UPI"
                            ? "bg-emerald-600 text-white border-emerald-500"
                            : "bg-slate-950 text-slate-400 border-slate-800"
                        }`}
                      >
                        UPI / Instant QR
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("COD")}
                        className={`p-2 rounded-xl border font-bold ${
                          paymentMethod === "COD"
                            ? "bg-blue-600 text-white border-blue-500"
                            : "bg-slate-950 text-slate-400 border-slate-800"
                        }`}
                      >
                        Cash on Delivery
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bill Summary */}
            <div className="border-t border-slate-800 pt-3 space-y-2 text-xs">
              <div className="space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span>₹{rawTotal.toFixed(2)}</span>
                </div>
                {orderType === "DELIVERY" && (
                  <>
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span>
                        {appliedDeliveryFee === 0 ? (
                          <strong className="text-emerald-400">FREE</strong>
                        ) : (
                          `₹${appliedDeliveryFee}`
                        )}
                      </span>
                    </div>
                    {driverTip > 0 && (
                      <div className="flex justify-between">
                        <span>Driver Tip:</span>
                        <span>₹{driverTip}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between text-white font-bold text-sm pt-1 border-t border-slate-800">
                  <span>Total Payable:</span>
                  <span className="text-emerald-400 font-mono">₹{finalPayable.toFixed(2)}</span>
                </div>
              </div>

              {!isCheckingOut ? (
                <button
                  disabled={cart.length === 0}
                  onClick={() => setIsCheckingOut(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition"
                >
                  Proceed to Checkout →
                </button>
              ) : (
                <button
                  disabled={submittingOrder}
                  onClick={handlePlaceOrder}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition shadow"
                >
                  {submittingOrder ? "Confirming..." : `Confirm Order (₹${finalPayable.toFixed(2)})`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Quick-Login Modal */}
      {isAuthOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Customer Sign In</h3>
              <button onClick={() => setIsAuthOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCustomerLogin} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">10-Digit Mobile Number</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={authPhone}
                  onChange={(e) => setAuthPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow"
              >
                Sign In & Remember
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Track Orders Modal */}
      {isTrackOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">📍 Track Orders</h3>
              <button onClick={() => setIsTrackOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleTrackSearch} className="flex gap-2">
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={trackPhone}
                onChange={(e) => setTrackPhone(e.target.value.replace(/\D/g, ""))}
                className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono outline-none"
              />
              <button
                type="submit"
                disabled={loadingTrack}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
              >
                {loadingTrack ? "..." : "Track"}
              </button>
            </form>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {trackedOrders.length === 0 ? (
                <p className="text-center text-slate-500 text-xs py-4 font-mono">
                  No active orders found for this number.
                </p>
              ) : (
                trackedOrders.map((o) => (
                  <div key={o.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-blue-400 font-bold">#{o.id.slice(0, 8).toUpperCase()}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                        {o.status}
                      </span>
                    </div>
                    <div className="flex justify-between font-mono text-slate-400 text-[11px]">
                      <span>₹{Number(o.totalAmount).toFixed(2)}</span>
                      <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post-Order Success & Dynamic UPI QR Modal */}
      {placedOrder && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <span className="text-4xl">🎉</span>
            <h3 className="text-lg font-bold text-white">Order Received!</h3>
            <p className="text-xs text-slate-400 font-mono">Order ID: #{placedOrder.id.slice(0, 8).toUpperCase()}</p>

            {placedOrder.method === "UPI" && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <p className="text-xs text-slate-300 font-semibold">Scan with GPay / PhonePe / Paytm</p>
                <div className="w-40 h-40 mx-auto bg-white p-2 rounded-xl flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                      `upi://pay?pa=sirilwoods@upi&pn=Sirilwoods&am=${placedOrder.amount}&cu=INR`
                    )}`}
                    alt="UPI Dynamic QR"
                    className="w-full h-full"
                  />
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold block">
                  Amount: ₹{placedOrder.amount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <a
                href={`https://wa.me/91${placedOrder.customerPhone}?text=${encodeURIComponent(
                  `*Sirilwoods Supermarket Receipt*\nOrder ID: #${placedOrder.id.slice(0, 8)}\nTotal: ₹${placedOrder.amount}\nStatus: Confirmed\nThank you for shopping with us!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition shadow"
              >
                <span>💬 Get WhatsApp Bill</span>
              </a>

              <button
                onClick={() => setPlacedOrder(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
