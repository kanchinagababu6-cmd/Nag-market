"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const DEPT_MAP: Record<string, string[]> = {
  "Staples & Grains": ["Atta & Flours", "Rice Products", "Dals & Pulses", "Edible Oils & Ghee", "Sugar & Salt", "Whole Spices"],
  "Dairy & Breakfast": ["Milk & Curd", "Paneer & Butter", "Bread & Bakery", "Eggs", "Cereals & Oats", "Tea & Coffee"],
  "Snacks & Packaged": ["Biscuits & Rusks", "Chips & Namkeen", "Noodles & Pasta", "Chocolates", "Sauces & Spreads", "Instant Mixes"],
  "Beverages": ["Soft Drinks & Sodas", "Fruit Juices", "Packaged Bottled Water", "Energy Drinks"],
  "Fresh Produce": ["Daily Vegetables", "Seasonal Fruits", "Ginger, Garlic & Herbs"],
  "Personal Care": ["Soaps & Handwash", "Hair Care", "Dental Care", "Skincare", "Baby Care"],
  "Household & Cleaning": ["Detergents", "Dishwashers", "Surface Cleaners", "Repellents", "Garbage Bags"],
  "Puja Essentials": ["Agarbatti & Camphor", "Puja Oil & Wicks"],
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

export default function AdminProductsPage() {
  const [tab, setTab] = useState<"catalog" | "view">("catalog");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Tab 1 Form State
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [mrp, setMrp] = useState("");
  const [discount, setDiscount] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [dept, setDept] = useState("Staples & Grains");
  const [sub, setSub] = useState(DEPT_MAP["Staples & Grains"][0]);
  const [imgUrl, setImgUrl] = useState("");
  const [isDetected, setIsDetected] = useState(false);

  // Catalog Filters & Tab 2 Edit State
  const [fDept, setFDept] = useState("All");
  const [fSub, setFSub] = useState("All");
  const [scanQ, setScanQ] = useState("");
  const [scanned, setScanned] = useState<Product | null>(null);
  const [eMrp, setEMrp] = useState("");
  const [eDisc, setEDisc] = useState("");
  const [ePrice, setEPrice] = useState("");
  const [eStock, setEStock] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const d = await res.json();
      if (Array.isArray(d)) setProducts(d);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Price calculations for Tab 1
  const updateMrp = (val: string) => {
    setMrp(val);
    const m = parseFloat(val), d = parseFloat(discount);
    if (!isNaN(m) && !isNaN(d)) setPrice((m - (m * d) / 100).toFixed(2));
  };

  const updateDiscount = (val: string) => {
    setDiscount(val);
    const m = parseFloat(mrp), d = parseFloat(val);
    if (!isNaN(m) && !isNaN(d)) setPrice((m - (m * d) / 100).toFixed(2));
  };

  const updatePrice = (val: string) => {
    setPrice(val);
    const p = parseFloat(val), m = parseFloat(mrp);
    if (!isNaN(m) && !isNaN(p) && m > 0) setDiscount((((m - p) / m) * 100).toFixed(1));
  };

  // Price calculations for Tab 2
  const updateEMrp = (val: string) => {
    setEMrp(val);
    const m = parseFloat(val), d = parseFloat(eDisc);
    if (!isNaN(m) && !isNaN(d)) setEPrice((m - (m * d) / 100).toFixed(2));
  };

  const updateEDisc = (val: string) => {
    setEDisc(val);
    const m = parseFloat(eMrp), d = parseFloat(val);
    if (!isNaN(m) && !isNaN(d)) setEPrice((m - (m * d) / 100).toFixed(2));
  };

  const updateEPrice = (val: string) => {
    setEPrice(val);
    const p = parseFloat(val), m = parseFloat(eMrp);
    if (!isNaN(m) && !isNaN(p) && m > 0) setEDisc((((m - p) / m) * 100).toFixed(1));
  };

  const handleTab1Barcode = (val: string) => {
    setBarcode(val);
    const q = val.trim().toLowerCase();
    if (!q) return setIsDetected(false);
    const m = products.find((p) => p.barcode.toString().trim().toLowerCase() === q);
    if (m) {
      setName(m.name || "");
      if (m.category && DEPT_MAP[m.category]) {
        setDept(m.category);
        setSub(m.subCategory || DEPT_MAP[m.category][0]);
      }
      setImgUrl(m.imageUrl || "");
      setIsDetected(true);
    } else {
      setIsDetected(false);
    }
  };

  const handleTab2Scan = (val: string) => {
    setScanQ(val);
    const q = val.trim().toLowerCase();
    if (!q) return setScanned(null);
    const m = products.find((p) => p.barcode.toString().trim().toLowerCase() === q);
    if (m) {
      setScanned(m);
      const mrpVal = m.mrp || m.price;
      const discVal = m.discount || (mrpVal > m.price ? (((mrpVal - m.price) / mrpVal) * 100).toFixed(1) : 0);
      setEMrp(mrpVal.toString());
      setEDisc(discVal.toString());
      setEPrice(m.price.toString());
      setEStock(m.stock.toString());
    } else {
      setScanned(null);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const c = document.createElement("canvas");
      let w = img.width, h = img.height, max = 400;
      if (w > h && w > max) { h = Math.round((h * max) / w); w = max; }
      else if (h > max) { w = Math.round((w * max) / h); h = max; }
      c.width = w; c.height = h;
      c.getContext("2d")?.drawImage(img, 0, 0, w, h);
      setImgUrl(c.toDataURL("image/jpeg", 0.7));
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
          name, barcode, mrp: parseFloat(mrp) || parseFloat(price) || 0,
          discount: parseFloat(discount) || 0, price: parseFloat(price) || 0,
          stock: parseInt(stock, 10) || 0, category: dept, subCategory: sub, imageUrl: imgUrl,
        }),
      });
      const d = await res.json();
      if (!res.ok || d.error) {
        alert(d.error || "Save error");
      } else {
        setName(""); setBarcode(""); setMrp(""); setDiscount(""); setPrice(""); setStock(""); setImgUrl(""); setIsDetected(false);
        fetchProducts();
        alert("Saved to catalog!");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateScanned = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanned) return;
    setSavingEdit(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...scanned,
          mrp: parseFloat(eMrp) || parseFloat(ePrice) || 0,
          discount: parseFloat(eDisc) || 0,
          price: parseFloat(ePrice) || 0,
          stock: parseInt(eStock, 10) || 0,
        }),
      });
      const d = await res.json();
      if (res.ok && d.success) {
        alert("Updated successfully!");
        fetchProducts();
        setScanned((prev) => prev ? { ...prev, price: parseFloat(ePrice) || 0, stock: parseInt(eStock, 10) || 0 } : null);
      } else {
        alert(d.error || "Update failed");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const exportExcel = () => {
    if (!products.length) return alert("No products to export!");
    const hdr = ["Product Name", "Barcode", "Category", "Sub-Category", "MRP", "Discount(%)", "Selling Price", "Stock", "Status"];
    const rows = products.map((p) => {
      const m = p.mrp || p.price;
      const d = p.discount || (m > p.price ? (((m - p.price) / m) * 100).toFixed(1) : 0);
      return [`"${p.name.replace(/"/g, '""')}"`, `"${p.barcode}"`, `"${p.category}"`, `"${p.subCategory || ""}"`, `"${Number(m).toFixed(2)}"`, `"${d}%"`, `"${p.price.toFixed(2)}"`, `"${p.stock}"`, `"${p.stock > 0 ? "In Stock" : "Out of Stock"}"`];
    });
    const link = document.createElement("a");
    link.href = encodeURI("data:text/csv;charset=utf-8," + [hdr.join(","), ...rows.map((r) => r.join(","))].join("\n"));
    link.download = `Catalog_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const filtered = products.filter((p) => (fDept === "All" || p.category === fDept) && (fSub === "All" || p.subCategory === fSub));

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white">📦 Product & Inventory Operations</h1>
          <p className="text-xs text-slate-400">MRP, discounts, selling prices & full catalog spreadsheet export</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportExcel} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow">
            <span>📥</span><span>Export Excel</span>
          </button>
          <Link href="/" className="text-xs px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl border border-slate-700">← Home</Link>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl max-w-xs text-xs">
        <button onClick={() => setTab("catalog")} className={`flex-1 py-1.5 rounded-lg font-semibold transition ${tab === "catalog" ? "bg-blue-600 text-white" : "text-slate-400"}`}>
          ⚡ Catalog
        </button>
        <button onClick={() => setTab("view")} className={`flex-1 py-1.5 rounded-lg font-semibold transition ${tab === "view" ? "bg-blue-600 text-white" : "text-slate-400"}`}>
          🔍 Scan & Edit
        </button>
      </div>

      {/* Tab 1: Catalog Restock */}
      {tab === "catalog" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <h2 className="font-bold text-white">Scan Barcode & Update Product</h2>
            {isDetected && <span className="font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">✓ Detected</span>}
          </div>
          <form onSubmit={handleSaveProduct} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Barcode *</label>
              <input type="text" value={barcode} onChange={(e) => handleTab1Barcode(e.target.value)} placeholder="Barcode" required autoFocus className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Product Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name" required className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Category *</label>
              <select value={dept} onChange={(e) => { setDept(e.target.value); setSub(DEPT_MAP[e.target.value][0]); }} className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none">
                {Object.keys(DEPT_MAP).map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Sub-Category *</label>
              <select value={sub} onChange={(e) => setSub(e.target.value)} className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none">
                {DEPT_MAP[dept]?.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">MRP (₹)</label>
              <input type="number" step="0.01" value={mrp} onChange={(e) => updateMrp(e.target.value)} placeholder="0.00" className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Discount (%)</label>
              <input type="number" step="0.1" value={discount} onChange={(e) => updateDiscount(e.target.value)} placeholder="0%" className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Selling Price (₹) *</label>
              <input type="number" step="0.01" value={price} onChange={(e) => updatePrice(e.target.value)} placeholder="0.00" required className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Stock Units *</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" required className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono outline-none" />
            </div>
            <div className="sm:col-span-3 flex items-center gap-2">
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:bg-slate-800 file:text-slate-200" />
              <input type="url" placeholder="Image URL" value={imgUrl.startsWith("data:") ? "" : imgUrl} onChange={(e) => setImgUrl(e.target.value)} className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none" />
              <div className="w-8 h-8 border border-slate-800 rounded-lg bg-slate-950 overflow-hidden shrink-0 flex items-center justify-center">
                {imgUrl ? <img src={imgUrl} alt="img" className="w-full h-full object-cover" /> : <span className="text-[9px] text-slate-600">Img</span>}
              </div>
            </div>
            <div className="flex justify-end items-end">
              <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow">
                {loading ? "Saving..." : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Scan & Edit */}
      {tab === "view" && (
        <div className="space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase">🔍 Scan Barcode with Gun or Type SKU:</label>
            <div className="flex gap-2">
              <input type="text" autoFocus placeholder="Scan / enter barcode..." value={scanQ} onChange={(e) => handleTab2Scan(e.target.value)} className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs outline-none" />
              {scanQ && <button onClick={() => { setScanQ(""); setScanned(null); }} className="px-3 py-1 bg-slate-800 text-slate-400 text-xs rounded-xl">Clear</button>}
            </div>
          </div>
          {scanned ? (
            <div className="bg-slate-900 border border-blue-500/40 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 text-xs">
                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">✓ Product Found</span>
                <span className="text-slate-400 font-mono">SKU: {scanned.barcode}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                  {scanned.imageUrl ? <img src={scanned.imageUrl} alt={scanned.name} className="w-full h-full object-cover" /> : <span className="text-lg">📦</span>}
                </div>
                <div>
                  <span className="text-[10px] font-mono text-blue-400">{scanned.category} ➔ {scanned.subCategory}</span>
                  <h2 className="text-sm font-bold text-white">{scanned.name}</h2>
                  <div className="text-xs font-mono text-slate-400 space-x-3">
                    <span>Selling: <strong className="text-emerald-400">₹{scanned.price.toFixed(2)}</strong></span>
                    <span>Stock: <strong className="text-white">{scanned.stock}</strong></span>
                  </div>
                </div>
              </div>
              <form onSubmit={handleUpdateScanned} className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">MRP (₹)</label>
                  <input type="number" step="0.01" value={eMrp} onChange={(e) => updateEMrp(e.target.value)} className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-white font-mono text-xs outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Discount (%)</label>
                  <input type="number" step="0.1" value={eDisc} onChange={(e) => updateEDisc(e.target.value)} className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-white font-mono text-xs outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Selling (₹)</label>
                  <input type="number" step="0.01" required value={ePrice} onChange={(e) => updateEPrice(e.target.value)} className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-white font-mono text-xs outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Stock</label>
                  <input type="number" required value={eStock} onChange={(e) => setEStock(e.target.value)} className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-white font-mono text-xs outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1 flex items-end">
                  <button type="submit" disabled={savingEdit} className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded shadow">
                    {savingEdit ? "..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          ) : scanQ ? (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-500 text-xs font-mono">No product found.</div>
          ) : null}
        </div>
      )}

      {/* Category-Wise Catalog Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Catalog ({filtered.length} Items)</h2>
          {fDept !== "All" && DEPT_MAP[fDept] && (
            <select value={fSub} onChange={(e) => setFSub(e.target.value)} className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs outline-none">
              <option value="All">All Sub-Categories</option>
              {DEPT_MAP[fDept].map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          )}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button onClick={() => { setFDept("All"); setFSub("All"); }} className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap ${fDept === "All" ? "bg-blue-600 text-white" : "bg-slate-950 text-slate-400 border border-slate-800"}`}>
            All
          </button>
          {Object.keys(DEPT_MAP).map((c) => (
            <button key={c} onClick={() => { setFDept(c); setFSub("All"); }} className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap ${fDept === c ? "bg-blue-600 text-white" : "bg-slate-950 text-slate-400 border border-slate-800"}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto border-t border-slate-800/80 pt-2">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 font-mono text-[11px]">
              <tr>
                <th className="p-1.5">Img</th>
                <th className="p-1.5">Product</th>
                <th className="p-1.5">Barcode</th>
                <th className="p-1.5">Dept</th>
                <th className="p-1.5">MRP</th>
                <th className="p-1.5">Selling</th>
                <th className="p-1.5">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {!filtered.length ? (
                <tr><td colSpan={7} className="p-3 text-center text-slate-500">No products found.</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="p-1.5">
                      {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-6 h-6 rounded object-cover" /> : <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-[9px]">📦</div>}
                    </td>
                    <td className="p-1.5 font-semibold text-white truncate max-w-[120px]">{p.name}</td>
                    <td className="p-1.5 font-mono text-slate-400">{p.barcode}</td>
                    <td className="p-1.5 text-slate-300">{p.category}</td>
                    <td className="p-1.5 font-mono text-slate-400 line-through">₹{(p.mrp || p.price).toFixed(2)}</td>
                    <td className="p-1.5 font-mono text-emerald-400 font-bold">₹{p.price.toFixed(2)}</td>
                    <td className="p-1.5 font-mono"><span className={`px-1.5 py-0.5 rounded text-[10px] ${p.stock > 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>{p.stock}</span></td>
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
