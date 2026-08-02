import  createFileRoute, , notFound, useNavigate from 'next/link';
import { useSuspenseQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Star, Share2, Check, ShoppingBag, Loader2, ChevronRight,
  ChevronLeft, Tag, Palette, X, Gift
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthContext } from "@/routes/__root";
import { getProductBySlug, placeOrder } from "@/lib/shop.functions";
import { validateReferralCode, createRazorpayOrder, verifyRazorpayPayment, getMyProfile } from "@/lib/courses.functions";

const INDIA_STATES: Record<string, string[]> = {
  // States
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati", "Rajahmundry", "Kakinada", "Kadapa", "Anantapur", "Kurnool"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Sivasagar", "Bongaigaon", "Goalpara"],
  "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia", "Ara", "Bihar Sharif", "Begusarai", "Katihar"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Jagdalpur", "Ambikapur", "Raigarh", "Dhamtari"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Mormugao", "Cuncolim"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Navsari", "Morbi", "Mehsana"],
  "Haryana": ["Faridabad", "Gurugram", "Panipat", "Ambala", "Hisar", "Rohtak", "Karnal", "Sonipat", "Yamunanagar", "Bhiwani", "Sirsa"],
  "Himachal Pradesh": ["Shimla", "Dharamsala", "Solan", "Mandi", "Kullu", "Hamirpur", "Una", "Bilaspur", "Chamba", "Palampur"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Phusro", "Hazaribagh", "Giridih", "Ramgarh", "Medininagar"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi", "Kalaburagi", "Davanagere", "Ballari", "Vijayapura", "Shivamogga", "Tumakuru"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Malappuram", "Kannur", "Kollam", "Palakkad", "Alappuzha", "Kottayam", "Ernakulam"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa", "Murwara", "Burhanpur"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Amravati", "Kolhapur", "Navi Mumbai", "Thane", "Pimpri-Chinchwad", "Dhule"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Kakching"],
  "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongstoin", "Williamnagar"],
  "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur", "Brahmapur", "Puri", "Balasore", "Baripada", "Bhadrak", "Jharsuguda"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Gurdaspur", "Ferozepur", "Moga"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar", "Bharatpur", "Sikar", "Pali", "Sri Ganganagar"],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Vellore", "Erode", "Thoothukkudi", "Dindigul", "Thanjavur"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet"],
  "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Ambassa", "Belonia"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Noida", "Ghaziabad", "Meerut", "Allahabad", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Faizabad", "Jhansi", "Mathura"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Nainital", "Rishikesh", "Haldwani", "Rudrapur", "Kashipur", "Kotdwar", "Ramnagar"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur", "Shantipur"],
  // Union Territories
  "Andaman & Nicobar Islands": ["Port Blair", "Car Nicobar", "Diglipur"],
  "Chandigarh": ["Chandigarh"],
  "Dadra & Nagar Haveli and Daman & Diu": ["Silvassa", "Daman", "Diu"],
  "Delhi": ["New Delhi", "Dwarka", "Rohini", "Janakpuri", "Saket", "Karol Bagh", "Lajpat Nagar", "Pitampura", "Shahdara", "Vasant Kunj"],
  "Jammu & Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Sopore", "Udhampur"],
  "Ladakh": ["Leh", "Kargil"],
  "Lakshadweep": ["Kavaratti", "Minicoy", "Agatti"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahé", "Yanam"],
};

const productQueryOptions = (slug: string) =>
  queryOptions({ queryKey: ["shop", "slug", slug], queryFn: () => getProductBySlug(slug) });

 => ({
    meta: [
      { title: `${params.slug} — Enginow Shop` },
      { name: "description", content: "Shop premium products from Enginow." },
    ],
  }),
});

declare global { interface Window { Razorpay: any; } }

