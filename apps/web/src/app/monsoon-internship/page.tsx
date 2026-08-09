import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Monsoon Internship — Enginow",
};

export default function MonsoonInternshipPage() {
  redirect("/internship?type=Monsoon");
}
