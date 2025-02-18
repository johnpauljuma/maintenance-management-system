"use client";

import '@ant-design/v5-patch-for-react-19';
import { useState, useEffect } from "react";
import { Layout, Form, Input, Button, Card, Typography, message } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

const { Title } = Typography;
const { Header, Content, Footer } = Layout;

const TechnicianLogin = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ Ensure we only redirect **after** checking session storage
  useEffect(() => {
    const isTechnicianLoggedIn = sessionStorage.getItem("technicianLoggedIn");
    if (isTechnicianLoggedIn === "true") {
      router.replace("/technicians"); // Use `replace` to avoid history stack issues
    }
  }, [router]);

  const onFinish = async (values) => {
    setLoading(true);

    const { email, password } = values;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      message.error("Invalid email or password!");
    } else {
      sessionStorage.setItem("technicianLoggedIn", "true");
      message.success("Login successful!");
      router.replace("/technicians"); // Redirect to technician dashboard
    }
    setLoading(false);
  };

  return (
    <Layout style={{ backgroundColor: "#02245B", minHeight: "100vh" }}>
      <Header
        style={{
          backgroundColor: "#02245B",
          textAlign: "center",
          color: "white",
          fontSize: "18px",
          fontWeight: "bold",
          padding: "10px 0",
        }}
      >
        Technician Login - AFMMS
      </Header>

      <Content style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <Card
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "30px",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            textAlign: "center",
            backgroundColor: "#fff",
          }}
        >
          <Title level={2} style={{ marginBottom: "20px", color: "#02245B" }}>Technician Login</Title>

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

          {/* Forgot Password Link */}
          <Link href="/technicians/forgot-password" style={{ color: "#1890ff" }}>
            Forgot Password?
          </Link>
        </Card>
      </Content>

      <Footer
        style={{
          textAlign: "center",
          backgroundColor: "#02245b",
          color: "#fff",
          padding: "10px 0",
          position: "absolute",
          bottom: 0,
          width: "100%",
        }}
      >
        AFMMS ©{new Date().getFullYear()} Created by John Paul
      </Footer>
    </Layout>
  );
};

export default TechnicianLogin;
