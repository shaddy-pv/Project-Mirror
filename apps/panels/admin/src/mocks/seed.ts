import type { Role } from "@/lib/types";

export interface StaffMember {
  name: string;
  email: string;
  role: Role;
}

export const staff: StaffMember[] = [
  { name: "Admin User", email: "admin@enginow.com", role: "admin" },
  { name: "Educator User", email: "educator@enginow.com", role: "educator" },
  { name: "HR User", email: "hr@enginow.com", role: "hr" },
  { name: "Sales User", email: "sales@enginow.com", role: "sales" },
];
