"use client";

import { useEffect, useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Button } from "antd";
import { BellOutlined, UserOutlined, HomeOutlined, SettingOutlined, LogoutOutlined, FileTextOutlined } from "@ant-design/icons";
import Link from "next/link";
// import { supabase } from "@/utils/supabase"; // Uncomment when Supabase is set up

const { Header, Sider, Content, Footer } = Layout;

const ClientLayout = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      // Uncomment when Supabase is set up
      // const { data: { user } } = await supabase.auth.getUser();
      // if (user) setUser(user);

      // Temporary mock user for testing UI
      setUser({
        user_metadata: {
          fullName: "John Doe",
          profilePic: "",
        },
      });
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    // Uncomment when Supabase is set up
    // await supabase.auth.signOut();
    console.log("User logged out");
  };

  // User dropdown menu
  const userMenu = {
    items: [
      {
        key: "profile",
        label: <Link href="/clients/profile"><UserOutlined style={{color: "#fff"}}/> Profile</Link>,
      },
      {
        key: "settings",
        label: <Link href="/clients/settings"><SettingOutlined /> Settings</Link>,
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

  // Sidebar menu
  const sidebarItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: <Link href="/clients/dashboard">Dashboard</Link>,
    },
    {
      key: "requests",
      icon: <FileTextOutlined />,
      label: <Link href="/clients/requests">My Requests</Link>,
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: <Link href="/clients/settings">Settings</Link>,
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
          position: "fixed", // Fixed navbar
          top: 0,
          width: "100%",
          zIndex: 1000,
          height: "64px", // Ensure it stays consistent
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        }}
      >
        {/* Left Side: App Name */}
        <span style={{ fontSize: "18px", fontWeight: "bold" }}>AFMMS</span>

        {/* Right Side: Notifications & Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <BellOutlined style={{ fontSize: "20px", cursor: "pointer" }} />

          <Dropdown menu={userMenu} placement="bottomRight" trigger={["click"]}>
            <Button type="text" style={{ color: "white", display: "flex", alignItems: "center", gap: "10px" }}>
              {user?.user_metadata?.fullName || "User"}
              <Avatar
                src={user?.user_metadata?.profilePic || "l"}
                icon={!user?.user_metadata?.profilePic ? <UserOutlined style={{color: "#fff"}}/> : null}
              />
            </Button>
          </Dropdown>
        </div>
      </Header>

      <Layout>
        {/* Sidebar */}
        <Sider
          width={250}
          style={{
            background: "#fff",
            height: "calc(100vh - 64px)", // Adjust height based on navbar
            position: "fixed",
            left: 0,
            top: "64px", // Start below navbar
            bottom: "60px",
            boxShadow: "2px 0px 10px rgba(0,0,0,0.1)",
          }}
        >
          <Menu mode="inline" defaultSelectedKeys={["home"]} style={{ height: "100%", borderRight: 0 }} items={sidebarItems} />
        </Sider>

        {/* Main Content Area */}
        <Layout style={{ marginLeft: 250, marginTop: "64px", minHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
          <Content style={{ padding: "20px" }}>
            {children}
          </Content>

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

export default ClientLayout;
