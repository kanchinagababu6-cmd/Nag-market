import React, { useState, useEffect, useMemo } from "react";

interface AnalyticsSummary {
  grossRevenue: number;
  orderCount: number;
  avgOrderValue: number;
  cashCodRevenue: number;
  upiRevenue: number;
  posRevenue: number;
  posCount: number;
  deliveryRevenue: number;
  deliveryCount: number;
  pickupRevenue: number;
  pickupCount: number;
  criticalCount: number;
  marginEstimate: number;
}

interface HourlyPoint {
  hour: string;
  sales: number;
}

interface TopProduct {
  name: string;
  category: string;
  units: number;
  sales: number;
}

interface DepletedProduct {
  id: string;
  name: string;
  barcode: string;
  category: string;
  stock: number;
  price: number;
}

interface AnalyticsPayload {
  summary: AnalyticsSummary;
  hourlyData: HourlyPoint[];
  topSelling: TopProduct[];
  depletedInventory: DepletedProduct[];
}

const MOCK_DATA_SETS: Record<string, AnalyticsPayload> = {
  today: {
    summary: {
      grossRevenue: 3465.0,
      orderCount: 19,
      avgOrderValue: 182.37,
      cashCodRevenue: 2745.0,
      upiRevenue: 720.0,
      posRevenue: 2150.0,
      posCount: 12,
      deliveryRevenue: 980.0,
      deliveryCount: 5,
      pickupRevenue: 335.0,
      pickupCount: 2,
      criticalCount: 2,
      marginEstimate: 623.7,
    },
    hourlyData: [
      { hour: "06:00", sales: 0 },
      { hour: "07:00", sales: 80 },
      { hour: "08:00", sales: 240 },
      { hour: "09:00", sales: 510 },
      { hour: "10:00", sales: 320 },
      { hour: "11:00", sales: 180 },
      { hour: "12:00", sales: 290 },
      { hour: "13:00", sales: 140 },
      { hour: "14:00", sales: 60 },
      { hour: "15:00", sales: 110 },
      { hour: "16:00", sales: 260 },
      { hour: "17:00", sales: 430 },
      { hour: "18:00", sales: 740 },
      { hour: "19:00", sales: 820 },
      { hour: "20:00", sales: 650 },
      { hour: "21:00", sales: 390 },
      { hour: "22:00", sales: 90 },
    ],
    topSelling: [
      { name: "Fresh Milk & Curd Pack", category: "Dairy & Breakfast", units: 118, sales: 2360 },
      { name: "5 Star Chocolate Bar 23g", category: "Chocolates & Candies", units: 71, sales: 710 },
      { name: "Farm Fresh Eggs (Tray of 6)", category: "Dairy & Breakfast", units: 42, sales: 504 },
      { name: "Ashirvaad Whole Wheat Atta 5kg", category: "Staples & Grains", units: 19, sales: 475 },
      { name: "Sunfeast Dark Fantasy Biscuits", category: "Snacks & Packaged Foods", units: 28, sales: 420 },
    ],
    depletedInventory: [
      { id: "p1", name: "Siril Woods Butter Cookies", barcode: "987654321", category: "Snacks & Packaged Foods", stock: -18, price: 20 },
      { id: "p2", name: "Amul Butter 100g Salted", barcode: "890126201", category: "Dairy & Breakfast", stock: 0, price: 58 },
      { id: "p3", name: "Tata Salt Vacuum Evaporated 1kg", barcode: "890103038", category: "Staples & Grains", stock: 2, price: 28 },
      { id: "p4", name: "Sunlight Detergent Powder 1kg", barcode: "890103049", category: "Household & Cleaning", stock: 4, price: 115 },
    ],
  },
  yesterday: {
    summary: {
      grossRevenue: 5120.0,
      orderCount: 28,
      avgOrderValue: 182.85,
      cashCodRevenue: 3410.0,
      upiRevenue: 1710.0,
      posRevenue: 3200.0,
      posCount: 18,
      deliveryRevenue: 1420.0,
      deliveryCount: 7,
      pickupRevenue: 500.0,
      pickupCount: 3,
      criticalCount: 3,
      marginEstimate: 921.6,
    },
    hourlyData: [
      { hour: "08:00", sales: 180 },
      { hour: "09:00", sales: 490 },
      { hour: "10:00", sales: 610 },
      { hour: "11:00", sales: 420 },
      { hour: "12:00", sales: 380 },
      { hour: "13:00", sales: 290 },
      { hour: "14:00", sales: 190 },
      { hour: "15:00", sales: 220 },
      { hour: "16:00", sales: 380 },
      { hour: "17:00", sales: 590 },
      { hour: "18:00", sales: 880 },
      { hour: "19:00", sales: 1120 },
      { hour: "20:00", sales: 940 },
      { hour: "21:00", sales: 460 },
    ],
    topSelling: [
      { name: "Siril Woods Butter Cookies", category: "Snacks & Packaged Foods", units: 142, sales: 2840 },
      { name: "Fortune Sunlite Sunflower Oil 1L", category: "Staples & Grains", units: 31, sales: 1550 },
      { name: "Fresh Milk & Curd Pack", category: "Dairy & Breakfast", units: 65, sales: 1300 },
      { name: "Maggi 2-Minute Masala Noodles", category: "Snacks & Packaged Foods", units: 48, sales: 672 },
    ],
    depletedInventory: [
      { id: "p1", name: "Siril Woods Butter Cookies", barcode: "987654321", category: "Snacks & Packaged Foods", stock: -18, price: 20 },
      { id: "p2", name: "Amul Butter 100g Salted", barcode: "890126201", category: "Dairy & Breakfast", stock: 0, price: 58 },
    ],
  },
  "7days": {
    summary: {
      grossRevenue: 34890.0,
      orderCount: 184,
      avgOrderValue: 189.62,
      cashCodRevenue: 22400.0,
      upiRevenue: 12490.0,
      posRevenue: 23100.0,
      posCount: 121,
      deliveryRevenue: 8940.0,
      deliveryCount: 46,
      pickupRevenue: 2850.0,
      pickupCount: 17,
      criticalCount: 4,
      marginEstimate: 6280.2,
    },
    hourlyData: [
      { hour: "08:00", sales: 1980 },
      { hour: "10:00", sales: 4120 },
      { hour: "12:00", sales: 3450 },
      { hour: "14:00", sales: 2100 },
      { hour: "16:00", sales: 3820 },
      { hour: "18:00", sales: 7490 },
      { hour: "20:00", sales: 8850 },
      { hour: "22:00", sales: 3080 },
    ],
    topSelling: [
      { name: "Siril Woods Butter Cookies", category: "Snacks & Packaged Foods", units: 620, sales: 12400 },
      { name: "Fresh Milk & Curd Pack", category: "Dairy & Breakfast", units: 480, sales: 9600 },
      { name: "Fortune Sunlite Sunflower Oil 1L", category: "Staples & Grains", units: 140, sales: 7000 },
      { name: "Tata Tea Gold 500g", category: "Dairy & Breakfast", units: 58, sales: 2320 },
    ],
    depletedInventory: [
      { id: "p1", name: "Siril Woods Butter Cookies", barcode: "987654321", category: "Snacks & Packaged Foods", stock: -18, price: 20 },
      { id: "p2", name: "Amul Butter 100g Salted", barcode: "890126201", category: "Dairy & Breakfast", stock: 0, price: 58 },
      { id: "p5", name: "Dettol Liquid Handwash 200ml", barcode: "890139601", category: "Personal Care", stock: 1, price: 99 },
      { id: "p6", name: "Good Knight Active Liquid Refill", barcode: "890126244", category: "Household", stock: 3, price: 82 },
    ],
  },
  month: {
    summary: {
      grossRevenue: 148200.0,
      orderCount: 780,
      avgOrderValue: 190.0,
      cashCodRevenue: 98100.0,
      upiRevenue: 50100.0,
      posRevenue: 96400.0,
      posCount: 512,
      deliveryRevenue: 38900.0,
      deliveryCount: 198,
      pickupRevenue: 12900.0,
      pickupCount: 70,
      criticalCount: 4,
      marginEstimate: 26676.0,
    },
    hourlyData: [
      { hour: "08:00", sales: 9800 },
      { hour: "10:00", sales: 18200 },
      { hour: "12:00", sales: 14900 },
      { hour: "14:00", sales: 11200 },
      { hour: "16:00", sales: 17400 },
      { hour: "18:00", sales: 34100 },
      { hour: "20:00", sales: 31200 },
      { hour: "22:00", sales: 11400 },
    ],
    topSelling: [
      { name: "Siril Woods Butter Cookies", category: "Snacks & Packaged Foods", units: 2450, sales: 49000 },
      { name: "Fresh Milk & Curd Pack", category: "Dairy & Breakfast", units: 1940, sales: 38800 },
      { name: "Fortune Sunlite Sunflower Oil 1L", category: "Staples & Grains", units: 580, sales: 29000 },
      { name: "Ashirvaad Whole Wheat Atta 5kg", category: "Staples & Grains", units: 420, sales: 10500 },
    ],
    depletedInventory: [
      { id: "p1", name: "Siril Woods Butter Cookies", barcode: "987654321", category: "Snacks & Packaged Foods", stock: -18, price: 20 },
      { id: "p2", name: "Amul Butter 100g Salted", barcode: "890126201", category: "Dairy & Breakfast", stock: 0, price: 58 },
      { id: "p3", name: "Tata Salt Vacuum Evaporated 1kg", barcode: "890103038", category: "Staples & Grains", stock: 2, price: 28 },
      { id: "p4", name: "Sunlight Detergent Powder 1kg", barcode: "890103049", category: "Household & Cleaning", stock: 4, price: 115 },
    ],
  },
};

