"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORE_DEPTS: Record<string, { icon: string; subs: string[] }> = {
  "All": { icon: "🛍️", subs: [] },
  "Staples & Grains": { icon: "🌾", subs: ["All Staples", "Atta & Sooji", "Rice & Poha", "Dals & Pulses", "Oils & Ghee", "Sugar & Salt", "Spices"] },
  "Dairy & Breakfast": { icon: "🥛", subs: ["All Dairy", "Milk & Curd", "Paneer & Butter", "Bread & Bakery", "Eggs", "Cereals & Oats", "Tea & Coffee"] },
  "Snacks & Packaged": { icon: "🍪", subs: ["All Snacks", "Biscuits & Cookies", "Namkeen & Chips", "Noodles & Pasta", "Chocolates", "Sauces & Spreads"] },
  "Beverages": { icon: "🧃", subs: ["All Beverages", "Soft Drinks", "Fruit Juices", "Packaged Water", "Energy Drinks"] },
  "Fresh Produce": { icon: "🍎", subs: ["All Fresh Produce", "Daily Vegetables", "Seasonal Fruits", "Ginger, Garlic & Herbs"] },
  "Personal Care": { icon: "🧴", subs: ["All Personal Care", "Soaps & Body Wash", "Hair Care", "Dental Care", "Skincare", "Baby Care"] },
  "Household": { icon: "🧹", subs: ["All Household", "Detergents", "Dishwashers", "Cleaners", "Air Freshers", "Pooja Needs"] }
};

