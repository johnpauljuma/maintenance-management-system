import Script from "next/script";
import { useLoadScript } from "@react-google-maps/api";
import { Geist, Geist_Mono } from "next/font/google";
import { Layout, ConfigProvider, App } from "antd";
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

const themeConfig = {
  token: {
    colorPrimary: "#A61B22", // Change primary color
  },
};

const libraries = ["places"]; 

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ConfigProvider theme={themeConfig}>
          <App>
            <Layout className="min-h-screen">
              <main>{children}</main>
            </Layout>
          </App>
        </ConfigProvider>
      </body>
    </html>
  );
}
