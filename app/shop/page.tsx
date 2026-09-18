"use client";

import { useState, useEffect } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/shop/products");
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const found = prev.find((item) => item.product.id === product.id);
      if (found) {
        if (found.quantity + 1 > product.stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === id) {
            const nextQty = item.quantity + delta;
            if (nextQty > item.product.stock) return item;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !address.trim() || !phone.trim()) return;

    setOrderSubmitting(true);
    try {
      const res = await fetch("/api/shop/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
          totalAmount: total,
          deliveryAddress: address,
          phone,
        }),
      });

      if (!res.ok) throw new Error("Order creation failed");

      const data = await res.json();
      setOrderSuccess(data.orderId);
      setCart([]);
      setAddress("");
      setPhone("");
      fetchProducts(); // Refresh stocks
    } catch (err: any) {
      alert(err.message || "Failed to place order.");
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-blue-600">Nag Supermarket</h1>
          <p className="text-xs text-slate-500">Fresh groceries delivered directly to your doorstep</p>
        </div>
        <button
          onClick={() => setCartOpen(true)}
          className="relative bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition flex items-center gap-2"
        >
          <span>🛒 Cart</span>
          {cart.length > 0 && (
            <span className="bg-emerald-400 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </button>
      </header>

      {/* Confirmation Banner */}
      {orderSuccess && (
        <div className="max-w-6xl mx-auto m-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex justify-between items-center">
          <div>
            <p className="font-semibold text-sm">Order placed successfully! ID: #{orderSuccess.slice(-6).toUpperCase()}</p>
            <p className="text-xs text-emerald-600">Our delivery team is preparing your package.</p>
          </div>
          <button
            onClick={() => setOrderSuccess(null)}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Product Catalog Grid */}
      <main className="max-w-6xl mx-auto p-4 sm:p-8">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Available Items</h2>
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Loading grocery items...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">No items in the store right now. Check back soon!</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((product) => {
              const inCart = cart.find((i) => i.product.id === product.id);
              return (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      {product.category}
                    </span>
                    <h3 className="font-semibold text-slate-900 text-sm leading-tight line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-emerald-600 font-bold font-mono text-base mt-2">
                      ₹{product.price.toFixed(2)}
                    </p>
                    <span className="text-xs text-slate-400 block mt-1">
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    {product.stock === 0 ? (
                      <button disabled className="w-full bg-slate-100 text-slate-400 text-xs py-2 rounded-lg cursor-not-allowed">
                        Sold Out
                      </button>
                    ) : inCart ? (
                      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="text-blue-600 hover:text-blue-800 font-bold px-2"
                        >
                          -
                        </button>
                        <span className="text-xs font-semibold text-blue-900">{inCart.quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="text-blue-600 hover:text-blue-800 font-bold px-2"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition"
                      >
                        + Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6">
            <div>
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h3 className="text-lg font-bold text-slate-900">Your Basket</h3>
                <button
                  onClick={() => setCartOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg"
                >
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-center py-12 text-slate-400 text-sm">Your cart is empty.</p>
              ) : (
                <div className="max-h-[35vh] overflow-y-auto divide-y divide-slate-100 pr-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="py-3 flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">{item.product.name}</h4>
                        <span className="text-xs text-slate-400">₹{item.product.price.toFixed(2)} each</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="border w-6 h-6 rounded flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="border w-6 h-6 rounded flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checkout Form */}
            {cart.length > 0 && (
              <form onSubmit={handleCheckout} className="space-y-4 border-t pt-4">
                <div className="flex justify-between text-base font-bold text-slate-900">
                  <span>Total Amount</span>
                  <span className="font-mono text-emerald-600">₹{total.toFixed(2)}</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Delivery Address
                  </label>
                  <textarea
                    required
                    placeholder="House/Street, Landmark, City..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={orderSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition text-sm disabled:opacity-50"
                >
                  {orderSubmitting ? "Placing Order..." : "Confirm Delivery Order (Cash on Delivery)"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
      }
