import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { ConsumerRecordForm } from "./consumer-record-form";

export const metadata: Metadata = {
  title: "Check My Record",
  description: "Check your recorded LRT City consumer information using your email address and WhatsApp number.",
  robots: { index: false, follow: false },
};

export default function CheckRecordPage() {
  return <PublicShell><div className="h-1.5 bg-accent" /><div className="mx-auto max-w-[1320px] px-6 py-12 md:px-16"><h1 className="text-[32px]">Check my record</h1><p className="mt-1 mb-7 max-w-2xl text-sm text-muted">Enter the email address and WhatsApp number you used when completing the consumer form. Both must match before your recorded unit information is shown.</p><ConsumerRecordForm /></div></PublicShell>;
}
