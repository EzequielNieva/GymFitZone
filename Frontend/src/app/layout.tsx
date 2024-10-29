import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import NavBarComponent from "@/components/NavBar";
import Footer from "@/components/Footer/Footer";
import { Providers } from "./Providers";
import { SearchProvider } from "@/context/SearchContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "FitZone",
  description: "Your fitness journey starts here",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SearchProvider>
          <Providers>
          <NavBarComponent />
          {children}
          <Footer /> 
        </Providers>
        </SearchProvider>
      </body>
    </html>
  );
}