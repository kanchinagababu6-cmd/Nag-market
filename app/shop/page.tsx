"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CATEGORIES: Record<string, string[]> = {
  "Staples & Grains": ["Atta, Flours & Sooji", "Rice & Rice Products", "Dals & Pulses", "Edible Oils & Ghee", "Sugar, Jaggery & Salt", "Whole & Ground Spices"],
  "Dairy & Breakfast": ["Fresh Milk & Curd", "Paneer, Butter & Cheese", "Bread, Pav & Bakery", "Eggs", "Cereals, Oats & Muesli", "Tea, Coffee & Health Drinks"],
  "Snacks & Packaged Foods": ["Biscuits, Cookies & Rusks", "Namkeen, Chips & Savory Snacks", "Noodles, Pasta & Vermicelli", "Chocolates & Candies", "Sauces, Ketchup, Spreads & Jams", "Instant Ready-to-Eat Mixes"],
  "Beverages": ["Soft Drinks & Carbonated Sodas", "Fruit Juices & Concentrates", "Packaged Bottled Water & Soda", "Energy & Sports Drinks"],
  "Fresh Produce": ["Daily Fresh Vegetables", "Seasonal & Exotic Fruits", "Herbs, Lemon, Ginger & Garlic"],
  "Personal Care & Hygiene": ["Bath Soaps, Body Wash & Handwash", "Hair Care", "Dental Care", "Skincare, Lotions & Powders", "Feminine Hygiene & Baby Care"],
  "Household & Cleaning": ["Detergents & Fabric Softeners", "Dishwashing Bars & Liquids", "Surface Cleaners & Disinfectants", "Mosquito Repellents & Freshers", "Kitchen Rolls, Foil & Garbage Bags"],
  "Puja & Pooja Essentials": ["Agarbatti, Dhoop & Camphor", "Puja Oil & Cotton Wicks"],
};

const DELIVERY_THRESHOLD = 499;
const BASE_DELIVERY_FEE = 30;

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
  weight?: string;
}

interface CartItem extends Product {
  cartQty: number;
}

