"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CATEGORIES: Record<string, string[]> = {
  "Staples & Grains": ["Atta, Flours & Sooji", "Rice & Rice Products", "Dals & Pulses", "Edible Oils & Ghee", "Sugar, Jaggery & Salt", "Whole & Ground Spices"],
  "Dairy & Breakfast": ["Fresh Milk & Curd", "Paneer, Butter & Cheese", "Bread, Pav & Bakery", "Eggs", "Cereals, Oats & Muesli", "Tea, Coffee & Health Drinks"],
  "Snacks & Packaged Foods": ["Biscuits, Cookies & Rusks", "Namkeen, Chips & Savory Snacks", "Noodles, Pasta & Vermicelli", "Chocolates & Candies", "Sauces, Ketchup, Spreads & Jams", "Instant Mixes"],
  "Beverages": ["Soft Drinks & Carbonated Sodas", "Fruit Juices & Concentrates", "Packaged Bottled Water & Soda", "Energy & Sports Drinks"],
  "Fresh Produce": ["Daily Fresh Vegetables", "Seasonal & Exotic Fruits", "Herbs, Lemon, Ginger & Garlic"],
  "Personal Care & Hygiene": ["Bath Soaps, Body Wash & Handwash", "Hair Care", "Dental Care", "Skincare, Lotions & Powders", "Feminine Hygiene & Baby Care"],
  "Household & Cleaning": ["Detergents & Fabric Softeners", "Dishwashing Bars & Liquids", "Surface Cleaners & Disinfectants", "Mosquito Repellents & Freshers", "Garbage Bags & Foil"],
  "Puja & Pooja Essentials": ["Agarbatti, Dhoop & Camphor", "Puja Oil & Cotton Wicks"],
};

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

