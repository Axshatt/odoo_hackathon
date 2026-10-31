import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Brightloop — A clearer view of recurring revenue",
  description: "Plans, subscriptions, and billing. One considered workspace.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
