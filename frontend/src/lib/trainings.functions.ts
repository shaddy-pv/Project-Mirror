import { firebaseAuth } from "@/integrations/firebase/client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const listPublishedTrainings = async () => {
  const res = await fetch(`${API_URL}/trainings`);
  if (!res.ok) {
    throw new Error("Failed to fetch trainings");
  }
  return res.json();
};

export const getTrainingBySlug = async ({ data }: { data: { slug: string } }) => {
  const res = await fetch(`${API_URL}/trainings/${data.slug}`);
  if (!res.ok) {
    throw new Error("Failed to fetch training");
  }
  return res.json();
};

export const enrollInTraining = async ({ data }: { data: { trainingId: string; referralCode?: string } }) => {
  const token = await firebaseAuth.currentUser?.getIdToken();
  const res = await fetch(`${API_URL}/trainings/enroll`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to enroll in training");
  }
  return res.json();
};
