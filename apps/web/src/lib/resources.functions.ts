const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api") + "/resources";

const FALLBACK_RESOURCES = [
  {
    _id: "res-1",
    id: "res-1",
    title: "Systems Engineering Reading List & Architecture Papers",
    type: "Reading List",
    description: "Curated seminal papers on distributed consensus, LSM storage engines, and network virtualization.",
    url: "/resources/systems-reading-list",
  },
  {
    _id: "res-2",
    id: "res-2",
    title: "Modern Machine Learning Cheat Sheet & Derivations",
    type: "PDF Guide",
    description: "Compact mathematical formulas, backprop equations, activation curves, and loss functions for practitioners.",
    url: "/resources/ml-cheatsheet",
  },
];

export const getResources = async () => {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Network error");
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_RESOURCES;
  } catch {
    return FALLBACK_RESOURCES;
  }
};
