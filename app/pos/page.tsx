"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  stock: number;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Load products on mount
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Quick Barcode or Search scan
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.barcode.toLowerCase().includes(query.toLowerCase())
  );

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Header with shortcut button to Admin/Products */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            🛒 POS Counter Terminal
          </h1>
          <p className="text-xs text-slate-400">Barcode scanner & quick cashier register</p>
        </div>

        {/* The Direct Button for Sales Boy & Admin */}
        <Link
          href="/admin/products"
          className="flex items-center gap-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition cursor-pointer"
        >
          <span>➕</span> Add / Restock Item
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Product Search & Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Scan Barcode gun or type item name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 text-white text-sm px-4 py-3 rounded-2xl outline-none"
            />
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500 text-sm">Loading catalog...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  disabled={p.stock <= 0}
                  className={`text-left p-3.5 rounded-xl border transition flex flex-col justify-between ${
                    p.stock > 0
                      ? "bg-slate-900 border-slate-800 hover:border-blue-500 hover:bg-slate-850 cursor-pointer"
                      : "bg-slate-950 border-slate-900 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono text-blue-400 block">{p.category}</span>
                    <span className="text-sm font-semibold text-white block mt-0.5">{p.name}</span>
                    <span className="text-[10px] font-mono text-slate-500 block">BC: {p.barcode}</span>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-sm font-bold text-emerald-400 font-mono">₹{p.price.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400">Stock: {p.stock}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Current Receipt Cart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between h-[600px]">
          <div>
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <h2 className="text-sm font-bold text-white">Current Cart</h2>
              <span className="text-xs font-mono text-slate-400">{cart.length} items</span>
            </div>

            <div className="overflow-y-auto max-h-[420px] divide-y divide-slate-800/60 mt-2">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">Cart is empty. Tap items to ring up.</div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-semibold text-white">{item.name}</div>
                      <div className="text-slate-400 font-mono">
                        {item.quantity} × ₹{item.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold font-mono text-emerald-400">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-rose-400 hover:text-rose-300 px-1 font-bold text-base"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-300">Total Payable</span>
              <span className="text-xl font-bold font-mono text-emerald-400">₹{total.toFixed(2)}</span>
            </div>
            <button
              onClick={() => {
                alert(`Order completed! Total: ₹${total.toFixed(2)}`);
                setCart([]);
              }}
              disabled={cart.length === 0}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition cursor-pointer"
            >
              Print Bill & Complete Cash Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
