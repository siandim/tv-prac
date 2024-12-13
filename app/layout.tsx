import type { Metadata } from "next";
import { Inter } from "next/font/google";
import '@radix-ui/themes/styles.css';
import "./globals.css";
import NavBar from "./NavBar";
import { Theme } from "@radix-ui/themes";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TV Mesonet",
  description: "mesonet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <Head>
        <link rel="icon" href="/kymesonetLogo.webp" />
        {/* You can include different sizes and types if needed */}
        {/* <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" /> */}
      </Head>
      
      <body className={`scroll font-inter ${inter.className}`}>
        <Theme>
        <NavBar />
        <main>{children}</main>
        </Theme>
      </body>
    </html>
  );
}
