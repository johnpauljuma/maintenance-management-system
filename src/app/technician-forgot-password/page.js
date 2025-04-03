"use client";

import '@ant-design/v5-patch-for-react-19';
import { useState } from "react";
import { Layout, Form, Input, Button, Card, Typography, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const { Title } = Typography;
const { Header, Content, Footer } = Layout;

const TechnicianForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values) => {
    setLoading(true);

    const { email } = values;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://yourdomain.com/technicians/reset-password",
    });

    if (error) {
      message.error("Error sending reset email. Try again.");
    } else {
      message.success("Password reset link sent! Check your email.");
      router.replace("/technicians/login");
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
        Reset Password - AFMMS
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
          <Title level={2} style={{ marginBottom: "20px", color: "#02245B" }}>Forgot Password</Title>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item label="Email" name="email" rules={[{ required: true, message: "Please enter your email!" }]}>
              <Input prefix={<MailOutlined />} placeholder="Enter your email" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </Form.Item>
          </Form>

          {/* Back to Login */}
          <Link href="/technicians/login" style={{ color: "#1890ff" }}>
            Back to Login
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

export default TechnicianForgotPassword;
