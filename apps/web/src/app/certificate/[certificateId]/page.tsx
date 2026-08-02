"use client";
import { useParams } from 'next/navigation';
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";

export default function CertificateViewPage() {
  const { certificateId } = useParams() as { certificateId: string };

  const { data, isLoading, error } = useQuery({
    queryKey: ["view-cert", certificateId],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/internships/certificate/view/${certificateId}`);
      if (!res.ok) throw new Error("Certificate not found");
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-gray-800">Failed to load certificate</h1>
        <p className="text-gray-500 mt-2">The certificate may not exist or has been revoked.</p>
      </div>
    );
  }

  // Assuming data.customDocumentBase64 is a data URI (e.g. data:application/pdf;base64,...)
  const documentSrc = data.customDocumentBase64;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="p-4 bg-black text-white flex items-center justify-between">
        <h1 className="text-sm font-semibold">Certificate: {certificateId}</h1>
        <a 
          href={documentSrc} 
          download={`certificate-${certificateId}.pdf`}
          className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-gray-200 transition"
        >
          Download PDF
        </a>
      </header>
      <main className="flex-1 w-full h-full p-4 md:p-8">
        <iframe 
          src={documentSrc} 
          className="w-full h-full min-h-[80vh] rounded-lg shadow-2xl bg-white"
          title={`Certificate ${certificateId}`}
        />
      </main>
    </div>
  );
}
