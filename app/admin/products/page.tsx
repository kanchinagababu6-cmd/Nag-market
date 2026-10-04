"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface Product {
  id?: string;
  name: string;
  barcode: string;
  category: string;
  subCategory: string;
  mrp: number;
  discount: number;
  price: number;
  stock: number;
  imageUrl?: string;
}

const CATEGORY_MAP: Record<string, string[]> = {
  "Staples & Grains": [
    "Atta & Flours",
    "Rice & Rice Products",
    "Dals & Pulses",
    "Edible Oils & Ghee",
    "Sugar & Salt",
  ],
  "Dairy & Breakfast": [
    "Fresh Milk & Curd",
    "Paneer & Cheese",
    "Bread & Bakery",
    "Eggs & Butter",
  ],
  "Snacks & Packaged": [
    "Biscuits, Cookies & Rusks",
    "Chocolates & Candies",
    "Chips & Savory Snacks",
    "Noodles & Pasta",
  ],
  "Beverages": [
    "Soft Drinks & Sodas",
    "Fruit Juices",
    "Packaged Bottled Water",
  ],
  "Fresh Produce": [
    "Daily Fresh Vegetables",
    "Seasonal Fruits",
  ],
  "Personal Care": [
    "Soaps & Body Wash",
    "Hair Care",
    "Oral Care",
  ],
  "Household & Cleaning": [
    "Detergents & Fabric Wash",
    "Dishwash Bars & Liquids",
  ],
  "Puja Essentials": [
    "Agarbatti & Dhoop",
    "Puja Oil & Camphor",
  ],
};

const CATEGORY_PILLS = [
  "All",
  "Staples & Grains",
  "Dairy & Breakfast",
  "Snacks & Packaged",
  "Beverages",
  "Fresh Produce",
  "Personal Care",
  "Household & Cleaning",
  "Puja Essentials",
];

