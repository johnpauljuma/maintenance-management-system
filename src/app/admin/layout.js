"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Layout, Menu, Avatar, Dropdown, Button, Drawer } from "antd";
import {
  HomeOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
  TeamOutlined,
  BarChartOutlined,
  FileDoneOutlined,
  UserOutlined,
  BellOutlined,
  ToolOutlined,
  BranchesOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import AppFooter from "../components/AdminFooter";

const { Header, Sider, Content, Footer } = Layout;

const AdminLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname(); // ✅ Get current route for sidebar highlight
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if admin is logged in
    const isAdminLoggedIn = sessionStorage.getItem("adminLoggedIn");
    if (isAdminLoggedIn !== "true") {
      router.replace("/admin-login"); // Redirect unauthorized users
    }

    // Detect mobile view
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminLoggedIn");
    router.replace("/admin-login");
  };

  // Determine active menu key based on current pathname
  const getMenuKey = () => {
    if (pathname.startsWith("/admin/faults")) return "manage-requests";
    if (pathname.startsWith("/admin/technicians")) return "manage-technicians";
    if (pathname.startsWith("/admin/reports")) return "reports";
    if (pathname.startsWith("/admin/tasks")) return "tasks";
    if (pathname.startsWith("/admin/work-orders")) return "work-orders";
    if (pathname.startsWith("/admin/settings")) return "settings";
    if (pathname.startsWith("/admin/notifications")) return "notifications";
    return "dashboard"; // Default to dashboard
  };

  // Sidebar menu items
  const sidebarItems = [
    {
      key: "dashboard",
      icon: <HomeOutlined />,
      label: <Link href="/admin">Dashboard</Link>,
    },
    {
      key: "manage-requests",
      icon: <FileDoneOutlined />,
      label: <Link href="/admin/faults">Manage Faults</Link>,
    },
    {
      key: "manage-technicians",
      icon: <TeamOutlined />,
      label: <Link href="/admin/technicians">Manage Technicians</Link>,
    },
    {
      key: "reports",
      icon: <BarChartOutlined />,
      label: <Link href="/admin/reports">Reports</Link>,
    },
    {
      key: "tasks",
      icon: <ToolOutlined />,
      label: <Link href="/admin/tasks">Task Assignments</Link>,
    },
    {
      key: "work-orders",
      icon: <BranchesOutlined />,
      label: <Link href="/admin/work-orders">Work Orders</Link>,
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: <Link href="/admin/settings">Settings</Link>,
    },
    {
      key: "notifications",
      icon: <BellOutlined />,
      label: <Link href="/admin/notifications">Notifications</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sticky Navbar */}
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
        {/* Mobile Menu Toggle */}
        {isMobile && (
          <Button type="text" icon={<MenuOutlined />} onClick={() => setCollapsed(true)} style={{ color: "white" }} />
        )}

        {/* App Name */}
        <span style={{ fontSize: "18px", fontWeight: "bold" }}>AFMMS - Admin Panel</span>

        {/* Right Side: Notifications & Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <BellOutlined style={{ fontSize: "20px", cursor: "pointer" }} />

          {/* Profile Dropdown */}
          <Dropdown
            menu={{
              items: [
                {
                  key: "logout",
                  label: (
                    <Button type="text" onClick={handleLogout} style={{ color: "red" }}>
                      <LogoutOutlined /> Logout
                    </Button>
                  ),
                },
              ],
            }}
            placement="bottomRight"
          >
            <Button type="text" style={{ color: "white", display: "flex", alignItems: "center", gap: "10px" }}>
              Administrator {/* Hardcoded admin name */}
              <Avatar icon={<UserOutlined />} />
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
          title="Admin Menu"
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
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
