"use client";

import '@ant-design/v5-patch-for-react-19';
import { useState } from "react";
import { Layout, Form, Input, Button, Card, Typography, message } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase"; // Ensure Supabase is connected

const { Title } = Typography;
const { Header, Content, Footer } = Layout;

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values) => {
    setLoading(true);
    const { email, password } = values;

    try {
      // ✅ Step 1: Authenticate Admin with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        message.error("Invalid email or password!");
        setLoading(false);
        return;
      }

      const adminId = authData.user.id;

      // ✅ Step 2: Check if User is an Admin
      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("role")
        .eq("id", adminId)
        .single();

      if (adminError || !adminData || adminData.role !== "admin") {
        message.error("Access denied! Admins only.");
        setLoading(false);
        return;
      }

      // ✅ Step 3: Store Admin Session
      sessionStorage.setItem("adminLoggedIn", "true");
      sessionStorage.setItem("adminId", adminId);

      message.success("Login successful!");
      router.replace("/admin"); // Redirect to admin panel
    } catch (error) {
      console.error("Login Error:", error.message);
      message.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ backgroundColor: "#02245B", minHeight: "100vh" }}>
      <Header style={{ backgroundColor: "#02245B", textAlign: "center", color: "white", padding: "10px 0" }}>
        Admin Login - AFMMS
      </Header>

      <Content style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <Card
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "30px",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <Title level={2} style={{ marginBottom: "20px", color: "#02245B" }}>Admin Login</Title>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item label="Email" name="email" rules={[{ required: true, message: "Please enter your email!" }]}>
              <Input prefix={<MailOutlined />} placeholder="Enter your email" />
            </Form.Item>

            <Form.Item label="Password" name="password" rules={[{ required: true, message: "Please enter your password!" }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>

      <Footer style={{ textAlign: "center", backgroundColor: "#02245b", color: "#fff", padding: "10px 0" }}>
        AFMMS ©{new Date().getFullYear()} Created by John Paul
      </Footer>
    </Layout>
  );
};

export default AdminLogin;
