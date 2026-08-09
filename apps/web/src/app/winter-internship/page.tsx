import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Winter Internship — Enginow",
};

export default function WinterInternshipPage() {
  redirect("/internship?type=Winter");
}