export default function ProductDetailPage() {
  const { slug } = Route.useParams();
  const { ref: refCode } = Route.useSearch();
  const { data: product } = useSuspenseQuery(productQueryOptions(slug));
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!product) throw notFound();

  const [currentImg, setCurrentImg] = useState(0);
  const [copied, setCopied] = useState(false);
  const [appliedRef, setAppliedRef] = useState<string | null>(null);
  const [refDiscount, setRefDiscount] = useState(0);
  const [refInput, setRefInput] = useState(refCode || "");
  const [refError, setRefError] = useState("");
  const [validatingRef, setValidatingRef] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"address" | "customize" | "confirm">("address");
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Address form
  const [address, setAddress] = useState({
    state: "", city: "", pincode: "", landmark: "", fullAddress: "",
  });

  // Diary customization
  const [customization, setCustomization] = useState({
    quotes: "", coverImageUrl: "", backSideName: "",
  });
  const [customCoverFile, setCustomCoverFile] = useState<string>("");

  const { data: myProfile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const { getMyProfile } = await import("@/lib/courses.functions");
      return getMyProfile();
    },
    enabled: isAuthenticated && !isAuthLoading,
  });

  useEffect(() => {
    if (refCode) localStorage.setItem("enginow_ref", refCode);
  }, [refCode]);

  useEffect(() => {
    const code = refCode ?? localStorage.getItem("enginow_ref");
    if (!code) return;
    validateReferralCode({ data: { code } }).then((r) => {
      if (r.valid) { setAppliedRef(code); setRefDiscount(r.discountPercent ?? 15); setRefInput(code); }
    }).catch(() => {});
  }, [refCode]);

  const finalPrice = Math.round(product.discountedPrice - (product.discountedPrice * refDiscount / 100));
  const isDiary = product.category === "Diary";

  async function applyReferralCode() {
    if (!refInput.trim()) return;
    setValidatingRef(true);
    setRefError("");
    try {
      const r = await validateReferralCode({ data: { code: refInput.trim() } });
      if (r.valid) { setAppliedRef(refInput.trim()); setRefDiscount(r.discountPercent ?? 15); }
      else { setRefError("Invalid or expired referral code."); }
    } catch { setRefError("Failed to validate code."); }
    finally { setValidatingRef(false); }
  }

  function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handleBuyNow() {
    if (!isAuthenticated) {
      navigate({ to: `/auth?redirect=/shop/${product.slug}` as any });
      return;
    }
    setShowCheckout(true);
    setCheckoutStep("address");
  }

  async function handlePlaceOrder() {
    if (!address.state || !address.city || !address.pincode || !address.fullAddress) {
      alert("Please fill in all required address fields.");
      return;
    }
    setOrdering(true);
    try {
      let razorpayOrderId: string | undefined;
      let razorpayPaymentId: string | undefined;

      if (finalPrice > 0) {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) { alert("Could not load payment gateway."); setOrdering(false); return; }
        const { id: orderId } = await createRazorpayOrder({ data: { amount: finalPrice } });
        razorpayOrderId = orderId;
        await new Promise<void>((resolve, reject) => {
          const rzp = new window.Razorpay({
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: finalPrice * 100,
            currency: "INR",
            name: "Enginow Shop",
            description: product.name,
            order_id: orderId,
            handler: async (response: any) => {
              const { valid } = await verifyRazorpayPayment({
                data: {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                },
              });
              if (valid) { razorpayPaymentId = response.razorpay_payment_id; resolve(); }
              else reject(new Error("Payment verification failed"));
            },
            modal: { ondismiss: () => reject(new Error("dismissed")) },
          });
          rzp.open();
        });
      }

      await placeOrder({
        productId: product.id,
        amount: finalPrice,
        referralCode: appliedRef || undefined,
        razorpayOrderId,
        razorpayPaymentId,
        address,
        customization: isDiary ? customization : undefined,
      });

      localStorage.removeItem("enginow_ref");
      setShowCheckout(false);
      setOrderSuccess(true);
    } catch (err: any) {
      if (err?.message !== "dismissed") {
        console.error(err);
        alert("Something went wrong. Please try again.");
      }
    } finally {
      setOrdering(false);
    }
  }

  function handleShare() {
    let url = `${window.location.origin}/shop/${product.slug}`;
    const canRefer = isAuthenticated && myProfile?.referralCode && !myProfile?.referralExpired;
    if (canRefer) url += `?ref=${myProfile.referralCode}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  }

  const images = product.images?.length ? product.images : [];

  return (
    <main className="relative min-h-screen" style={{ background: "#FFFFFF" }}>
      {/* Amber haze */}
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: "500px", pointerEvents: "none", background: "radial-gradient(ellipse 90% 100% at 50% 0%, rgba(255,232,184,0.38) 0%, transparent 80%)" }} />

      <div className="mx-auto max-w-[1200px] px-6 py-24 md:px-10">
        <Link href="/shop" className="inline-flex items-center gap-1.5 text-[13px] text-ink-mute hover:text-ink mb-8">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* ── Images ── */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden border hairline bg-secondary/20">
              {images.length > 0 ? (
                <img src={images[currentImg]} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <ShoppingBag className="h-16 w-16 text-ink-mute/30" />
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setCurrentImg((c) => (c - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white shadow">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => setCurrentImg((c) => (c + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white shadow">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setCurrentImg(i)} className={`shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-all ${i === currentImg ? "border-amber-400" : "border-transparent"}`}>
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Details ── */}
          <div>
            <p className="mono text-[11px] uppercase tracking-widest text-ink-mute">{product.category}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">{product.name}</h1>
            {product.shortDescription && (
              <p className="mt-2 text-[15px] text-ink-soft">{product.shortDescription}</p>
            )}

            {/* Rating */}
            <div className="mt-3 flex items-center gap-1.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`h-4 w-4 ${s <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-ink-mute/30"}`} />
              ))}
              <span className="text-[13px] text-ink-soft ml-1">{product.rating.toFixed(1)}</span>
            </div>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold">₹{finalPrice}</span>
              {product.price > product.discountedPrice && (
                <span className="text-[16px] text-ink-mute line-through">₹{product.price}</span>
              )}
              {appliedRef && (
                <span className="text-[12px] font-medium text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
                  -{refDiscount}% referral
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-6">
                <p className="text-[14px] text-ink-soft leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {/* Referral Code */}
            <div className="mt-6 rounded-xl border hairline bg-secondary/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="h-4 w-4 text-amber-500" />
                <span className="text-[13px] font-medium">Have a referral code?</span>
              </div>
              <div className="flex gap-2">
                <input
                  value={refInput}
                  onChange={(e) => setRefInput(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1 rounded-lg border border-input bg-white px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  onClick={applyReferralCode}
                  disabled={validatingRef || !!appliedRef}
                  className="rounded-lg bg-ink px-4 py-2 text-[13px] font-medium text-paper hover:bg-ink/90 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {validatingRef ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : appliedRef ? <Check className="h-3.5 w-3.5" /> : "Apply"}
                </button>
              </div>
              {refError && <p className="mt-1.5 text-[12px] text-red-500">{refError}</p>}
              {appliedRef && <p className="mt-1.5 text-[12px] text-emerald-600">Code applied! You save {refDiscount}%</p>}
            </div>

            {/* Order success */}
            {orderSuccess && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
                <Check className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-emerald-800">Order Placed Successfully!</p>
                <p className="text-[13px] text-emerald-700 mt-1">We'll contact you to confirm your delivery details.</p>
              </motion.div>
            )}

            {/* Buttons */}
            {!orderSuccess && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleBuyNow}
                  className="flex-1 rounded-xl bg-ink px-6 py-3 text-[14px] font-medium text-paper hover:bg-ink/90 transition-colors"
                >
                  Buy Now — ₹{finalPrice}
                </button>
                <button
                  onClick={handleShare}
                  className="rounded-xl border hairline px-4 py-3 text-ink-soft hover:bg-secondary transition-colors"
                  title="Share & earn referral"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
                </button>
              </div>
            )}
            {!orderSuccess && (
              <p className="mt-2 text-[11px] text-ink-mute text-center">
                {isAuthenticated ? "Share your link above to earn a referral bonus." : "Login to buy or apply a referral code."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Checkout Overlay ── */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b hairline">
                <h2 className="text-lg font-semibold">
                  {checkoutStep === "address" && "Delivery Address"}
                  {checkoutStep === "customize" && "Customize Your Diary"}
                  {checkoutStep === "confirm" && "Order Summary"}
                </h2>
                <button onClick={() => setShowCheckout(false)} className="rounded-lg p-1.5 hover:bg-secondary text-ink-mute">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-6 py-5 overflow-y-auto max-h-[70vh]">
                {/* STEP 1: Address */}
                {checkoutStep === "address" && (
                  <div className="space-y-4">
                    <div>
                      <label className="mono text-[10px] uppercase tracking-widest text-ink-mute">State *</label>
                      <select
                        value={address.state}
                        onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value, city: "" }))}
                        className="mt-1.5 block w-full rounded-md border border-input bg-paper px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="">Select State</option>
                        {Object.keys(INDIA_STATES).sort().map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mono text-[10px] uppercase tracking-widest text-ink-mute">City *</label>
                      <select
                        value={address.city === address.city && !(INDIA_STATES[address.state] || []).includes(address.city) && address.city !== "" ? "__other__" : address.city}
                        onChange={(e) => {
                          if (e.target.value === "__other__") {
                            setAddress((a) => ({ ...a, city: "" }));
                          } else {
                            setAddress((a) => ({ ...a, city: e.target.value }));
                          }
                        }}
                        className="mt-1.5 block w-full rounded-md border border-input bg-paper px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring"
                        disabled={!address.state}
                      >
                        <option value="">Select City</option>
                        {(INDIA_STATES[address.state] || []).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                        <option value="__other__">Other (type below)</option>
                      </select>
                      {/* Free-text fallback if city not in list */}
                      {address.state && !(INDIA_STATES[address.state] || []).includes(address.city) && (
                        <input
                          value={address.city}
                          onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                          placeholder="Type your city name"
                          className="mt-2 block w-full rounded-md border border-input bg-paper px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring"
                        />
                      )}
                    </div>
                    <div>
                      <label className="mono text-[10px] uppercase tracking-widest text-ink-mute">Full Address *</label>
                      <textarea
                        value={address.fullAddress}
                        onChange={(e) => setAddress((a) => ({ ...a, fullAddress: e.target.value }))}
                        rows={2}
                        placeholder="House/Flat No., Street, Area"
                        className="mt-1.5 block w-full rounded-md border border-input bg-paper px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mono text-[10px] uppercase tracking-widest text-ink-mute">Pincode *</label>
                        <input
                          value={address.pincode}
                          onChange={(e) => setAddress((a) => ({ ...a, pincode: e.target.value }))}
                          placeholder="400001"
                          maxLength={6}
                          className="mt-1.5 block w-full rounded-md border border-input bg-paper px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="mono text-[10px] uppercase tracking-widest text-ink-mute">Landmark</label>
                        <input
                          value={address.landmark}
                          onChange={(e) => setAddress((a) => ({ ...a, landmark: e.target.value }))}
                          placeholder="Near metro, etc."
                          className="mt-1.5 block w-full rounded-md border border-input bg-paper px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Diary Customization (only for Diary) */}
                {checkoutStep === "customize" && isDiary && (
                  <div className="space-y-4">
                    <p className="text-[13px] text-ink-soft">Personalize your diary before we ship it!</p>
                    <div>
                      <label className="mono text-[10px] uppercase tracking-widest text-ink-mute">Quote / Message (inside cover)</label>
                      <textarea
                        value={customization.quotes}
                        onChange={(e) => setCustomization((c) => ({ ...c, quotes: e.target.value }))}
                        rows={3}
                        placeholder="e.g. Chase your dreams — Enginow Batch 2025"
                        className="mt-1.5 block w-full rounded-md border border-input bg-paper px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="mono text-[10px] uppercase tracking-widest text-ink-mute">Name for back cover print</label>
                      <input
                        value={customization.backSideName}
                        onChange={(e) => setCustomization((c) => ({ ...c, backSideName: e.target.value }))}
                        placeholder="e.g. Shivam Gupta"
                        className="mt-1.5 block w-full rounded-md border border-input bg-paper px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="mono text-[10px] uppercase tracking-widest text-ink-mute">Custom Cover Image</label>
                      <label className="mt-1.5 flex items-center gap-2 cursor-pointer rounded-md border border-dashed hairline px-3 py-3 hover:bg-secondary/30">
                        <Palette className="h-4 w-4 text-ink-mute" />
                        <span className="text-[13px] text-ink-soft">
                          {customCoverFile ? "Cover image selected ✓" : "Upload a cover image (optional)"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const base64 = ev.target?.result as string;
                              setCustomCoverFile(base64);
                              setCustomization((c) => ({ ...c, coverImageUrl: base64 }));
                            };
                            reader.readAsDataURL(f);
                          }}
                        />
                      </label>
                      {customCoverFile && (
                        <img src={customCoverFile} alt="Cover preview" className="mt-2 h-24 w-24 rounded-lg object-cover border hairline" />
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 3: Confirm */}
                {checkoutStep === "confirm" && (
                  <div className="space-y-4">
                    <div className="rounded-xl border hairline bg-secondary/20 p-4">
                      <p className="font-semibold text-[14px]">{product.name}</p>
                      <div className="mt-3 space-y-1.5 text-[13px] text-ink-soft">
                        <div className="flex justify-between"><span>Price</span><span>₹{product.discountedPrice}</span></div>
                        {appliedRef && (
                          <div className="flex justify-between text-emerald-600"><span>Referral discount (-{refDiscount}%)</span><span>-₹{product.discountedPrice - finalPrice}</span></div>
                        )}
                        <div className="flex justify-between font-semibold text-ink text-[14px] border-t hairline pt-2 mt-2">
                          <span>Total</span><span>₹{finalPrice}</span>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border hairline bg-secondary/20 p-4 text-[13px] space-y-1">
                      <p className="font-medium mb-2">Delivery to:</p>
                      <p>{address.fullAddress}</p>
                      <p>{address.city}, {address.state} — {address.pincode}</p>
                      {address.landmark && <p>Near: {address.landmark}</p>}
                    </div>
                    {isDiary && (customization.quotes || customization.backSideName) && (
                      <div className="rounded-xl border hairline bg-secondary/20 p-4 text-[13px]">
                        <p className="font-medium mb-2">Customization:</p>
                        {customization.quotes && <p>Quote: "{customization.quotes}"</p>}
                        {customization.backSideName && <p>Name print: {customization.backSideName}</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer buttons */}
              <div className="px-6 py-4 border-t hairline flex gap-3">
                {checkoutStep !== "address" && (
                  <button
                    onClick={() => setCheckoutStep(checkoutStep === "confirm" ? (isDiary ? "customize" : "address") : "address")}
                    className="rounded-xl border hairline px-5 py-2.5 text-[13.5px] font-medium text-ink-soft hover:bg-secondary"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={() => {
                    if (checkoutStep === "address") {
                      if (!address.state || !address.city || !address.pincode || !address.fullAddress) {
                        alert("Please fill in all required address fields."); return;
                      }
                      setCheckoutStep(isDiary ? "customize" : "confirm");
                    } else if (checkoutStep === "customize") {
                      setCheckoutStep("confirm");
                    } else {
                      handlePlaceOrder();
                    }
                  }}
                  disabled={ordering}
                  className="flex-1 rounded-xl bg-ink px-6 py-2.5 text-[13.5px] font-medium text-paper hover:bg-ink/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {ordering && <Loader2 className="h-4 w-4 animate-spin" />}
                  {checkoutStep === "confirm" ? `Pay ₹${finalPrice}` : "Continue"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
