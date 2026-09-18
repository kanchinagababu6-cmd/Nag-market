"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Complete grocery hierarchy
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
  const [selectedCategory, setSelectedCategory] = useState<string>("Staples & Grains");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(CATEGORIES["Staples & Grains"][0]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Switch sub-category list when main category changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubCategory(CATEGORIES[category][0]);
  };

  // Convert uploaded device picture to preview data
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get("name"),
      barcode: formData.get("barcode"),
      price: parseFloat(formData.get("price") as string),
      stock: parseInt(formData.get("stock") as string, 10),
      category: selectedCategory,
      subCategory: selectedSubCategory,
      imageUrl: imageUrl,
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        form.reset();
        setImageUrl("");
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white">📦 Master Product & Stock Manager</h1>
          <p className="text-xs text-slate-400">Add barcodes, assign sub-categories, and upload product images</p>
        </div>
        <Link
          href="/"
          className="text-xs px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700"
        >
          ← Dashboard
        </Link>
      </div>

      {/* Product Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-white mb-4">Add or Restock Product</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Product Name *</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Fortune Sunflower Oil 1L"
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Barcode / SKU *</label>
            <input
              type="text"
              name="barcode"
              placeholder="Scan or type barcode"
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Main Category *</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
            >
              {Object.keys(CATEGORIES).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Sub-Category *</label>
            <select
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
            >
              {CATEGORIES[selectedCategory].map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Price (₹) *</label>
            <input
              type="number"
              step="0.01"
              name="price"
              placeholder="0.00"
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Stock Units *</label>
            <input
              type="number"
              name="stock"
              placeholder="0"
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono outline-none focus:border-blue-500"
            />
          </div>

          {/* Image Upload / Photo Snapper */}
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Product Photo</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700"
              />
              <span className="text-[10px] text-slate-500">or paste URL:</span>
              <input
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none"
              />
            </div>
          </div>

          {/* Preview Thumbnail */}
          <div className="flex items-center justify-center border border-slate-800 rounded-xl bg-slate-950 h-20 w-20 overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] text-slate-600">No Image</span>
            )}
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition shadow"
            >
              {isSubmitting ? "Saving..." : "Save Product to Catalog"}
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
