"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: { name: string };
}

interface Order {
  id: string;
  deliveryAddress: string;
  paymentMethod: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [dept, setDept] = useState("All");
  const [query, setQuery] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [fulfillment, setFulfillment] = useState<"DELIVERY" | "PICKUP">("DELIVERY");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [payment] = useState("COD");
  const [loading, setLoading] = useState(false);

  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [ordersPhoneInput, setOrdersPhoneInput] = useState("");

  const fetchCatalog = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCatalog();
    const savedPhone = localStorage.getItem("nag_customer_phone");
    if (savedPhone) {
      setPhone(savedPhone);
      setOrdersPhoneInput(savedPhone);
    }
  }, []);

  const fetchOrders = async (targetPhone?: string) => {
    try {
      const activePhone = targetPhone || ordersPhoneInput || phone;
      const queryParam = activePhone ? `?phone=${encodeURIComponent(activePhone)}` : "";
      
      const res = await fetch(`/api/orders/user${queryParam}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.orders || [];
      setUserOrders(list);
    } catch (e) {
      console.error(e);
    }
  };

  const addToCart = (p: Product) => {
    if (p.stock <= 0) return;
    setCart((prev) => {
      const ex = prev.find((item) => item.id === p.id);
      if (ex) {
        return ex.quantity >= p.stock
          ? prev
          : prev.map((i) => (i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...p, quantity: 1 }];
    });
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          deliveryAddress: fulfillment === "DELIVERY" ? address : "Store Pickup",
          paymentMethod: `${payment} (${fulfillment})`,
          items: cart.map((i) => ({ productId: i.id, quantity: i.quantity, price: i.price })),
          totalAmount: cartTotal,
        }),
      });

      if (res.ok) {
        localStorage.setItem("nag_customer_phone", phone);
        setOrdersPhoneInput(phone);
        setCart([]);
        setIsCartOpen(false);
        fetchOrders(phone);
        setIsOrdersOpen(true);
      } else {
        alert("Checkout failed. Please try again.");
      }
    } catch {
      alert("Error placing order.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter((p) => {
    const matchDept = dept === "All" || p.category === dept;
    const matchQuery = p.name.toLowerCase().includes(query.toLowerCase());
    const matchStock = !inStockOnly || p.stock > 0;
    return matchDept && matchQuery && matchStock;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏪</span>
            <span className="font-bold text-base text-white tracking-tight">Nag Market</span>
          </div>
          <Link
            href="/"
            className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition"
          >
            Exit
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* Quick Menu Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">📍 Doorstep: <strong className="text-white">Main Town</strong></span>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-semibold">⚡ 25-30 Mins</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                fetchOrders();
                setIsOrdersOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
            >
              📦 Orders
            </button>
            <a
              href="https://wa.me/917075596910"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold"
            >
              💬 Support
            </a>
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />

          <div className="flex justify-between items-center text-xs">
            <div className="flex gap-1 overflow-x-auto pb-1">
              {["All", "Staples & Grains", "Dairy & Breakfast", "Snacks"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDept(d)}
                  className={`px-3 py-1 rounded-xl whitespace-nowrap text-[11px] font-medium transition ${
                    dept === d ? "bg-blue-600 text-white" : "bg-slate-950 text-slate-400 border border-slate-800"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border ml-2 ${
                inStockOnly ? "bg-blue-600 text-white border-blue-500" : "bg-slate-950 text-slate-400 border-slate-800"
              }`}
            >
              In Stock
            </button>
          </div>
        </div>

        {/* Catalog */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((product) => (
            <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-3 flex flex-col justify-between">
              <div className="aspect-square bg-slate-950 rounded-2xl flex items-center justify-center text-3xl border border-slate-800/80 mb-2">
                🛒
              </div>
              <div className="space-y-0.5 mb-2">
                <span className="text-[10px] text-slate-500 block truncate">{product.category}</span>
                <h3 className="text-xs font-bold text-white line-clamp-1">{product.name}</h3>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white">₹{product.price.toFixed(2)}</span>
                  <span className="block text-[9px] text-slate-500">{product.stock > 0 ? "In Stock" : "Sold Out"}</span>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  + Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-xl transition"
          >
            <span className="bg-blue-700 px-2.5 py-0.5 rounded-lg text-xs font-bold">
              {cart.reduce((n, i) => n + i.quantity, 0)} items
            </span>
            <span className="text-xs font-bold">Checkout (₹{cartTotal.toFixed(2)}) →</span>
          </button>
        </div>
      )}

      {/* Checkout Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h2 className="text-sm font-bold text-white">Basket</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg">✕</button>
            </div>

            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <p className="font-bold text-white">{item.name}</p>
                    <p className="text-[10px] text-slate-400">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateCartQty(item.id, -1)} className="w-6 h-6 bg-slate-800 rounded text-white">-</button>
                    <span className="font-mono">{item.quantity}</span>
                    <button onClick={() => updateCartQty(item.id, 1)} className="w-6 h-6 bg-slate-800 rounded text-white">+</button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleCheckout} className="space-y-2.5 pt-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFulfillment("DELIVERY")}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition ${
                    fulfillment === "DELIVERY" ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  🏠 Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillment("PICKUP")}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition ${
                    fulfillment === "PICKUP" ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  🏬 Store Pickup
                </button>
              </div>

              <input
                type="text"
                placeholder="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              {fulfillment === "DELIVERY" && (
                <textarea
                  placeholder="Delivery Address"
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition"
              >
                {loading ? "Placing..." : `Order Now • ₹${cartTotal.toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Orders Tracker Modal (Customer Specific) */}
      {isOrdersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-4 space-y-3 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-sm font-bold text-white">📦 Your Orders</span>
              <button onClick={() => setIsOrdersOpen(false)} className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded-lg">✕</button>
            </div>

            {/* Quick phone filter to fetch orders if not logged in */}
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={ordersPhoneInput}
                onChange={(e) => setOrdersPhoneInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={() => fetchOrders(ordersPhoneInput)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
              >
                Search
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {userOrders.length === 0 ? (
                <p className="text-center py-6 text-slate-500 text-xs font-mono">
                  No orders found for this number.
                </p>
              ) : (
                userOrders.map((ord) => (
                  <div key={ord.id} className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-2xl space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono text-blue-400 font-bold">#{ord.id.slice(0, 8).toUpperCase()}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300">{ord.status}</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {ord.items?.map((it) => (
                        <div key={it.id} className="flex justify-between">
                          <span>{it.product?.name || "Item"} ×{it.quantity}</span>
                          <span className="text-emerald-400">₹{(it.price * it.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-1 text-xs font-bold">
                      <span className="text-slate-400">Total:</span>
                      <span className="text-emerald-400">₹{ord.totalAmount?.toFixed(2)}</span>
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