export default function ProductInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<"catalog" | "scan">("catalog");
  const [selectedDept, setSelectedDept] = useState("All");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [barcode, setBarcode] = useState("");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("Staples & Grains");
  const [subCategory, setSubCategory] = useState("Atta & Flours");
  const [mrp, setMrp] = useState<string>("0.00");
  const [discount, setDiscount] = useState<string>("0%");
  const [sellingPrice, setSellingPrice] = useState<string>("0.00");
  const [stock, setStock] = useState<string>("0");
  const [imageUrl, setImageUrl] = useState("");

  const loadInventory = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const availableSubCategories = useMemo(() => {
    return CATEGORY_MAP[category] || [];
  }, [category]);

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextCat = e.target.value;
    setCategory(nextCat);
    const subList = CATEGORY_MAP[nextCat] || [];
    setSubCategory(subList[0] || "");
  };

  const handleMrpChange = (val: string) => {
    setMrp(val);
    const numericMrp = parseFloat(val) || 0;
    const numericDisc = parseFloat(discount.replace("%", "")) || 0;
    const computedPrice = numericMrp - (numericMrp * numericDisc) / 100;
    setSellingPrice(computedPrice.toFixed(2));
  };

  const handleDiscountChange = (val: string) => {
    setDiscount(val);
    const numericMrp = parseFloat(mrp) || 0;
    const numericDisc = parseFloat(val.replace("%", "")) || 0;
    const computedPrice = numericMrp - (numericMrp * numericDisc) / 100;
    setSellingPrice(computedPrice.toFixed(2));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim() || !productName.trim()) {
      alert("Barcode and Product Name are mandatory.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        barcode: barcode.trim(),
        name: productName.trim(),
        category,
        subCategory,
        mrp: parseFloat(mrp) || 0,
        discount: parseFloat(discount.replace("%", "")) || 0,
        price: parseFloat(sellingPrice) || 0,
        stock: parseInt(stock, 10) || 0,
        imageUrl: imageUrl.trim() || undefined,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setBarcode("");
        setProductName("");
        setMrp("0.00");
        setDiscount("0%");
        setSellingPrice("0.00");
        setStock("0");
        setImageUrl("");
        loadInventory();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to save product.");
      }
    } catch (err: any) {
      alert("Network error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (!products.length) return alert("Catalog has no records to export.");
    const headers = "Barcode,Product Name,Category,Sub-Category,MRP,Selling Price,Stock\n";
    const rows = products
      .map(
        (p) =>
          `"${p.barcode}","${p.name.replace(/"/g, '""')}","${p.category}","${p.subCategory || ""}",${p.mrp},${p.price},${p.stock}`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `SIRILWOODS_Catalog_${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const filteredProducts = useMemo(() => {
    if (selectedDept === "All") return products;
    return products.filter((p) => p.category.toLowerCase().includes(selectedDept.toLowerCase()));
  }, [products, selectedDept]);

  return (
    <div className="min-h-screen bg-[#070c18] text-slate-100 p-6 space-y-5">
      {/* Top Banner Header */}
      <div className="bg-[#0b1329] border border-slate-800/80 rounded-2xl p-5 flex flex-wrap justify-between items-center shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📦</span>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Product & Inventory Operations
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            MRP, discounts, selling prices & full catalog spreadsheet export
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow"
          >
            <span>📥 Export Excel</span>
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-[#121c38] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700/60 transition"
          >
            ← Home
          </Link>
        </div>
      </div>

      {/* Mode Switches */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("catalog")}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "catalog"
              ? "bg-[#1d4ed8] text-white shadow-md"
              : "bg-[#0b1329] text-slate-400 border border-slate-800 hover:text-white"
          }`}
        >
          <span>⚡ Catalog</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("scan")}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "scan"
              ? "bg-[#1d4ed8] text-white shadow-md"
              : "bg-[#0b1329] text-slate-400 border border-slate-800 hover:text-white"
          }`}
        >
          <span>🔍 Scan & Edit</span>
        </button>
      </div>

      {/* Scan Barcode & Update Form Card */}
      <div className="bg-[#0b1329] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-xs font-bold text-white tracking-wide uppercase">
          Scan Barcode & Update Product
        </h2>

        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Barcode *</label>
              <input
                type="text"
                required
                placeholder="Barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#060b17] border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Product Name *</label>
              <input
                type="text"
                required
                placeholder="Product Name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#060b17] border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Category *</label>
              <select
                value={category}
                onChange={handleCategorySelect}
                className="w-full px-3.5 py-2.5 bg-[#060b17] border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
              >
                {Object.keys(CATEGORY_MAP).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Sub-Category *</label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#060b17] border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
              >
                {availableSubCategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">MRP (₹)</label>
              <input
                type="text"
                placeholder="0.00"
                value={mrp}
                onChange={(e) => handleMrpChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#060b17] border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Discount (%)</label>
              <input
                type="text"
                placeholder="0%"
                value={discount}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#060b17] border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Selling Price (₹) *</label>
              <input
                type="text"
                required
                placeholder="0.00"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#060b17] border border-slate-800 rounded-xl text-emerald-400 font-bold outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Stock Units *</label>
              <input
                type="number"
                required
                placeholder="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#060b17] border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-3">
              <label className="block text-slate-400 font-semibold mb-1">Image URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#060b17] border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#1d4ed8] hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-xl transition shadow"
              >
                {isSubmitting ? "Saving..." : "Save Product"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Catalog Table Container */}
      <div className="bg-[#0b1329] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-xs font-bold text-white tracking-wide uppercase">
          CATALOG ({filteredProducts.length} ITEMS)
        </h2>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
          {CATEGORY_PILLS.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => setSelectedDept(pill)}
              className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                selectedDept === pill
                  ? "bg-[#1d4ed8] text-white shadow"
                  : "bg-[#060b17] text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-3">Img</th>
                <th className="py-3 px-3">Product</th>
                <th className="py-3 px-3">Barcode</th>
                <th className="py-3 px-3">Dept</th>
                <th className="py-3 px-3">MRP</th>
                <th className="py-3 px-3">Selling</th>
                <th className="py-3 px-3">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                    No products found in this category.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((item) => (
                  <tr key={item.barcode} className="hover:bg-slate-800/30 transition">
                    <td className="py-2.5 px-3">
                      <div className="w-7 h-7 bg-[#060b17] border border-slate-800 rounded flex items-center justify-center overflow-hidden">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt="" className="object-cover w-full h-full" />
                        ) : (
                          <span>📦</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">{item.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{item.barcode}</td>
                    <td className="py-2.5 px-3 text-slate-400">{item.category}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">
                      ₹{Number(item.mrp).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                      ₹{Number(item.price).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 text-[11px]">
                        {item.stock}
                      </span>
                    </td>
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
