"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  subCategory: string;
  price: number;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentType, setPaymentType] = useState<"CASH" | "UPI">("CASH");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastBill, setLastBill] = useState<{ id: string; total: number } | null>(null);

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

  // Handle barcode input or Enter key
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matched = products.find(
      (p) => p.barcode.toLowerCase() === barcodeInput.trim().toLowerCase()
    );

    if (matched) {
      addItemToCart(matched);
      setBarcodeInput("");
    } else {
      alert("Barcode not recognized in inventory!");
    }
  };

  const addItemToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert("Item is out of stock!");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert("Maximum store stock reached in cart!");
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const totalBill = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerPhone ? `Counter Walk-in (${customerPhone})` : "Walk-in Customer",
          customerPhone: customerPhone || "0000000000",
          deliveryAddress: "Counter POS Store Pickup",
          paymentMethod: paymentType,
          items: cart,
          totalAmount: totalBill,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLastBill({ id: data.orderId, total: totalBill });
        setCart([]);
        setCustomerPhone("");
        fetchProducts(); // Refresh live stock counts
      } else {
        alert(data.error || "Failed to process sale");
      }
    } catch (err) {
      alert("Transaction failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-5">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white">⚡ Supermarket Counter POS Terminal</h1>
          <p className="text-xs text-slate-400">Scan barcodes, bill walk-in customers & instant stock deduction</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/products"
            className="text-xs px-3 py-1.5 bg-slate-800 text-blue-400 hover:text-white rounded-xl border border-slate-700"
          >
            + Restock / New Barcode
          </Link>
          <Link
            href="/"
            className="text-xs px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700"
          >
            ← Home
          </Link>
        </div>
      </div>

      {lastBill && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex justify-between items-center">
          <div>
            <strong>Receipt Generated!</strong> Bill ID: #{lastBill.id.slice(0, 8).toUpperCase()} | Total: ₹{lastBill.total.toFixed(2)}
          </div>
          <button onClick={() => window.print()} className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-semibold">
            🖨️ Print Receipt
          </button>
        </div>
      )}

      {/* Main Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Barcode Scanner & Quick Item Picker (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Barcode Scanner Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan or enter Barcode / SKU here..."
                autoFocus
                className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl"
              >
                Enter
              </button>
            </form>
          </div>

          {/* Quick-tap Items Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Quick Item Tap (Available Inventory)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[460px] overflow-y-auto">
              {products.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addItemToCart(item)}
                  disabled={item.stock <= 0}
                  className={`p-3 rounded-xl text-left border transition flex flex-col justify-between ${
                    item.stock > 0
                      ? "bg-slate-950 border-slate-800 hover:border-blue-500 hover:bg-slate-850"
                      : "bg-slate-950/40 border-slate-900 opacity-40 cursor-not-allowed"
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono text-slate-500">{item.barcode}</span>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{item.name}</h4>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-900">
                    <span className="font-mono text-xs font-bold text-emerald-400">₹{item.price.toFixed(2)}</span>
                    <span className="text-[10px] font-mono text-slate-400">Qty: {item.stock}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Active POS Cart & Billing Panel (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white">Current Customer Bill</h2>
              <button
                onClick={() => setCart([])}
                className="text-[11px] text-rose-400 hover:underline"
              >
                Clear Cart
              </button>
            </div>

            {/* Cart Items */}
            <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto my-3">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs font-mono">
                  Scan a barcode or tap an item to begin billing.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                    <div className="max-w-[170px]">
                      <h4 className="font-semibold text-white truncate">{item.name}</h4>
                      <span className="text-slate-400 font-mono">₹{item.price.toFixed(2)} each</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded bg-slate-800 text-white flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded bg-slate-800 text-white flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-mono text-xs font-bold text-emerald-400">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Checkout Controls */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex justify-between items-center font-mono">
              <span className="text-xs text-slate-400">Total Net Amount</span>
              <span className="text-xl font-black text-emerald-400">₹{totalBill.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="tel"
                placeholder="Customer Phone (WhatsApp bill)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="col-span-2 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none"
              />

              <button
                type="button"
                onClick={() => setPaymentType("CASH")}
                className={`py-2 rounded-xl text-xs font-semibold border transition ${
                  paymentType === "CASH"
                    ? "bg-blue-600 text-white border-blue-500"
                    : "bg-slate-950 text-slate-400 border-slate-800"
                }`}
              >
                💵 Cash Payment
              </button>

              <button
                type="button"
                onClick={() => setPaymentType("UPI")}
                className={`py-2 rounded-xl text-xs font-semibold border transition ${
                  paymentType === "UPI"
                    ? "bg-blue-600 text-white border-blue-500"
                    : "bg-slate-950 text-slate-400 border-slate-800"
                }`}
              >
                📱 QR / UPI Payment
              </button>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isProcessing}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition shadow"
            >
              {isProcessing ? "Processing Sale..." : `Charge & Complete Bill (₹${totalBill.toFixed(2)})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
