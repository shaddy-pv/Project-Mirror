import { firebaseAuth } from "@/integrations/firebase/client";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api") + "/shop";

async function fetchPublic(path: string) {
  const res = await fetch(`${API_URL}${path}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Network error");
  return data;
}

async function fetchWithAuth(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  if (firebaseAuth.currentUser) {
    const token = await firebaseAuth.currentUser.getIdToken();
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Content-Type", "application/json");
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Network error");
  return data;
}

const FALLBACK_PRODUCTS = [
  {
    id: "enginow-hardcover-journal",
    name: "Enginow Architecture Hardcover Journal",
    slug: "enginow-hardcover-journal",
    shortDescription: "Dot-grid, 120gsm archival paper, debossed monogram cover. Made for system designers.",
    price: 999,
    discountedPrice: 699,
    images: ["/assets/shop/journal.png"],
    rating: 4.9,
    category: "Diary",
  },
  {
    id: "craft-tshirt",
    name: "Enginow 'Respect Craft' Heavyweight Tee",
    slug: "craft-tshirt",
    shortDescription: "240 GSM organic combed cotton, relaxed architectural cut with minimalist neck print.",
    price: 1499,
    discountedPrice: 999,
    images: ["/assets/shop/tee.png"],
    rating: 4.8,
    category: "T-Shirt",
  },
  {
    id: "precision-pen",
    name: "Machined Matte Brass Precision Pen",
    slug: "precision-pen",
    shortDescription: "Balanced weighted body, Schmidt 0.5mm ceramic rollerball refill.",
    price: 1299,
    discountedPrice: 899,
    images: ["/assets/shop/pen.png"],
    rating: 5.0,
    category: "Pen",
  },
  {
    id: "engineer-sticker-pack",
    name: "Holographic & Matte Vinyl Sticker Pack",
    slug: "engineer-sticker-pack",
    shortDescription: "Set of 12 waterproof UV-coated stickers celebrating algorithms, systems and craft.",
    price: 499,
    discountedPrice: 299,
    images: ["/assets/shop/stickers.png"],
    rating: 4.9,
    category: "Sticker",
  },
];

export const getPublishedProducts = async () => {
  try {
    const data = await fetchPublic("/");
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_PRODUCTS;
  } catch {
    return FALLBACK_PRODUCTS;
  }
};

export const getProductBySlug = async (slug: string) => {
  try {
    return await fetchPublic(`/${slug}`);
  } catch {
    const match = FALLBACK_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
    if (match) return match;
    return FALLBACK_PRODUCTS[0];
  }
};

export const getMyOrders = async () => {
  try {
    return await fetchWithAuth("/my-orders");
  } catch {
    return [];
  }
};

export const placeOrder = async (data: {
  productId: string;
  amount: number;
  referralCode?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  address: {
    state: string;
    city: string;
    pincode: string;
    landmark?: string;
    fullAddress: string;
  };
  customization?: {
    quotes?: string;
    coverImageUrl?: string;
    backSideName?: string;
  };
}) => fetchWithAuth("/checkout", { method: "POST", body: JSON.stringify(data) });

export const rateOrder = async (orderId: string, rating: number) => {
  return fetchWithAuth(`/orders/${orderId}/rate`, { method: "POST", body: JSON.stringify({ rating }) });
};
