"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CATEGORIES: Record<string, string[]> = {
  "Staples & Grains": [
    "Atta, Flours & Sooji",
    "Rice & Rice Products",
    "Dals & Pulses",
    "Edible Oils & Ghee",
    "Sugar, Jaggery & Salt",
    "Whole & Ground Spices",
  ],
  "Dairy & Breakfast": [
    "Fresh Milk & Curd",
    "Paneer, Butter & Cheese",
    "Bread, Pav & Bakery",
    "Eggs",
    "Cereals, Oats & Muesli",
    "Tea, Coffee & Health Drinks",
  ],
  "Snacks & Packaged Foods": [
    "Biscuits, Cookies & Rusks",
    "Namkeen, Chips & Savory Snacks",
    "Noodles, Pasta & Vermicelli",
    "Chocolates & Candies",
    "Sauces, Ketchup, Spreads & Jams",
    "Instant Ready-to-Eat Mixes",
  ],
  "Beverages": [
    "Soft Drinks & Carbonated Sodas",
    "Fruit Juices & Concentrates",
    "Packaged Bottled Water & Soda",
    "Energy & Sports Drinks",
  ],
  "Fresh Produce": [
    "Daily Fresh Vegetables",
    "Seasonal & Exotic Fruits",
    "Herbs, Lemon, Ginger & Garlic",
  ],
  "Personal Care & Hygiene": [
    "Bath Soaps, Body Wash & Handwash",
    "Hair Care",
    "Dental Care",
    "Skincare, Lotions & Powders",
    "Feminine Hygiene & Baby Care",
  ],
  "Household & Cleaning": [
    "Detergents & Fabric Softeners",
    "Dishwashing Bars & Liquids",
    "Surface Cleaners & Disinfectants",
    "Mosquito Repellents & Freshers",
    "Kitchen Rolls, Foil & Garbage Bags",
  ],
  "Puja & Pooja Essentials": [
    "Agarbatti, Dhoop & Camphor",
    "Puja Oil & Cotton Wicks",
  ],
};

export default function AdminProductsPage() {
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("Staples & Grains");
  const [subCategory, setSubCategory] = useState(CATEGORIES["Staples & Grains"][0]);
  const [imageUrl, setImageUrl] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleCategorySelect = (val: string) => {
    setCategory(val);
    setSubCategory(CATEGORIES[val][0]);
  };

  // Compress picture to < 200KB thumbnail before saving
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxDim = 400;
      let width = img.width;
      let height = img.height;

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
      const compressed = canvas.toDataURL("image/jpeg", 0.7);
      setImageUrl(compressed);
    };
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !barcode) {
      alert("Please fill in Product Name and Barcode");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          barcode,
          price: parseFloat(price) || 0,
          stock: parseInt(stock, 10) || 0,
          category,
          subCategory,
          imageUrl,
        }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        alert("Error saving: " + (result.error || "Unknown server issue"));
      } else {
        // Reset form inputs
        setName("");
        setBarcode("");
        setPrice("");
        setStock("");
        setImageUrl("");
        fetchProducts();
      }
    } catch (err: any) {
      alert("Network/Request Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white">📦 Master Product & Stock Manager</h1>
          <p className="text-xs text-slate-400">Add barcodes, assign sub-categories, and sync stock</p>
        </div>
        <Link
          href="/"
          className="text-xs px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700"
        >
          ← Home
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-white mb-4">Add or Restock Product</h2>
        <form onSubmit={handleSaveProduct} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Barcode / SKU *</label>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Scan or type barcode"
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Main Category *</label>
            <select
              value={category}
              onChange={(e) => handleCategorySelect(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
            >
              {Object.keys(CATEGORIES).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Sub-Category *</label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
            >
              {CATEGORIES[category].map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Price (₹) *</label>
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
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Stock Units *</label>
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
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200"
              />
              <input
                type="url"
                placeholder="Or paste image URL"
                value={imageUrl.startsWith("data:") ? "" : imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-center border border-slate-800 rounded-xl bg-slate-950 h-16 w-16 overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] text-slate-600">No Image</span>
            )}
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition shadow"
            >
              {loading ? "Saving Product..." : "Save Product to Catalog"}
            </button>
          </div>
        </form>
      </div>

      {/* Catalog Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
            <tr>
              <th className="p-3">Photo</th>
              <th className="p-3">Product</th>
              <th className="p-3">Barcode</th>
              <th className="p-3">Department</th>
              <th className="p-3">Sub-Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-slate-500">
                  No products added yet.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td className="p-3">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] text-slate-500">
                        📦
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-semibold text-white">{p.name}</td>
                  <td className="p-3 font-mono text-slate-400">{p.barcode}</td>
                  <td className="p-3 text-slate-300">{p.category}</td>
                  <td className="p-3 text-blue-400 font-mono text-[11px]">{p.subCategory}</td>
                  <td className="p-3 font-mono text-emerald-400 font-bold">₹{p.price.toFixed(2)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        p.stock > 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
