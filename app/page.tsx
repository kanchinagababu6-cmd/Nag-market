"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

export default function StoreHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Customer Checkout Details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

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
            const newQty = item.cartQty + delta;
            return newQty > 0 ? { ...item, cartQty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.cartQty, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert("Please provide your name and phone number");
      return;
    }
    if (!cart.length) return alert("Cart is empty");

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
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.cartQty,
            price: item.price,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("🎉 Order placed successfully! The store is preparing your items.");
        setCart([]);
        setIsCartOpen(false);
        setIsCheckingOut(false);
        setCustomerName("");
        setCustomerPhone("");
        setDeliveryAddress("");
      } else {
        alert("Failed to place order: " + (data.error || "Server issue"));
      }
    } catch (err: any) {
      alert("Network error: " + err.message);
    } finally {
      setSubmittingOrder(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesDept = selectedDept === "All" || p.category === selectedDept;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.toLowerCase().includes(search.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top Header & Admin Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">Nag Supermarket</span>
            <h1 className="text-lg font-bold text-white leading-tight">Grocery Store & Operations</h1>
          </div>

          {/* Quick Staff Navigation Links */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/orders"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold transition shadow"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>🛍️ Live Orders</span>
            </Link>
            <Link
              href="/admin/pos"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
            >
              🖥️ POS Counter
            </Link>
            <Link
              href="/admin/products"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
            >
              📦 Products
            </Link>
            <Link
              href="/admin/analytics"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
            >
              📊 Analytics
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow"
            >
              <span>🛒 Cart</span>
              <span className="px-1.5 py-0.2 bg-emerald-800 rounded-full text-[10px]">
                {cart.reduce((sum, it) => sum + it.cartQty, 0)}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Storefront Area */}
      <main className="max-w-6xl mx-auto p-4 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search groceries, atta, milk, chips, biscuits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-white text-xs outline-none focus:border-blue-500"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedDept(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                selectedDept === cat
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full p-12 text-center text-slate-500 text-xs font-mono">
              No products found in this category.
            </div>
          ) : (
            filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="w-full h-32 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center mb-2">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">📦</span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-blue-400 line-clamp-1">{p.category}</span>
                  <h3 className="text-xs font-bold text-white line-clamp-2 mt-0.5">{p.name}</h3>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-between items-center">
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
                  <button
                    onClick={() => addToCart(p)}
                    className="px-3 py-1 bg-slate-800 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition"
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Cart & Checkout Slide-Over Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>🛒 Your Grocery Cart</span>
                <span className="text-xs text-slate-400">({cart.length} items)</span>
              </h2>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckingOut(false);
                }}
                className="text-slate-400 hover:text-white text-base px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            {!isCheckingOut ? (
              <>
                <div className="flex-1 overflow-y-auto space-y-2 divide-y divide-slate-800/60">
                  {cart.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs font-mono">
                      Your shopping cart is empty.
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="pt-2 flex justify-between items-center">
                        <div className="pr-2">
                          <h4 className="text-xs font-semibold text-white line-clamp-1">{item.name}</h4>
                          <span className="text-[11px] font-mono text-emerald-400 font-bold">
                            ₹{item.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
                          <button
                            onClick={() => updateCartQty(item.id, -1)}
                            className="text-slate-400 hover:text-white font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="text-xs font-mono text-white px-1">{item.cartQty}</span>
                          <button
                            onClick={() => updateCartQty(item.id, 1)}
                            className="text-slate-400 hover:text-white font-bold text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-slate-800 pt-3 space-y-2">
                  <div className="flex justify-between items-center font-mono text-xs">
                    <span className="text-slate-400">Grand Total:</span>
                    <span className="text-emerald-400 font-bold text-base">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <button
                    disabled={cart.length === 0}
                    onClick={() => setIsCheckingOut(true)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow"
                  >
                    Proceed to Checkout →
                  </button>
                </div>
              </>
            ) : (
              /* Checkout Details Form */
              <form onSubmit={handlePlaceOrder} className="flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-3 overflow-y-auto pr-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">WhatsApp / Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Delivery Address</label>
                    <textarea
                      rows={2}
                      placeholder="House/Flat No, Landmark, Street name"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                    >
                      <option value="Cash on Delivery">Cash on Delivery</option>
                      <option value="UPI / QR Code on Delivery">UPI / QR Code on Delivery</option>
                      <option value="Store Pickup">Store Pickup</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 space-y-2">
                  <div className="flex justify-between items-center font-mono text-xs">
                    <span className="text-slate-400">Total Payable:</span>
                    <span className="text-emerald-400 font-bold text-base">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCheckingOut(false)}
                      className="w-1/3 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={submittingOrder}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow"
                    >
                      {submittingOrder ? "Placing Order..." : "Confirm & Place Order"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
 }
}
