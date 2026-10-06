import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fernly Clone",
  description: "A frontend reconstruction of the Fernly workspace template.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
