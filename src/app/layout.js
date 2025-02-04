import { Geist, Geist_Mono } from "next/font/google";
import { Layout } from "antd";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Maintenance Management System",
  description: "A platform to manage maintenance requests efficiently",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Layout className="min-h-screen">
          <main>{children}</main>
        </Layout>
      </body>
    </html>
  );
}
