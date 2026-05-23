import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
});

export const metadata = {
  title: "Wallet · Σέριφος",
  description: "Personal finance tracker",
  manifest: "/manifest.json",
  themeColor: "#0b1123",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="el">
      <body className={`${cormorant.variable} ${dmSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
