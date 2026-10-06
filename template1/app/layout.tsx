import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coterie Template",
  description: "A warm people-ops dashboard template with overview, people and payroll views.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
