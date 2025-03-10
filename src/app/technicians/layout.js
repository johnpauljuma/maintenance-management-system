"use client";

import "@ant-design/v5-patch-for-react-19";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Layout, Menu, Avatar, Dropdown, Button, Drawer, Spin, Space, Grid } from "antd";
import {
  BellOutlined, UserOutlined, HomeOutlined, SettingOutlined, LogoutOutlined, MenuOutlined, ToolOutlined, 
  CheckCircleOutlined, FacebookOutlined, TwitterOutlined, LinkedinOutlined, InstagramOutlined, WhatsAppOutlined, YoutubeOutlined
} from "@ant-design/icons";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import AppFooter from "../components/TechnicianFooter";

const { Header, Sider, Content, Footer } = Layout;
const { useBreakpoint } = Grid; // ✅ Ant Design Grid Breakpoints

const TechnicianLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const screens = useBreakpoint(); // ✅ Get responsive screen size
  const [user, setUser] = useState(null);
  const [technician, setTechnician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const storedTechnician = sessionStorage.getItem("technician");
    
    if (!storedTechnician) {
      router.replace("/technician-login");
      return;
    }

    setTechnician(JSON.parse(storedTechnician));
    setLoading(false);
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem("technicianLoggedIn");
    router.replace("/technician-login");
  };

  const userMenu = {
    items: [
      {
        key: "profile",
        label: <Link href="/technicians/profile"><UserOutlined /> Profile</Link>,
      },
      {
        key: "settings",
        label: <Link href="/technicians/settings"><SettingOutlined /> Settings</Link>,
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

  const getMenuKey = () => {
    if (pathname.startsWith("/technicians/tasks")) return "tasks";
    if (pathname.startsWith("/technicians/inspections")) return "inspections";
    if (pathname.startsWith("/technicians/settings")) return "settings";
    if (pathname.startsWith("/technicians/profile")) return "profile";
    if (pathname.startsWith("/technicians/edit-profile")) return "edit-profile";
    if (pathname.startsWith("/technicians/notifications")) return "notifications";
    return "dashboard";
  };

  const sidebarItems = [
    { key: "dashboard", icon: <HomeOutlined />, label: <Link href="/technicians">Dashboard</Link> },
    { key: "tasks", icon: <ToolOutlined />, label: <Link href="/technicians/tasks">Tasks</Link> },
    { key: "inspections", icon: <CheckCircleOutlined />, label: <Link href="/technicians/inspections">Inspections</Link> },
    { key: "notifications", icon: <BellOutlined />, label: <Link href="/technicians/notifications">Notifications</Link> },
    { key: "settings", icon: <SettingOutlined />, label: <Link href="/technicians/settings">Settings</Link> },
   
  ];

  if (loading) {
    return (
      <Layout style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spin size="large" />
      </Layout>
    );
  }

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
        {/* Mobile Menu Toggle */}
        <Button 
          type="text" 
          icon={<MenuOutlined />} 
          onClick={() => setCollapsed(true)} 
          style={{ color: "white", display: screens.md ? "none" : "inline-block" }} 
        />

        {/* App Name - Hidden on Mobile */}
        {screens.md && <span style={{ fontSize: "18px", fontWeight: "bold" }}>AFMMS - Technician Portal</span>}

        {/* Notifications & Profile */}
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
        {/* Sidebar (Desktop) */}
        {screens.md && (
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

        {/* Sidebar (Mobile) - Drawer */}
        <Drawer title="Technician Menu" placement="left" closable onClose={() => setCollapsed(false)} open={collapsed}>
          <Menu mode="vertical" selectedKeys={[getMenuKey()]} items={sidebarItems} />
        </Drawer>

        {/* Main Content */}
        <Layout style={{ marginLeft: screens.md ? 200 : 0, marginTop: "64px", minHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
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
            <div style={{ textAlign: "center" }}>
              <h4 style={{ color: "#02245b", marginBottom: "5px", fontStyle:"italic" }}>Follow Us</h4>
              <Space size="large">
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <YoutubeOutlined style={{ fontSize: "24px", color: "#A61B22" }} />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <FacebookOutlined style={{ fontSize: "24px", color: "#A61B22" }} />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <TwitterOutlined style={{ fontSize: "24px", color: "#A61B22" }} />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <LinkedinOutlined style={{ fontSize: "24px", color: "#A61B22" }} />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <InstagramOutlined style={{ fontSize: "24px", color: "#A61B22" }} />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <WhatsAppOutlined style={{ fontSize: "24px", color: "#A61B22" }} />
                </a>
              </Space>
            </div>
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default TechnicianLayout;
