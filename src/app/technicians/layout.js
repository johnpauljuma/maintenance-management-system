"use client";

import "@ant-design/v5-patch-for-react-19";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Layout, Menu, Avatar, Dropdown, Button, Drawer } from "antd";
import {
  BellOutlined,
  UserOutlined,
  HomeOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
  FileDoneOutlined,
  ToolOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import AppFooter from "../components/TechnicianFooter";

const { Header, Sider, Content, Footer } = Layout;

const TechnicianLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname(); // ✅ Get current route for sidebar highlight
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Error fetching user:", error.message);
          setUser(null);
          return;
        }

        if (!data?.user) {
          console.warn("No user session found, redirecting to login...");
          router.push("/login"); // Redirect if no user session
          return;
        }

        setUser(data.user);
      } catch (err) {
        console.error("Unexpected error fetching user:", err);
      }
    };

    fetchUser();

    // Detect mobile view
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    console.log("Technician logged out");
    router.push("/"); // Redirect to landing page
  };

  // User dropdown menu
  const userMenu = {
    items: [
      {
        key: "profile",
        label: (
          <Link href="/technicians/profile">
            <UserOutlined /> Profile
          </Link>
        ),
      },
      {
        key: "settings",
        label: (
          <Link href="/technicians/settings">
            <SettingOutlined /> Settings
          </Link>
        ),
      },
      {
        key: "logout",
        danger: true,
        label: (
          <Button type="text" onClick={handleLogout} style={{ color: "red" }}>
            <LogoutOutlined /> Logout
          </Button>
        ),
      },
    ],
  };

  // Determine active menu key based on current pathname
  const getMenuKey = () => {
    if (pathname.startsWith("/technicians/tasks")) return "tasks";
    if (pathname.startsWith("/technicians/inspections")) return "inspections";
    if (pathname.startsWith("/technicians/routine-maintenance")) return "routine-maintenance";
    if (pathname.startsWith("/technicians/settings")) return "settings";
    return "dashboard"; // Default to dashboard
  };

  // Sidebar menu items for Technicians
  const sidebarItems = [
    {
      key: "dashboard",
      icon: <HomeOutlined />,
      label: <Link href="/technicians">Dashboard</Link>,
    },
    {
      key: "tasks",
      icon: <ToolOutlined />,
      label: <Link href="/technicians/tasks">Tasks</Link>,
    },
    {
      key: "inspections",
      icon: <CheckCircleOutlined />,
      label: <Link href="/technicians/inspections">Inspections</Link>,
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: <Link href="/technicians/settings">Settings</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Navbar */}
      <Header
        style={{
          background: "#02245B",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 20px",
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 1000,
          height: "64px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        }}
      >
        {/* Left Side: Mobile Menu Toggle */}
        {isMobile && (
          <Button type="text" icon={<MenuOutlined />} onClick={() => setCollapsed(true)} style={{ color: "white" }} />
        )}

        {/* Middle: App Name */}
        <span style={{ fontSize: "18px", fontWeight: "bold" }}>AFMMS - Technician Portal</span>

        {/* Right Side: Notifications & Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <BellOutlined style={{ fontSize: "20px", cursor: "pointer" }} />

          <Dropdown menu={userMenu} placement="bottomRight" trigger={["click"]}>
            <Button type="text" style={{ color: "white", display: "flex", alignItems: "center", gap: "10px" }}>
              {user?.user_metadata?.fullName || "Technician"}
              <Avatar
                src={user?.user_metadata?.profilePic || "l"}
                icon={!user?.user_metadata?.profilePic ? <UserOutlined /> : null}
              />
            </Button>
          </Dropdown>
        </div>
      </Header>

      <Layout>
        {/* Sidebar (Desktop View) */}
        {!isMobile && (
          <Sider
            width={200}
            style={{
              background: "#fff",
              height: "calc(100vh - 64px)",
              position: "fixed",
              left: 0,
              top: "64px",
              bottom: "60px",
              boxShadow: "2px 0px 10px rgba(0,0,0,0.1)",
            }}
          >
            <Menu mode="inline" selectedKeys={[getMenuKey()]} style={{ height: "100%", borderRight: 0 }} items={sidebarItems} />
          </Sider>
        )}

        {/* Sidebar (Mobile View) - Drawer */}
        <Drawer
          title="Technician Menu"
          placement="left"
          closable
          onClose={() => setCollapsed(false)}
          open={collapsed}
        >
          <Menu mode="vertical" selectedKeys={[getMenuKey()]} items={sidebarItems} />
        </Drawer>

        {/* Main Content Area */}
        <Layout style={{ marginLeft: isMobile ? 0 : 200, marginTop: "64px", minHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
          <Content style={{ padding: "20px" }}>{children}</Content>
          <AppFooter />

          {/* Mini Footer */}
          <Footer
            style={{
              background: "#f0f2f5",
              textAlign: "center",
              position: "fixed",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "60px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <a href="#" target="_blank" style={{ margin: "0 15px" }}>Facebook</a>
            <a href="#" target="_blank" style={{ margin: "0 15px" }}>Twitter</a>
            <a href="#" target="_blank" style={{ margin: "0 15px" }}>LinkedIn</a>
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default TechnicianLayout;