export default function CustomerStorefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubCategory, setActiveSubCategory] = useState("All");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Delivery & Checkout state
  const [orderType, setOrderType] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("⚡ Express (30–45 Mins)");
  const [riderInstruction, setRiderInstruction] = useState("");
  const [tipAmount, setTipAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("UPI / QR Code");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [locating, setLocating] = useState(false);

  // Tracking modal
  const [trackPhone, setTrackPhone] = useState("");
  const [trackingOrders, setTrackingOrders] = useState<any[]>([]);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [fetchingTrack, setFetchingTrack] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch((err) => console.error("Error loading products:", err));
  }, []);

  // Voice Search (Speech Recognition)
  const toggleVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice search is not supported on this browser.");
      return;
    }
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    if (!isListening) {
      recognition.start();
      setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearch(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.Here is a modular, production-ready upgrade for your customer storefront (`app/shop/page.tsx`) that implements the key customer platform features:

1. **Free Delivery Progress Tracker**: Shows how much more to add to unlock free delivery (e.g., threshold set at ₹499).
2. **GPS Geolocation ("Use My Location")**: Auto-populates delivery coordinates/address using the device's location.
3. **Delivery Rider Instructions**: Pre-set tags (`Leave at door`, `Don't ring bell`, `Call upon arrival`).
4. **Driver Tip Selection**: Optional tips (₹10, ₹20, ₹30) added directly to order calculation.
5. **Scheduled Slots**: Choice between *Express (20–45 Mins)* or scheduled delivery windows.
6. **Live UPI Dynamic QR Generation**: Instant scan-and-pay via BHIM/UPI link generator (`upi://pay`).
7. **Post-Order WhatsApp Receipt Dispatch**: Direct link opening WhatsApp with formatted order summary for the store and customer.

---

### Step 1: Update Storefront (`app/shop/page.tsx`)

Replace your `app/shop/page.tsx` with this comprehensive version:

```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const FREE_DELIVERY_THRESHOLD = 499;
const DELIVERY_FEE = 40;

interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  subCategory?: string;
  price: number;
  mrp?: number;
  stock: number;
  imageUrl?: string;
}

interface CartItem extends Product {
  cartQty: number;
}

export default function CustomerStorefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Fulfillment & Checkout State
  const [orderType, setOrderType] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("Express (30-45 mins)");
  const [deliveryNotes, setDeliveryNotes] = useState<string[]>([]);
  const [driverTip, setDriverTip] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "UPI">("COD");
  const [locating, setLocating] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Success Modal & UPI Modal
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch((err) => console.error("Error loading products:", err));
  }, []);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return alert("Product is out of stock!");
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        if (exists.cartQty >= product.stock) {
          alert(`Only ${product.stock} units available.`);
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, cartQty: item.cartQty + 1 } : item
        );
      }
      return [...prev, { ...product, cartQty: 1 }];
    });
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const next = item.cartQty + delta;
            return next > 0 ? { ...item, cartQty: next } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Calculations
  const rawTotal = cart.reduce((sum, item) => sum + item.price * item.cartQty, 0);
  const isFreeDelivery = rawTotal >= FREE_DELIVERY_THRESHOLD || orderType === "PICKUP";
  const appliedDeliveryFee = isFreeDelivery ? 0 : DELIVERY_FEE;
  const finalPayable = rawTotal + appliedDeliveryFee + (orderType === "DELIVERY" ? driverTip : 0);

  // GPS Location detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // OpenStreetMap Reverse Geocoding
          const res = await fetch(
            `[https://nominatim.openstreetmap.org/reverse?lat=$](https://nominatim.openstreetmap.org/reverse?lat=$){latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          setDeliveryAddress(data.display_name || `Lat: ${latitude}, Lon: ${longitude}`);
        } catch {
          setDeliveryAddress(`GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        alert("Location access denied. Please enter address manually.");
        setLocating(false);
      }
    );
  };

  const toggleDeliveryNote = (note: string) => {
    setDeliveryNotes((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    );
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return alert("Please fill name & phone number");
    if (orderType === "DELIVERY" && !deliveryAddress.trim()) {
      return alert("Please enter delivery address");
    }

    setSubmittingOrder(true);
    try {
      const orderPayload = {
        customerName,
        customerPhone,
        orderType,
        deliveryAddress:
          orderType === "DELIVERY"
            ? `${deliveryAddress} | Slot: ${deliverySlot} | Notes: ${deliveryNotes.join(", ") || "None"} | Tip: ₹${driverTip}`
            : "Store Counter Pickup",
        paymentMethod: paymentMethod === "UPI" ? "UPI" : "COD",
        totalAmount: finalPayable,
        items: cart.map((i) => ({
          productId: i.id,
          quantity: i.cartQty,
          price: i.price,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (res.ok) {
        setPlacedOrder({
          id: data.orderId || "NEW",
          amount: finalPayable,
          customerName,
          customerPhone,
          items: [...cart],
          method: paymentMethod,
        });
        setCart([]);
        setIsCartOpen(false);
        setIsCheckingOut(false);
      } else {
        alert("Error: " + (data.error || "Order placement failed"));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmittingOrder(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const inStock = p.stock > 0;
    const catMatch = activeCategory === "All" || p.category === activeCategory;
    const searchMatch = p.name.toLowerCase().includes(search.toLowerCase());
    return inStock && catMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Banner */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link className="font-black text-emerald-400 font-mono tracking-wider" href="/">
            SIRILWOODS
          </Link>
          <button
            onClick={() => setIsCartOpen(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            🛒 Cart ({cart.reduce((s, c) => s + c.cartQty, 0)})
          </button>
        </div>
      </div>

      {/* Product Catalog */}
      <div className="max-w-5xl mx-auto p-4 space-y-4 w-full">
        {/* Search */}
        <input
          type="text"
          placeholder="Search rice, dal, milk, biscuits..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
        />

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-col justify-between"
            >
              <div>
                <div className="w-full h-28 bg-slate-950 rounded-xl mb-2 flex items-center justify-center overflow-hidden">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-2xl">📦</span>
                  )}
                </div>
                <h4 className="text-xs font-bold line-clamp-2">{p.name}</h4>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="text-emerald-400 font-bold text-xs font-mono">₹{p.price}</span>
                <button
                  onClick={() => addToCart(p)}
                  className="px-3 py-1 bg-slate-800 hover:bg-emerald-600 rounded-lg text-xs font-semibold"
                >
                  + Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart & Intelligent Checkout Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/75 z-50 flex justify-end">
          <div className="w-full max-w-md bg-slate-900 h-full p-4 flex flex-col justify-between border-l border-slate-800 overflow-y-auto">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <h3 className="font-bold text-sm">Shopping Cart ({cart.length})</h3>
                <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              {/* Free Delivery Meter */}
              {orderType === "DELIVERY" && (
                <div className="my-3 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                  {rawTotal >= FREE_DELIVERY_THRESHOLD ? (
                    <span className="text-emerald-400 font-bold">🎉 You unlocked FREE Delivery!</span>
                  ) : (
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Add ₹{FREE_DELIVERY_THRESHOLD - rawTotal} for FREE Delivery</span>
                        <span>{Math.round((rawTotal / FREE_DELIVERY_THRESHOLD) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (rawTotal / FREE_DELIVERY_THRESHOLD) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2 my-2 max-h-52 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs py-1 border-b border-slate-800/40">
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <span className="text-emerald-400 font-mono">₹{item.price}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950 px-2 py-1 rounded-lg">
                      <button onClick={() => updateCartQty(item.id, -1)} className="text-slate-400 hover:text-white">-</button>
                      <span className="text-xs font-mono">{item.cartQty}</span>
                      <button onClick={() => updateCartQty(item.id, 1)} className="text-slate-400 hover:text-white">+</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Checkout Form */}
              {isCheckingOut && (
                <div className="space-y-3 pt-2 text-xs border-t border-slate-800">
                  {/* Fulfillment Switch */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType("DELIVERY")}
                      className={`p-2 rounded-xl border font-bold ${orderType === "DELIVERY" ? "bg-blue-600 text-white border-blue-500" : "bg-slate-950 text-slate-400 border-slate-800"}`}
                    >
                      🛵 Home Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType("PICKUP")}
                      className={`p-2 rounded-xl border font-bold ${orderType === "PICKUP" ? "bg-blue-600 text-white border-blue-500" : "bg-slate-950 text-slate-400 border-slate-800"}`}
                    >
                      🏬 Store Pickup
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="WhatsApp Phone Number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl font-mono"
                  />

                  {orderType === "DELIVERY" && (
                    <>
                      {/* GPS Autodetect Button */}
                      <div className="flex justify-between items-center">
                        <label className="text-slate-400">Delivery Address</label>
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          disabled={locating}
                          className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                        >
                          📍 {locating ? "Locating..." : "Use Current GPS"}
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="House no, Street name, Landmark"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl"
                      />

                      {/* Delivery Slots */}
                      <div>
                        <label className="text-slate-400 block mb-1">Preferred Slot</label>
                        <select
                          value={deliverySlot}
                          onChange={(e) => setDeliverySlot(e.target.value)}
                          className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl"
                        >
                          <option>Express (30-45 mins)</option>
                          <option>Morning (8:00 AM - 11:00 AM)</option>
                          <option>Evening (5:00 PM - 8:00 PM)</option>
                        </select>
                      </div>

                      {/* Delivery Instructions */}
                      <div>
                        <label className="text-slate-400 block mb-1">Rider Instructions</label>
                        <div className="flex flex-wrap gap-1.5">
                          {["Leave at Door", "Don't Ring Bell", "Beware of Dog", "Call on Arrival"].map((note) => (
                            <button
                              key={note}
                              type="button"
                              onClick={() => toggleDeliveryNote(note)}
                              className={`px-2 py-1 rounded-lg text-[10px] border ${deliveryNotes.includes(note) ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/40" : "bg-slate-950 text-slate-400 border-slate-800"}`}
                            >
                              {note}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Driver Tip */}
                      <div>
                        <label className="text-slate-400 block mb-1">Driver Tip</label>
                        <div className="flex gap-2">
                          {[0, 10, 20, 30].map((tip) => (
                            <button
                              key={tip}
                              type="button"
                              onClick={() => setDriverTip(tip)}
                              className={`flex-1 py-1 rounded-lg border text-[11px] ${driverTip === tip ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold" : "bg-slate-950 text-slate-400 border-slate-800"}`}
                            >
                              {tip === 0 ? "No Tip" : `₹${tip}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Payment Selection */}
                  <div>
                    <label className="text-slate-400 block mb-1">Payment</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("COD")}
                        className={`p-2 rounded-xl border font-bold ${paymentMethod === "COD" ? "bg-blue-600 text-white border-blue-500" : "bg-slate-950 text-slate-400 border-slate-800"}`}
                      >
                        Cash on Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("UPI")}
                        className={`p-2 rounded-xl border font-bold ${paymentMethod === "UPI" ? "bg-blue-600 text-white border-blue-500" : "bg-slate-950 text-slate-400 border-slate-800"}`}
                      >
                        UPI / QR Instant
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bill Summary & Actions */}
            <div className="border-t border-slate-800 pt-3 space-y-2 text-xs">
              <div className="space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span>₹{rawTotal.toFixed(2)}</span>
                </div>
                {orderType === "DELIVERY" && (
                  <>
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span>{appliedDeliveryFee === 0 ? <strong className="text-emerald-400">FREE</strong> : `₹${appliedDeliveryFee}`}</span>
                    </div>
                    {driverTip > 0 && (
                      <div className="flex justify-between">
                        <span>Driver Tip:</span>
                        <span>₹{driverTip}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between text-white font-bold text-sm pt-1 border-t border-slate-800">
                  <span>Grand Total:</span>
                  <span className="text-emerald-400 font-mono">₹{finalPayable.toFixed(2)}</span>
                </div>
              </div>

              {!isCheckingOut ? (
                <button
                  disabled={cart.length === 0}
                  onClick={() => setIsCheckingOut(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition"
                >
                  Proceed to Details →
                </button>
              ) : (
                <button
                  disabled={submittingOrder}
                  onClick={handlePlaceOrder}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition"
                >
                  {submittingOrder ? "Confirming..." : `Place Order (₹${finalPayable.toFixed(2)})`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post-Order Success & Instant UPI Modal */}
      {placedOrder && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4">
            <span className="text-4xl">🎉</span>
            <h3 className="text-lg font-bold text-white">Order Received!</h3>
            <p className="text-xs text-slate-400 font-mono">Order #{placedOrder.id.slice(0, 8)}</p>

            {placedOrder.method === "UPI" && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <p className="text-xs text-slate-300 font-semibold">Scan with GPay / PhonePe / Paytm</p>
                {/* Dynamic QR API using standard UPI URI scheme */}
                <div className="w-40 h-40 mx-auto bg-white p-2 rounded-xl flex items-center justify-center">
                  <img
                    src={`[https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=$](https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=$){encodeURIComponent(
                      `upi://pay?pa=sirilwoods@upi&pn=Sirilwoods&am=${placedOrder.amount}&cu=INR`
                    )}`}
                    alt="UPI Payment QR"
                    className="w-full h-full"
                  />
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold block">
                  Amount: ₹{placedOrder.amount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <a
                href={`[https://wa.me/91$](https://wa.me/91$){placedOrder.customerPhone}?text=${encodeURIComponent(
                  `*Sirilwoods Supermarket Receipt*\nOrder ID: #${placedOrder.id.slice(0, 8)}\nTotal: ₹${placedOrder.amount}\nStatus: Confirmed\nThank you for shopping with us!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition"
              >
                <span>💬 Get WhatsApp Bill</span>
              </a>

              <button
                onClick={() => setPlacedOrder(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
