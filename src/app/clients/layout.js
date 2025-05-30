"use client";

import "@ant-design/v5-patch-for-react-19";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Layout, Menu, Avatar, Dropdown, Button, Drawer, Spin, Space, Badge, App } from "antd";
import { BellOutlined, UserOutlined, HomeOutlined, SettingOutlined, LogoutOutlined, MenuOutlined, PlusCircleOutlined, 
  OrderedListOutlined, QuestionCircleOutlined, FacebookOutlined, TwitterOutlined, LinkedinOutlined, InstagramOutlined, 
  WhatsAppOutlined, YoutubeOutlined, FileSearchOutlined, StarOutlined, LikeOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import AppFooter from "../components/ClientFooter";

const { Header, Sider, Content, Footer } = Layout;

const ClientLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Retrieve stored user session from sessionStorage
        const storedUser = sessionStorage.getItem("clientDetails");

        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setLoading(false);
          return;
        }

        // If no stored session, fetch from Supabase
        const { data, error } = await supabase.auth.getUser();

        if (error || !data?.user) {
          console.warn("No user session found, redirecting to login...");
          router.replace("/login"); // Redirect if no session
          return;
        }
       

        // Store fetched user details in sessionStorage
        sessionStorage.setItem("clientDetails", JSON.stringify(data.user));
        setUser(data.user);
      } catch (err) {
        console.error("Unexpected error fetching user:", err);
      } finally {
        setLoading(false);
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
    sessionStorage.removeItem("clientDetails"); // Clear stored session
    router.push("/"); // Redirect to landing page
  };

  // User dropdown menu
  const userMenu = {
    items: [
      {
        key: "profile",
        label: (
          <Link href="/clients/profile">
            <UserOutlined /> Profile
          </Link>
        ),
      },
      {
        key: "settings",
        label: (
          <Link href="/clients/settings">
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
    if (pathname.startsWith("/clients/new-request")) return "new-requests";
    if (pathname.startsWith("/clients/my-requests")) return "my-requests";
    if (pathname.startsWith("/clients/inspections")) return "inspections";
    if (pathname.startsWith("/clients/notifications")) return "notifications";
    if (pathname.startsWith("/clients/feedback")) return "feedback";
    if (pathname.startsWith("/clients/help")) return "help";
    return "home"; // Default to home
  };

  // Fetch unread notifications for admin
  useEffect(() => {
    if (!user) return;
  
    const fetchUnreadCount = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("client", true)
        .eq("status", "unread")
        .eq("client_recipient_id", user?.id);
  
      if (error) {
        console.error("Error fetching notifications:", error.message);
        return;
      }
  
      setUnreadCount(data.length);
    };
  
    fetchUnreadCount();
  
    // Subscribe to INSERT and UPDATE changes affecting unread count
    const subscription = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "*", // react to both INSERT and UPDATE
          schema: "public",
          table: "notifications",
          filter: `client_recipient_id=eq.${user?.id}`,
        },
        (payload) => {
          // Re-fetch count on change
          fetchUnreadCount();
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);  
  
  // Sidebar menu items
  const sidebarItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: <Link href="/clients">Dashboard</Link>,
    },
    {
      key: "new-requests",
      icon: <PlusCircleOutlined />,
      label: <Link href="/clients/new-request">New Request</Link>,
    },
    {
      key: "my-requests",
      icon: <OrderedListOutlined />,
      label: <Link href="/clients/my-requests">My Requests</Link>,
    },
    {
      key: "inspections",
      icon: <FileSearchOutlined />,
      label: <Link href="/clients/inspections">Inspections</Link>,
    },
    {
      key: "notifications",
      icon: <BellOutlined />,
      label: <Link href="/clients/notifications">Notifications</Link>,
    },
    {
      key: "feedback",
      icon: <LikeOutlined />,
      label: <Link href="/clients/feedback">Feedback</Link>,
    },
    {
      key: "help",
      icon: <QuestionCircleOutlined />,
      label: <Link href="/clients/help">Help</Link>,
    },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <App>
      <Layout style={{ minHeight: "100vh" }}>
        {/* Navbar */}
        <Header
          style={{background: "#02245B", color: "white", display: "flex", justifyContent: "space-between",
            alignItems: "center", padding: "0 20px", position: "fixed", top: 0, width: "100%",
            zIndex: 1000, height: "64px", boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          }}>
          {/* Left Side: Mobile Menu Toggle */}
          {isMobile && (
            <Button type="text" icon={<MenuOutlined />} onClick={() => setCollapsed(true)} style={{ color: "white" }} />
          )}

          {/* Middle: App Name */}
          <span style={{ fontSize: "18px", fontWeight: "bold" }}>AFMMS</span>

          {/* Right Side: Notifications & Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/clients/notifications">
            <Badge count={unreadCount} overflowCount={99} size="small">
              <BellOutlined style={{ fontSize: "20px", cursor: "pointer", color:"white" }} />
            </Badge>
          </Link>
          <Dropdown menu={{ items: userMenu.items }} placement="bottomRight" trigger={["click"]}>
            <Button
              type="text"
              style={{ color: "white", display: "flex", alignItems: "center", gap: "10px" }}
              data-testid="user-profile-button"
            >
              {user?.user_metadata?.fullName || "User"}
              <Avatar
                src={user?.user_metadata?.profilePic}
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
              style={{background: "#fff", height: "calc(100vh - 64px)", position: "fixed", left: 0, top: "64px",
                bottom: "60px", boxShadow: "2px 0px 10px rgba(0,0,0,0.1)",
              }}
            >
              <Menu mode="inline" selectedKeys={[getMenuKey()]} style={{ height: "100%", borderRight: 0 }} items={sidebarItems} />
            </Sider>
          )}

          {/* Sidebar (Mobile View) - Drawer */}
          <Drawer title="Menu" placement="left" closable onClose={() => setCollapsed(false)} open={collapsed}>
            <Menu mode="vertical" selectedKeys={[getMenuKey()]} items={sidebarItems} />
          </Drawer>

          {/* Main Content Area */}
          <Layout style={{ marginLeft: isMobile ? 0 : 200, marginTop: "64px", minHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
            <Content style={{ padding: "20px" }}>{children}</Content>
            <AppFooter />

            {/* Mini Footer */}
            <Footer
              style={{background: "#f5f5f5", textAlign: "center", position: "fixed", bottom: 0, left: 0, width: "100%", height: "60px",
                display: "flex", justifyContent: "center", alignItems: "center",}}>
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
    </App>
  );
};

export default ClientLayout;