interface Product { id: string; name: string; barcode: string; category: string; subCategory: string; price: number; stock: number; imageUrl?: string; }
interface CartItem extends Product { quantity: number; }

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [dept, setDept] = useState("All");
  const [sub, setSub] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"feat" | "low" | "high">("feat");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [fulfillment, setFulfillment] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [trackPhone, setTrackPhone] = useState("");

  const fetchCatalog = () => fetch("/api/products").then((r) => r.json()).then((d) => Array.isArray(d) && setProducts(d)).catch(console.error);
  useEffect(() => { fetchCatalog(); }, []);

  const fetchOrders = async (ph?: string) => {
    try {
      const res = await fetch(`/api/orders/user?phone=${encodeURIComponent(ph || phone || trackPhone)}`);
      const data = await res.json();
      if (Array.isArray(data)) setUserOrders(data);
    } catch (e) { console.error(e); }
  };

  const addToCart = (p: Product) => {
    if (p.stock <= 0) return;
    setCart((prev) => {
      const ex = prev.find((i) => i.id === p.id);
      if (ex) return ex.quantity < p.stock ? prev.map((i) => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i) : prev;
      return [...prev, { ...p, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => setCart((prev) => prev.map((i) => i.id === id ? { ...i, quantity: i.quantity + delta } : i).filter((i) => i.quantity > 0));

  const subtotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const deliveryFee = fulfillment === "PICKUP" || subtotal >= 499 || subtotal === 0 ? 0 : 30;
  const handlingFee = subtotal > 0 ? 5 : 0;
  const grandTotal = subtotal + deliveryFee + handlingFee;
  const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  let filtered = products.filter((p) => {
    const qMatch = p.name.toLowerCase().includes(query.toLowerCase()) || (p.subCategory && p.subCategory.toLowerCase().includes(query.toLowerCase()));
    const deptMatch = dept === "All" || p.category.toLowerCase().includes(dept.toLowerCase());
    const subMatch = !sub || sub.startsWith("All") || (p.subCategory && p.subCategory.toLowerCase() === sub.toLowerCase());
    return qMatch && deptMatch && subMatch && (inStockOnly ? p.stock > 0 : true);
  });

  if (sortBy === "low") filtered.sort((a, b) => a.price - b.price);
  if (sortBy === "high") filtered.sort((a, b) => b.price - a.price);

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
          deliveryAddress: fulfillment === "PICKUP" ? "Counter Pickup" : address,
          paymentMethod: `${payment} (${fulfillment})`,
          items: cart,
          totalAmount: grandTotal,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrderId(data.orderId);
        setCart([]);
        setIsCartOpen(false);
        fetchCatalog();
      } else alert(data.error || "Order failed");
    } catch { alert("Submission failed"); } finally { setLoading(false); }
  };

  const steps = ["ORDER_PLACED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED"];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 pb-24 px-2 sm:px-4">
      {/* Location & Controls */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-rose-400">📍</span>
            <span>Doorstep: <strong className="text-white">Main Town</strong></span>
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono text-[10px] border border-emerald-500/20">⚡ 25-30 Mins</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { fetchOrders(); setIsOrdersOpen(true); }} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs border border-slate-700 font-semibold">📦 Orders</button>
            <a href="https://wa.me/917075596910" target="_blank" rel="noreferrer" className="px-3 py-1 bg-emerald-600/20 text-emerald-300 rounded-lg text-xs border border-emerald-500/30 font-semibold">💬 Support</a>
            <Link href="/" className="px-2.5 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs border border-slate-700">Exit</Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input type="text" placeholder="Search 1,000+ items (Atta, Rice, Oil, Biscuits)..." value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500" />
          <div className="flex gap-2">
            <select value={sortBy} onChange={(e: any) => setSortBy(e.target.value)} className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none">
              <option value="feat">Featured</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
            <button onClick={() => setInStockOnly(!inStockOnly)} className={`px-3 py-2 rounded-xl text-xs font-semibold border ${inStockOnly ? "bg-emerald-600 text-white border-emerald-500" : "bg-slate-950 text-slate-400 border-slate-800"}`}>
              {inStockOnly ? "✓ In Stock" : "In Stock"}
            </button>
          </div>
        </div>
      </div>

      {/* Promo Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-800/40 p-3.5 rounded-2xl flex justify-between items-center text-xs">
        <div>
          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Super Offer</span>
          <h2 className="text-sm font-bold text-white">Free Home Delivery on orders above ₹499</h2>
        </div>
        <button onClick={() => { setDept("Staples & Grains"); setSub(""); }} className="px-3 py-1.5 bg-white text-slate-900 font-bold text-xs rounded-lg">Shop Staples</button>
      </div>

      {orderId && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex justify-between">
          <span>Order Placed! ID: <strong>#{orderId.slice(0, 8).toUpperCase()}</strong></span>
          <button onClick={() => setOrderId(null)} className="underline">Dismiss</button>
        </div>
      )}

      {/* Department Shortcuts */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {Object.entries(STORE_DEPTS).map(([d, val]) => (
          <button key={d} onClick={() => { setDept(d); setSub(""); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition ${dept === d ? "bg-blue-600 text-white border-blue-500 shadow" : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"}`}>
            <span>{val.icon}</span><span>{d}</span>
          </button>
        ))}
      </div>

      {/* Sub-Categories */}
      {dept !== "All" && STORE_DEPTS[dept].subs.length > 0 && (
        <div className="flex gap-2 overflow-x-auto p-2 bg-slate-900/60 border border-slate-800 rounded-xl scrollbar-none">
          {STORE_DEPTS[dept].subs.map((s) => (
            <button key={s} onClick={() => setSub(s)} className={`px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap ${sub === s || (s.startsWith("All") && !sub) ? "bg-blue-600 text-white" : "bg-slate-950 text-slate-400 border border-slate-800"}`}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {!filtered.length ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs bg-slate-900 border border-slate-800 rounded-2xl">No items match your criteria.</div>
        ) : (
          filtered.map((p) => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between hover:border-slate-700">
              <div>
                <div className="w-full h-32 rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden mb-2 relative">
                  {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-3xl">🛒</span>}
                  {p.stock <= 5 && p.stock > 0 && <span className="absolute bottom-1.5 left-1.5 bg-amber-500 text-black text-[9px] font-bold px-1 rounded">Only {p.stock} left</span>}
                </div>
                <span className="text-[10px] font-mono text-blue-400 block truncate">{p.subCategory || p.category}</span>
                <h3 className="font-bold text-white text-xs line-clamp-2 mt-0.5">{p.name}</h3>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-sm font-black text-emerald-400 font-mono">₹{p.price.toFixed(2)}</span>
                  <div className="text-[10px] text-slate-400">{p.stock > 0 ? "In Stock" : "Sold"}</div>
                </div>
                {p.stock > 0 ? (
                  <button onClick={() => addToCart(p)} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold">+ Add</button>
                ) : (
                  <span className="text-slate-600 text-[11px]">Out</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Bottom Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-3 left-4 right-4 max-w-md mx-auto z-40">
          <button onClick={() => setIsCartOpen(true)} className="w-full bg-blue-600 text-white p-3 rounded-2xl shadow-xl flex items-center justify-between font-semibold text-xs">
            <span className="bg-blue-800 px-2 py-0.5 rounded-lg">{cartCount} items</span>
            <span>Review Basket</span>
            <span className="font-mono font-bold">₹{grandTotal.toFixed(2)} →</span>
          </button>
        </div>
      )}

      {/* Slide Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/75 z-50 flex justify-end">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col justify-between p-4 overflow-y-auto">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <h2 className="text-sm font-bold text-white">Cart ({cartCount})</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-slate-400 text-lg">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-2 my-2.5 p-1 bg-slate-950 rounded-xl text-xs">
                <button onClick={() => setFulfillment("DELIVERY")} className={`py-1.5 rounded-lg font-semibold ${fulfillment === "DELIVERY" ? "bg-blue-600 text-white" : "text-slate-400"}`}>🛵 Home Delivery</button>
                <button onClick={() => setFulfillment("PICKUP")} className={`py-1.5 rounded-lg font-semibold ${fulfillment === "PICKUP" ? "bg-blue-600 text-white" : "text-slate-400"}`}>🏬 Counter Pickup</button>
              </div>

              <div className="divide-y divide-slate-800/80 max-h-48 overflow-y-auto my-2">
                {cart.map((item) => (
                  <div key={item.id} className="py-2 flex justify-between items-center text-xs">
                    <div className="max-w-[170px]"><h4 className="font-semibold text-white truncate">{item.name}</h4><span className="text-slate-400 font-mono">₹{item.price.toFixed(2)}</span></div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, -1)} className="w-5 h-5 rounded bg-slate-800 text-white flex items-center justify-center font-bold">-</button>
                      <span className="font-mono text-white">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-5 h-5 rounded bg-slate-800 text-white flex items-center justify-center font-bold">+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono space-y-1 my-2">
                <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-400"><span>Delivery</span><span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span></div>
                <div className="flex justify-between text-slate-400"><span>Handling</span><span>₹{handlingFee}</span></div>
                <div className="flex justify-between pt-1.5 border-t border-slate-800 text-white font-bold"><span>Total</span><span className="text-emerald-400">₹{grandTotal.toFixed(2)}</span></div>
              </div>

              <form onSubmit={handleCheckout} className="space-y-2 mt-2">
                <input type="text" placeholder="Full Name" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none" />
                <input type="tel" placeholder="WhatsApp Number" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none" />
                {fulfillment === "DELIVERY" && <textarea placeholder="Address & Landmark" required rows={2} value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none" />}
                <select value={payment} onChange={(e) => setPayment(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none">
                  <option value="COD">Cash on Delivery / Pickup</option>
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                </select>
                <button type="submit" disabled={loading} className="w-full py-2.5 bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow mt-2">
                  {loading ? "Placing Order..." : `Confirm Order (₹${grandTotal.toFixed(2)})`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tracker Modal */}
      {isOrdersOpen && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-3">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-4 max-h-[80vh] overflow-y-auto space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Order Tracking</h3>
              <button onClick={() => setIsOrdersOpen(false)} className="text-slate-400">✕</button>
            </div>
            <div className="flex gap-2">
              <input type="tel" placeholder="Mobile number" value={trackPhone} onChange={(e) => setTrackPhone(e.target.value)} className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none" />
              <button onClick={() => fetchOrders(trackPhone)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-xl">Track</button>
            </div>
            <div className="space-y-3">
              {!userOrders.length ? (
                <div className="py-6 text-center text-slate-500 text-xs font-mono">No orders found for this number.</div>
              ) : (
                userOrders.map((o) => {
                  const sIdx = Math.max(0, steps.indexOf(o.status));
                  return (
                    <div key={o.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
                      <div className="flex justify-between"><span className="font-mono text-blue-400 font-bold">#{o.id.slice(0, 8).toUpperCase()}</span><span className="font-mono text-emerald-400 font-bold">₹{o.totalAmount.toFixed(2)}</span></div>
                      <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-semibold pt-1">
                        <span className={sIdx >= 0 ? "text-emerald-400" : "text-slate-600"}>Placed</span>
                        <span className={sIdx >= 1 ? "text-emerald-400" : "text-slate-600"}>Packed</span>
                        <span className={sIdx >= 2 ? "text-emerald-400" : "text-slate-600"}>Out</span>
                        <span className={sIdx >= 3 ? "text-emerald-400" : "text-slate-600"}>Delivered</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full"><div className="bg-emerald-500 h-full" style={{ width: `${((sIdx + 1) / 4) * 100}%` }} /></div>
                      <div className="text-[11px] text-slate-400 pt-1">Items: {o.items?.map((it: any) => `${it.product?.name || 'Item'} (×${it.quantity})`).join(", ")}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

        
