"use client";

import { useState, useRef, useEffect } from "react";

type Product = {
  id: string;
  name: string;
  barcode: string;
  price: number;
  stock: number;
};

type CartItem = {
  product: Product;
  quantity: number;
};

export default function PosTerminal() {
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cashTendered, setCashTendered] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [cart]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/pos/scan?barcode=${encodeURIComponent(barcode.trim())}`);
      if (!res.ok) {
        throw new Error("Item not found or out of stock.");
      }
      const product: Product = await res.json();

      setCart((prevCart) => {
        const existing = prevCart.find((item) => item.product.id === product.id);
        if (existing) {
          if (existing.quantity + 1 > product.stock) {
            setError(`Cannot add more. Only ${product.stock} available.`);
            return prevCart;
          }
          return prevCart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          if (product.stock < 1) {
            setError(`${product.name} is completely out of stock.`);
            return prevCart;
          }
          return [...prevCart, { product, quantity: 1 }];
        }
      });
      setBarcode("");
    } catch (err: any) {
      setError(err.message || "Failed to scan item.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === id) {
            const nextQty = item.quantity + delta;
            if (nextQty > item.product.stock) {
              setError(`Max stock limit reached for ${item.product.name}`);
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const tendered = parseFloat(cashTendered) || 0;
  const change = Math.max(0, tendered - total);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/pos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((c) => ({
            productId: c.product.id,
            quantity: c.quantity,
            price: c.product.price,
          })),
          totalAmount: total,
        }),
      });

      if (!res.ok) {
        throw new Error("Checkout failed. Check stock levels.");
      }

      setSuccessMsg(`Order complete! Total: ₹${total.toFixed(2)} | Change: ₹${change.toFixed(2)}`);
      setCart([]);
      setCashTendered("");
    } catch (err: any) {
      setError(err.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Left: Barcode Scanner & Cart Items */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            🛒 POS Counter Terminal
          </h1>
          <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-mono">
            SALES BOY ONLINE
          </span>
        </div>

        {/* Barcode Input Form */}
        <form onSubmit={handleScan} className="flex gap-2 mb-4">
          <input
            ref={inputRef}
            type="text"
            placeholder="Scan barcode gun or enter SKU..."
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-50 text-sm"
          >
            {loading ? "..." : "Add"}
          </button>
        </form>

        {error && (
          <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-sm px-4 py-2.5 rounded-xl mb-4">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm px-4 py-2.5 rounded-xl mb-4">
            {successMsg}
          </div>
        )}

        {/* Current Sale Table */}
        <div className="flex-1 bg-slate-800/60 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="overflow-y-auto flex-1 p-4">
            {cart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Ready to scan products...
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase font-medium">
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3 text-center">Qty</th>
                    <th className="pb-3 text-right">Subtotal</th>
                    <th className="pb-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {cart.map((item) => (
                    <tr key={item.product.id}>
                      <td className="py-3 font-medium text-white">{item.product.name}</td>
                      <td className="py-3 text-slate-400">₹{item.product.price.toFixed(2)}</td>
                      <td className="py-3 text-center">
                        <div className="inline-flex items-center gap-2 bg-slate-700 rounded-lg px-2 py-1">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="text-slate-300 hover:text-white px-1.5 font-bold"
                          >
                            -
                          </button>
                          <span className="font-mono text-sm w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="text-slate-300 hover:text-white px-1.5 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3 text-right font-mono text-white">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-red-400 hover:text-red-300 text-xs ml-3"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Right: Summary & Tender Panel */}
      <div className="w-full md:w-96 bg-slate-800 border-t md:border-t-0 md:border-l border-slate-700 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-white mb-6">Payment Summary</h2>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-slate-400 text-sm">
              <span>Total Items</span>
              <span className="font-mono text-white">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <div className="flex justify-between text-xl font-bold text-white pt-4 border-t border-slate-700">
              <span>Grand Total</span>
              <span className="font-mono text-emerald-400">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Cash Tender Calculation */}
          <div className="space-y-3 pt-4 border-t border-slate-700">
            <label className="block text-xs uppercase font-semibold text-slate-400">
              Cash Tendered (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 500"
              value={cashTendered}
              onChange={(e) => setCashTendered(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {tendered > 0 && (
              <div className="flex justify-between text-sm pt-2">
                <span className="text-slate-400">Return Change:</span>
                <span className={`font-mono font-bold ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  ₹{change.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 pt-6">
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3.5 rounded-xl transition shadow-lg disabled:opacity-40"
          >
            {loading ? "Processing..." : "Complete Sale & Deduct Stock"}
          </button>
          <button
            onClick={() => {
              setCart([]);
              setCashTendered("");
            }}
            disabled={cart.length === 0}
            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium py-2 rounded-xl transition"
          >
            Clear Sale
          </button>
        </div>
      </div>
    </div>
  );
}
