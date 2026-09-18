"use client";

import { useState, useEffect } from "react";

interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  subCategory: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(console.error);
  }, []);

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Filter products
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subCategory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          deliveryAddress: address,
          paymentMethod,
          items: cart,
          totalAmount: cartTotal,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrderSuccess(data.orderId);
        setCart([]);
        setIsCartOpen(false);
      } else {
        alert(data.error || "Checkout failed");
      }
    } catch (err) {
      alert("Error placing order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20">
      {/* Top Welcome Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            Express 30-Min Delivery
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Nag Online Supermarket</h1>
          <p className="text-xs text-slate-400">Fresh Groceries, Staples & Daily Essentials</p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search atta, rice, snacks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {orderSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex justify-between items-center">
          <div>
            <strong>Order Placed Successfully!</strong> Order ID: #{orderSuccess.slice(0, 8)}
            <p className="text-[11px] text-emerald-500 mt-0.5">Our delivery agent will reach you shortly.</p>
          </div>
          <button onClick={() => setOrderSuccess(null)} className="underline text-xs">Dismiss</button>
        </div>
      )}

      {/* Categories Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 text-xs">
            No items available matching your search.
          </div>
        ) : (
          filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between hover:border-slate-700 transition group"
            >
              <div>
                <div className="w-full h-36 rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden mb-2.5">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  ) : (
                    <span className="text-3xl">🛒</span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-blue-400 block truncate">{p.subCategory}</span>
                <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-2 mt-0.5">{p.name}</h3>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-sm font-black text-emerald-400 font-mono">₹{p.price.toFixed(2)}</span>
                  <div className="text-[10px]">
                    {p.stock > 0 ? (
                      <span className="text-emerald-400">In Stock</span>
                    ) : (
                      <span className="text-rose-400">Out of Stock</span>
                    )}
                  </div>
                </div>

                {p.stock > 0 ? (
                  <button
                    onClick={() => addToCart(p)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
                  >
                    + Add
                  </button>
                ) : (
                  <button disabled className="px-3 py-1.5 bg-slate-800 text-slate-500 rounded-lg text-xs cursor-not-allowed">
                    Sold
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Bottom Cart Bar (when cart has items) */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between font-semibold text-xs transition"
          >
            <div className="flex items-center gap-2">
              <span className="bg-blue-700 px-2.5 py-1 rounded-lg text-xs font-mono">{totalCartCount} items</span>
              <span>View Cart</span>
            </div>
            <span className="text-sm font-mono font-black">₹{cartTotal.toFixed(2)} →</span>
          </button>
        </div>
      )}

      {/* Cart & Checkout Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col justify-between p-5 overflow-y-auto">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <h2 className="text-base font-bold text-white">Your Cart ({totalCartCount})</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-800/80 my-3">
                {cart.map((item) => (
                  <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                    <div className="max-w-[180px]">
                      <h4 className="font-semibold text-white truncate">{item.name}</h4>
                      <span className="text-slate-400 font-mono">₹{item.price.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded-md bg-slate-800 text-white flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded-md bg-slate-800 text-white flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center py-3 border-t border-slate-800 font-mono">
                <span className="text-xs text-slate-400">Total Bill</span>
                <span className="text-base font-bold text-emerald-400">₹{cartTotal.toFixed(2)}</span>
              </div>

              {/* Checkout Customer Details */}
              <form onSubmit={handleCheckout} className="space-y-3 mt-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Delivery Details</h3>

                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none"
                />

                <input
                  type="tel"
                  placeholder="WhatsApp Mobile Number"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none"
                />

                <textarea
                  placeholder="Door No, Street, Landmark Address"
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none"
                />

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none"
                  >
                    <option value="COD">Cash on Delivery (COD)</option>
                    <option value="UPI">UPI on Delivery</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow mt-3"
                >
                  {loading ? "Placing Order..." : `Place Order (₹${cartTotal.toFixed(2)})`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
