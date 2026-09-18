"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CATEGORIES: Record<string, string[]> = {
  "Staples & Grains": ["Atta, Flours & Sooji", "Rice Products", "Dals & Pulses", "Edible Oils & Ghee", "Sugar & Salt", "Whole & Ground Spices"],
  "Dairy & Breakfast": ["Milk & Curd", "Paneer & Butter", "Bread & Bakery", "Eggs", "Cereals & Oats", "Tea & Coffee"],
  "Snacks & Packaged": ["Biscuits & Rusks", "Chips & Namkeen", "Noodles & Pasta", "Chocolates & Candies", "Sauces & Spreads", "Instant Mixes"],
  "Beverages": ["Soft Drinks & Sodas", "Fruit Juices", "Packaged Bottled Water", "Energy & Sports Drinks"],
  "Fresh Produce": ["Daily Fresh Vegetables", "Seasonal Fruits", "Ginger, Garlic & Herbs"],
  "Personal Care": ["Bath Soaps & Handwash", "Hair Care", "Dental Care", "Skincare & Lotions", "Baby Care"],
  "Household & Cleaning": ["Detergents & Fabric", "Dishwashers", "Surface Cleaners", "Repellents", "Garbage Bags & Foils"],
  "Puja Essentials": ["Agarbatti & Camphor", "Puja Oil & Wicks"],
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

  // Category filter state
  const [filterDept, setFilterDept] = useState("All");
  const [filterSub, setFilterSub] = useState("All");

  // Tab 2 state
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
    if (!trimmed) return setMatchFound(false);
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
    if (!trimmed) return setScannedProduct(null);
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
      let w = img.width, h = img.height;
      if (w > h && w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
      else if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; }
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
      setImageUrl(canvas.toDataURL("image/jpeg", 0.7));
    };
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !barcode) return alert("Product Name and Barcode required");
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, barcode, price: parseFloat(price) || 0, stock: parseInt(stock, 10) || 0, category, subCategory, imageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) alert(data.error || "Save error");
      else {
        setName(""); setBarcode(""); setPrice(""); setStock(""); setImageUrl(""); setMatchFound(false);
        fetchProducts();
        alert("Product saved successfully!");
      }
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  const handleUpdateScanned = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedProduct) return;
    setSavingEdit(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...scannedProduct,
          price: parseFloat(editPrice) || 0,
          stock: parseInt(editStock, 10) || 0,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Rate and Quantity updated!");
        fetchProducts();
        setScannedProduct((prev) => prev ? { ...prev, price: parseFloat(editPrice) || 0, stock: parseInt(editStock, 10) || 0 } : null);
      } else alert(data.error || "Update failed");
    } catch (err: any) { alert(err.message); }
    finally { setSavingEdit(false); }
  };

  const filteredCatalog = products.filter((p) => {
    const matchDept = filterDept === "All" || p.category === filterDept;
    const matchSub = filterSub === "All" || p.subCategory === filterSub;
    return matchDept && matchSub;
  });

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white">📦 Product & Inventory Operations</h1>
          <p className="text-xs text-slate-400">Category-wise catalog, barcode restock & rate manager</p>
        </div>
        <Link href="/" className="text-xs px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl border border-slate-700">← Home</Link>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl max-w-xs text-xs">
        <button onClick={() => setActiveTab("catalog")} className={`flex-1 py-1.5 rounded-lg font-semibold transition ${activeTab === "catalog" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
          ⚡ Catalog
        </button>
        <button onClick={() => setActiveTab("view")} className={`flex-1 py-1.5 rounded-lg font-semibold transition ${activeTab === "view" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
          🔍 Scan & Edit
        </button>
      </div>

      {/* Tab 1: Catalog Restock */}
      {activeTab === "catalog" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <h2 className="font-bold text-white">Scan Barcode & Update Catalog</h2>
            {matchFound && <span className="font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">✓ Detected & Auto-Filled</span>}
          </div>
          <form onSubmit={handleSaveProduct} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Barcode / SKU *</label>
              <input type="text" value={barcode} onChange={(e) => handleTab1Barcode(e.target.value)} placeholder="Scan / enter barcode" required autoFocus className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Product Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fortune Sunflower Oil 1L" required className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Category *</label>
              <select value={category} onChange={(e) => { setCategory(e.target.value); setSubCategory(CATEGORIES[e.target.value][0]); }} className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500">
                {Object.keys(CATEGORIES).map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Sub-Category *</label>
              <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500">
                {CATEGORIES[category]?.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Price (₹) *</label>
              <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" required className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Stock Units *</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" required className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono outline-none focus:border-blue-500" />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-slate-800 file:text-slate-200" />
              <input type="url" placeholder="Or image URL" value={imageUrl.startsWith("data:") ? "" : imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none" />
              <div className="w-10 h-10 border border-slate-800 rounded-lg bg-slate-950 overflow-hidden shrink-0 flex items-center justify-center">
                {imageUrl ? <img src={imageUrl} alt="preview" className="w-full h-full object-cover" /> : <span className="text-[10px] text-slate-600">Img</span>}
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow">
                {loading ? "Saving..." : "Update Catalog"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Scan to View & Edit */}
      {activeTab === "view" && (
        <div className="space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase">🔍 Scan Barcode with Gun or Type SKU:</label>
            <div className="flex gap-2">
              <input type="text" autoFocus placeholder="Scan / enter barcode..." value={scanQuery} onChange={(e) => handleTab2Scan(e.target.value)} className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs outline-none focus:border-blue-500" />
              {scanQuery && <button onClick={() => { setScanQuery(""); setScannedProduct(null); }} className="px-3 py-1 bg-slate-800 text-slate-400 text-xs rounded-xl">Clear</button>}
            </div>
          </div>
          {scannedProduct ? (
            <div className="bg-slate-900 border border-blue-500/40 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 text-xs">
                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">✓ Product Found</span>
                <span className="text-slate-400 font-mono">SKU: {scannedProduct.barcode}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                  {scannedProduct.imageUrl ? <img src={scannedProduct.imageUrl} alt={scannedProduct.name} className="w-full h-full object-cover" /> : <span className="text-xl">📦</span>}
                </div>
                <div>
                  <span className="text-[10px] font-mono text-blue-400">{scannedProduct.category} ➔ {scannedProduct.subCategory}</span>
                  <h2 className="text-sm font-bold text-white">{scannedProduct.name}</h2>
                  <div className="text-xs font-mono text-slate-400 space-x-3 mt-0.5">
                    <span>Rate: <strong className="text-emerald-400">₹{scannedProduct.price.toFixed(2)}</strong></span>
                    <span>Stock: <strong className="text-white">{scannedProduct.stock}</strong></span>
                  </div>
                </div>
              </div>
              <form onSubmit={handleUpdateScanned} className="grid grid-cols-2 gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Selling Rate (₹) *</label>
                  <input type="number" step="0.01" required value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Stock Units *</label>
                  <input type="number" required value={editStock} onChange={(e) => setEditStock(e.target.value)} className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs outline-none" />
                </div>
                <div className="col-span-2 flex justify-end">
                  <button type="submit" disabled={savingEdit} className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow">
                    {savingEdit ? "Updating..." : "Save Rate & Stock"}
                  </button>
                </div>
              </form>
            </div>
          ) : scanQuery ? (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-500 text-xs font-mono">No product found for "{scanQuery}".</div>
          ) : (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-500 text-xs font-mono">Scan any barcode to view and edit.</div>
          )}
        </div>
      )}

      {/* Category-Wise Catalog Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Catalog ({filteredCatalog.length} Items)</h2>
          {filterDept !== "All" && CATEGORIES[filterDept] && (
            <select value={filterSub} onChange={(e) => setFilterSub(e.target.value)} className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs outline-none">
              <option value="All">All Sub-Categories</option>
              {CATEGORIES[filterDept].map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          )}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button onClick={() => { setFilterDept("All"); setFilterSub("All"); }} className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap ${filterDept === "All" ? "bg-blue-600 text-white" : "bg-slate-950 text-slate-400 border border-slate-800"}`}>
            All
          </button>
          {Object.keys(CATEGORIES).map((cat) => (
            <button key={cat} onClick={() => { setFilterDept(cat); setFilterSub("All"); }} className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap ${filterDept === cat ? "bg-blue-600 text-white" : "bg-slate-950 text-slate-400 border border-slate-800"}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto border-t border-slate-800/80 pt-2">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 font-mono text-[11px]">
              <tr>
                <th className="p-2">Img</th>
                <th className="p-2">Product</th>
                <th className="p-2">Barcode</th>
                <th className="p-2">Dept</th>
                <th className="p-2">Sub-Category</th>
                <th className="p-2">Price</th>
                <th className="p-2">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {!filteredCatalog.length ? (
                <tr><td colSpan={7} className="p-3 text-center text-slate-500">No products found.</td></tr>
              ) : (
                filteredCatalog.map((p) => (
                  <tr key={p.id}>
                    <td className="p-2">
                      {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-7 h-7 rounded object-cover" /> : <div className="w-7 h-7 bg-slate-800 rounded flex items-center justify-center text-[10px]">📦</div>}
                    </td>
                    <td className="p-2 font-semibold text-white truncate max-w-[120px]">{p.name}</td>
                    <td className="p-2 font-mono text-slate-400">{p.barcode}</td>
                    <td className="p-2 text-slate-300">{p.category}</td>
                    <td className="p-2 text-blue-400 font-mono text-[10px]">{p.subCategory}</td>
                    <td className="p-2 font-mono text-emerald-400 font-bold">₹{p.price.toFixed(2)}</td>
                    <td className="p-2 font-mono"><span className={`px-1.5 py-0.5 rounded text-[10px] ${p.stock > 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>{p.stock} units</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
