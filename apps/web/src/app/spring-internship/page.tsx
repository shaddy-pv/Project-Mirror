import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Spring Internship — Enginow",
};

export default function SpringInternshipPage() {
  redirect("/internship?type=Spring");
}
