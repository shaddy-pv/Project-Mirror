export type StaffRole = "admin" | "hr" | "educator" | "sales";

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  avatar?: string;
  status: string;
}

const BASE_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function getStaffToken(portal: StaffRole): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`enginow_staff_token_${portal}`);
}

export function setStaffToken(portal: StaffRole, token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`enginow_staff_token_${portal}`, token);
}

export function removeStaffToken(portal: StaffRole) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`enginow_staff_token_${portal}`);
}

export async function staffLogin(identifier: string, password: string, portal: StaffRole): Promise<{ token: string; staff: StaffUser }> {
  const res = await fetch(`${BASE_API}/staff/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password, portal }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Staff login failed");
  }

  setStaffToken(portal, data.token);
  return data;
}

export async function staffGetMe(portal: StaffRole): Promise<StaffUser | null> {
  const token = getStaffToken(portal);
  if (!token) return null;

  try {
    const res = await fetch(`${BASE_API}/staff/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      removeStaffToken(portal);
      return null;
    }

    const data = await res.json();
    return data.staff;
  } catch (e) {
    console.error("Failed to verify staff session", e);
    return null;
  }
}

export async function staffLogout(portal: StaffRole): Promise<void> {
  const token = getStaffToken(portal);
  if (token) {
    try {
      await fetch(`${BASE_API}/staff/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // ignore
    }
  }
  removeStaffToken(portal);
}
