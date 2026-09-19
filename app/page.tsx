"use client";

import { useState } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export default function OperationsDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);

  const [products] = useState<Product[]>([
    { id: "1", name: "Cookies", category: "Snacks & Packaged Foods", price: 20.0, stock: 50 },
    { id: "2", name: "5 star", category: "Snacks & Packaged Foods", price: 10.0, stock: 35 },
  ]);

  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#070b19] text-white flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#090e24]">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏪</span>
          <span className="font-bold text-sm tracking-wide text-white">Nag Market</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-xl bg-slate-800/80 text-slate-300 font-medium">
            Nagababu
          </span>
          <button className="px-3 py-1 rounded-xl bg-rose-950/60 border border-rose-800/50 text-rose-300 hover:bg-rose-900/60 font-medium transition">
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-4 max-w-md mx-auto w-full space-y-4">
        {/* Operations Header & Quick Actions */}
        <div className="bg-[#0f1738] border border-slate-800/80 rounded-3xl p-4 space-y-3 shadow-lg">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
              NAG SUPERMARKET
            </span>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Grocery Store & Operations
            </h1>
          </div>

          {/* Action Tabs */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "orders"
                  ? "bg-blue-600 text-white"
                  : "bg-[#141e46] text-slate-300 hover:bg-slate-800"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              🛍️ Live Orders
            </button>

            <button
              onClick={() => setActiveTab("pos")}
              className={`px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "pos"
                  ? "bg-blue-600 text-white"
                  : "bg-[#141e46] text-slate-300 hover:bg-slate-800"
              }`}
            >
              🖥️ POS Counter
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "products"
                  ? "bg-blue-600 text-white"
                  : "bg-[#141e46] text-slate-300 hover:bg-slate-800"
              }`}
            >
              📦 Products
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "analytics"
                  ? "bg-blue-600 text-white"
                  : "bg-[#141e46] text-slate-300 hover:bg-slate-800"
              }`}
            >
              📊 Analytics
            </button>

            <button className="px-3 py-1.5 rounded-2xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 ml-auto transition">
              🛒 Cart <span className="bg-emerald-700 px-1.5 py-0.2 rounded-full text-[10px]">{cartCount}</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groceries, atta, milk, chips, biscuits..."
            className="w-full bg-[#0d1430] border border-slate-800 rounded-2xl py-2.5 px-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["All", "Snacks & Packaged Foods"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-2xl text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow"
                  : "bg-[#0d1430] text-slate-400 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-[#0d1533] border border-slate-800/80 rounded-3xl p-3 flex flex-col justify-between shadow-md"
            >
              <div className="aspect-square bg-[#080d21] rounded-2xl flex items-center justify-center text-3xl border border-slate-800/50 mb-3">
                📦
              </div>

              <div className="space-y-0.5 mb-3">
                <span className="text-[10px] text-blue-400 font-medium block truncate">
                  {product.category}
                </span>
                <h3 className="text-xs font-bold text-slate-100 line-clamp-1">
                  {product.name}
                </h3>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                <span className="text-xs font-bold text-emerald-400">
                  ₹{product.price.toFixed(2)}
                </span>
                <button
                  onClick={handleAddToCart}
                  className="px-2.5 py-1 bg-[#142254] hover:bg-blue-600 border border-blue-500/30 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  + Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