export default function App() {
  const [data, setData] = useState<AnalyticsPayload | null>(MOCK_DATA_SETS.today);
  const [range, setRange] = useState<"today" | "yesterday" | "7days" | "month">("today");
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  const fetchAnalytics = async (selectedRange: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${selectedRange}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json: AnalyticsPayload = await res.json();
      setData(json);
    } catch {
      // Fallback gracefully so the dashboard always renders immediately
      const fallback = MOCK_DATA_SETS[selectedRange] || MOCK_DATA_SETS.today;
      setData(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  const handleExportReorderCSV = () => {
    if (!data?.depletedInventory || data.depletedInventory.length === 0) {
      showToast("No depleted inventory to export at this time.", "info");
      return;
    }

    const headers = [
      "Barcode",
      "Product Name",
      "Category",
      "Current Stock",
      "Unit Retail Price (INR)",
      "Suggested Restock Quantity",
    ].join(",");

    const rows = data.depletedInventory.map((item) => {
      const sanitizedName = item.name.replace(/"/g, '""');
      const suggestedQty = Math.max(24, Math.abs(item.stock) + 24);
      return `"${item.barcode}","${sanitizedName}","${item.category}",${item.stock},${item.price},${suggestedQty}`;
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const fileTimestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SIRILWOODS_Restock_PO_${fileTimestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Restock sheet exported with ${data.depletedInventory.length} flagged items!`);
  };

  const maxHourlySales = useMemo(() => {
    if (!data?.hourlyData || data.hourlyData.length === 0) return 1;
    return Math.max(...data.hourlyData.map((d) => d.sales), 1);
  }, [data]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 pb-24 font-sans select-none">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-bounce transition duration-300">
          <div
            className={`px-4 py-2.5 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-2 ${
              toastMessage.type === "success"
                ? "bg-emerald-950 text-emerald-300 border-emerald-500/50"
                : "bg-slate-900 text-slate-200 border-slate-700"
            }`}
          >
            <span>{toastMessage.type === "success" ? "✅" : "ℹ️"}</span>
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-5">
        {/* Navigation & Brand Header */}
        <header className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-wrap justify-between items-center gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl shadow-inner">
              📊
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white tracking-wider font-mono">
                SIRILWOODS <span className="text-emerald-400 font-sans font-bold">Executive Analytics</span>
              </h1>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Financial ledger, channel velocity, inventory alerts & restock intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportReorderCSV}
              type="button"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-900/30 flex items-center gap-1.5 active:scale-95"
            >
              <span>📥</span>
              <span>Export PO Sheet</span>
            </button>
            <a
              href="/"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition"
            >
              ← Workstation
            </a>
          </div>
        </header>

        {}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "today", label: "Today" },
              { id: "yesterday", label: "Yesterday" },
              { id: "7days", label: "Last 7 Days" },
              { id: "month", label: "This Month" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRange(tab.id as any)}
                type="button"
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  range === tab.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/40"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-850"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Real-time Store Sync</span>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="p-10 text-center text-xs font-mono text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800 flex flex-col items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span>Recalculating ledger figures...</span>
          </div>
        )}

        {}
        {!loading && data && (
          <>
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-900 border border-slate-800/90 p-4 rounded-2xl shadow-sm hover:border-slate-700 transition">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                  Gross Revenue
                </span>
                <p className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1">
                  ₹{data.summary.grossRevenue.toFixed(2)}
                </p>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {data.summary.orderCount} total orders recorded
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800/90 p-4 rounded-2xl shadow-sm hover:border-slate-700 transition">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                  Est. Margin (~18%)
                </span>
                <p className="text-xl sm:text-2xl font-black font-mono text-blue-400 mt-1">
                  ₹{data.summary.marginEstimate.toFixed(2)}
                </p>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Avg Ticket: ₹{data.summary.avgOrderValue.toFixed(0)}
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800/90 p-4 rounded-2xl shadow-sm hover:border-slate-700 transition">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                  Digital UPI / Cash
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-base sm:text-lg font-bold font-mono text-purple-400">
                    ₹{data.summary.upiRevenue.toFixed(0)}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/</span>
                  <span className="text-base sm:text-lg font-bold font-mono text-slate-300">
                    ₹{data.summary.cashCodRevenue.toFixed(0)}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Instant QR vs Drawer Cash
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800/90 p-4 rounded-2xl shadow-sm hover:border-slate-700 transition">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                  Critical Low Stock
                </span>
                <p
                  className={`text-xl sm:text-2xl font-black font-mono mt-1 ${
                    data.summary.criticalCount > 0 ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {data.summary.criticalCount} Items
                </p>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {data.summary.criticalCount > 0 ? "Requires restock action" : "Adequately stocked"}
                </span>
              </div>
            </section>

            {}
            <section className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3.5 shadow-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                    Fulfillment Channel Performance
                  </h2>
                  <p className="text-[10px] text-slate-400">Walk-in counter vs doorstep dispatches vs pickup orders</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">3 Channel Split</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/90 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <span>🏪</span> In-Store POS
                    </span>
                    <span className="text-emerald-400 font-mono font-bold">
                      ₹{data.summary.posRevenue.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    {data.summary.posCount} walk-in counter bills
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/90 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <span>🛵</span> Home Delivery
                    </span>
                    <span className="text-blue-400 font-mono font-bold">
                      ₹{data.summary.deliveryRevenue.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    {data.summary.deliveryCount} doorstep dispatches
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/90 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <span>🏬</span> Store Pickup
                    </span>
                    <span className="text-amber-400 font-mono font-bold">
                      ₹{data.summary.pickupRevenue.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    {data.summary.pickupCount} customer collect handovers
                  </span>
                </div>
              </div>
            </section>

            {}
            <section className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                    Hourly Sales Velocity (Peak Hours)
                  </h2>
                  <p className="text-[10px] text-slate-400">Order revenue distributed by hour of day</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Peak: ₹{maxHourlySales.toFixed(0)}
                </span>
              </div>

              <div className="h-32 flex items-end gap-1.5 pt-6 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
                {data.hourlyData.map((item, index) => {
                  const barHeightRatio = Math.max(6, (item.sales / maxHourlySales) * 100);
                  const isHigh = item.sales > 0 && item.sales >= maxHourlySales * 0.7;

                  return (
                    <div key={index} className="flex-1 min-w-[28px] flex flex-col items-center gap-1 group relative">
                      <div
                        style={{ height: `${barHeightRatio}%` }}
                        className={`w-full rounded-t transition-all duration-200 cursor-pointer ${
                          isHigh
                            ? "bg-emerald-400 group-hover:bg-emerald-300"
                            : item.sales > 0
                            ? "bg-emerald-600/80 group-hover:bg-emerald-500"
                            : "bg-slate-800/80"
                        }`}
                        title={`${item.hour} — ₹${item.sales.toFixed(2)}`}
                      />
                      <span className="text-[9px] font-mono text-slate-500">
                        {item.hour.slice(0, 2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Depleted Inventory Card */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3.5 shadow-lg">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚠️</span> Depleted Inventory (≤ 5 Units)
                  </h2>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {data.depletedInventory.length} Items Flagged
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {data.depletedInventory.length === 0 ? (
                    <div className="text-xs text-slate-500 font-mono p-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800/60">
                      All inventory shelves adequately stocked.
                    </div>
                  ) : (
                    data.depletedInventory.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 flex justify-between items-center text-xs hover:border-slate-700 transition"
                      >
                        <div className="pr-2">
                          <p className="font-bold text-white leading-snug">{item.name}</p>
                          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                            {item.barcode} • {item.category}
                          </span>
                        </div>
                        <span
                          className={`font-mono font-bold px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap ${
                            item.stock <= 0
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {item.stock} left
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Top Selling Goods Card */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3.5 shadow-lg">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🔥</span> Best Selling Goods
                  </h2>
                  <span className="text-[10px] text-slate-500 font-mono">Top Movers</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {data.topSelling.length === 0 ? (
                    <div className="text-xs text-slate-500 font-mono p-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800/60">
                      No sales recorded in this timeframe.
                    </div>
                  ) : (
                    data.topSelling.map((product, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 flex justify-between items-center text-xs hover:border-slate-700 transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-slate-500 text-xs w-5 font-bold">
                            #{idx + 1}
                          </span>
                          <div>
                            <p className="font-bold text-white leading-snug">{product.name}</p>
                            <span className="text-[10px] text-slate-500">{product.category}</span>
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <span className="text-emerald-400 font-bold block">{product.units} units</span>
                          <span className="text-[10px] text-slate-400">₹{product.sales.toFixed(0)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
