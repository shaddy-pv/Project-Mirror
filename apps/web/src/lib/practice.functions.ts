const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api").replace("localhost", "127.0.0.1") + "/practice";

export const getPracticeTests = async () => {
  const res = await fetch(API_URL);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Network error");
  return data;
};
