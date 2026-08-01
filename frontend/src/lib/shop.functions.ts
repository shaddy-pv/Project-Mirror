import { firebaseAuth } from "@/integrations/firebase/client";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api") + "/shop";

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

export const getPublishedProducts = async () => fetchPublic("/");
export const getProductBySlug = async (slug: string) => fetchPublic(`/${slug}`);
export const getMyOrders = async () => fetchWithAuth("/my-orders");

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