export default function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "view">("catalog");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Tab 1 state
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("Staples & Grains");
  const [subCategory, setSubCategory] = useState(CATEGORIES["Staples & Grains"][0]);
  const [imageUrl, setImageUrl] = useState("");
  const [matchFound, setMatchFound] = useState(false);

  // Tab 2 scan & edit state
  const [scanQuery, setScanQuery] = useState("");
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleTab1Barcode = (val: string) => {
    setBarcode(val);
    const trimmed = val.trim().toLowerCase();
    if (!trimmed) {
      setMatchFound(false);
      return;
    }
    const matched = products.find((p) => p.barcode.toString().trim().toLowerCase() === trimmed);
    if (matched) {
      setName(matched.name || "");
      if (matched.category && CATEGORIES[matched.category]) {
        setCategory(matched.category);
        setSubCategory(matched.subCategory || CATEGORIES[matched.category][0]);
      }
      setImageUrl(matched.imageUrl || "");
      setMatchFound(true);
    } else {
      setMatchFound(false);
    }
  };

  const handleTab2Scan = (val: string) => {
    setScanQuery(val);
    const trimmed = val.trim().toLowerCase();
    if (!trimmed) {
      setScannedProduct(null);
      return;
    }
    const matched = products.find((p) => p.barcode.toString().trim().toLowerCase() === trimmed);
    if (matched) {
      setScannedProduct(matched);
      setEditPrice(matched.price.toString());
      setEditStock(matched.stock.toString());
    } else {
      setScannedProduct(null);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxDim = 400;
      let width = img.width, height = img.height;
      if (width > height && width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else if (height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);
      setImageUrl(canvas.toDataURL("image/jpeg", 0.7));
    };
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !barcode) return alert("Product Name and Barcode are required");
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, barcode, price: parseFloat(price) || 0, stock: parseInt(stock, 10) || 0, category, subCategory, imageUrl,
        }),
      });
      const result = await res.json();
      if (!res.ok || result.error) {
        alert("Error saving: " + (result.error || "Unknown error"));
      } else {
        setName(""); setBarcode(""); setPrice(""); setStock(""); setImageUrl(""); setMatchFound(false);
        fetchProducts();
        alert("Product saved to catalog!");
      }
    } catch (err: any) {
      alert("Network Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateScannedProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedProduct) return;
    setSavingEdit(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: scannedProduct.name,
          barcode: scannedProduct.barcode,
          price: parseFloat(editPrice) || 0,
          stock: parseInt(editStock, 10) || 0,
          category: scannedProduct.category,
          subCategory: scannedProduct.subCategory,
          imageUrl: scannedProduct.imageUrl,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        alert("Rate and Quantity updated successfully!");
        fetchProducts();
        setScannedProduct((prev) => prev ? { ...prev, price: parseFloat(editPrice) || 0, stock: parseInt(editStock, 10) || 0 } : null);
      } else {
        alert("Update failed: " + (result.error || "Server issue"));
      }
    } catch (err: any) {
      alert("Network Error: " + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white">📦 Product & Inventory Operations</h1>
          <p className="text-xs text-slate-400">Scan to update catalog or scan to inspect & edit rate/qty</p>
        </div>
        <Link href="/" className="text-xs px-3.5 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700">
          ← Home
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-950 border border-slate-800 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${activeTab === "catalog" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
        >
          ⚡ Update Catalog
        </button>
        <button
          onClick={() => setActiveTab("view")}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${activeTab === "view" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
        >
          🔍 Scan to View & Edit
        </button>
      </div>

      {/* TAB 1: UPDATE CATALOG */}
      {activeTab === "catalog" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-white">Scan Barcode & Update Catalog</h2>
            {matchFound && (
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                ✓ Product Detected & Auto-Populated
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProduct} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Barcode / SKU *</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => handleTab1Barcode(e.target.value)}
                placeholder="Scan or enter barcode"
                required
                autoFocus
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Product Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fortune Sunflower Oil 1L"
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Main Category *</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setSubCategory(CATEGORIES[e.target.value][0]); }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
              >
                {Object.keys(CATEGORIES).map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Sub-Category *</label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
              >
                {CATEGORIES[category].map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Price (₹ Rate) *</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Stock Units (Quantity) *</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono outline-none focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Product Photo</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-slate-800 file:text-slate-200"
                />
                <input
                  type="url"
                  placeholder="Or image URL"
                  value={imageUrl.startsWith("data:") ? "" : imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-center border border-slate-800 rounded-xl bg-slate-950 h-14 w-14 overflow-hidden">
              {imageUrl ? <img src={imageUrl} alt="Thumbnail" className="w-full h-full object-cover" /> : <span className="text-[10px] text-slate-600">No Image</span>}
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition shadow"
              >
                {loading ? "Saving Product..." : "Update Catalog"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: SCAN BARCODE TO VIEW DETAILS & EDIT RATE/QTY */}
      {activeTab === "view" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              🔍 Scan Barcode with Gun or Type SKU:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Scan or enter barcode to view details..."
                value={scanQuery}
                onChange={(e) => handleTab2Scan(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm outline-none focus:border-blue-500"
              />
              {scanQuery && (
                <button
                  onClick={() => { setScanQuery(""); setScannedProduct(null); }}
                  className="px-3 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {scannedProduct ? (
            <div className="bg-slate-900 border border-blue-500/40 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ✓ Product Found
                </span>
                <span className="font-mono text-xs text-slate-400">SKU: {scannedProduct.barcode}</span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                  {scannedProduct.imageUrl ? <img src={scannedProduct.imageUrl} alt={scannedProduct.name} className="w-full h-full object-cover" /> : <span className="text-2xl">📦</span>}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-blue-400 uppercase">{scannedProduct.category} ➔ {scannedProduct.subCategory}</span>
                  <h2 className="text-base sm:text-lg font-bold text-white">{scannedProduct.name}</h2>
                  <div className="flex gap-4 font-mono text-xs">
                    <span className="text-slate-400">Current Rate: <strong className="text-emerald-400">₹{scannedProduct.price.toFixed(2)}</strong></span>
                    <span className="text-slate-400">Current Stock: <strong className="text-white">{scannedProduct.stock} units</strong></span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Update Selling Rate & Stock Units</h3>
                <form onSubmit={handleUpdateScannedProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Selling Price / Rate (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Available Stock Units *</label>
                    <input
                      type="number"
                      required
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={savingEdit}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition shadow"
                    >
                      {savingEdit ? "Updating..." : "Save Rate & Stock Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : scanQuery ? (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-500 text-xs font-mono">
              No product found with barcode "{scanQuery}". Switch to Tab 1 to register it.
            </div>
          ) : (
            <div className="p-10 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-500 text-xs font-mono">
              Scan any barcode to view product info and edit rate/quantity.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
