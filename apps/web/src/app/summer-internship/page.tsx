import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Summer Internship — Enginow",
};

export default function SummerInternshipPage() {
  redirect("/internship?type=Summer");
}
