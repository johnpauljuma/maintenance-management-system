"use client";

import { useState } from "react";
import { Layout, Form, Input, Button, Card, Typography, message } from "antd";
import Link from "next/link";
import { MailOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Header, Content, Footer } = Layout;

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "83vh",
    backgroundColor: "#f0f2f5",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  header: {
    backgroundColor: "#02245B",
    padding: "10px 20px",
    textAlign: "center",
    color: "white",
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  footer: {
    textAlign: "center",
    marginTop: "10px",
  },
  button: {
    width: "100%",
    backgroundColor: "#A61B22",
    color: "white",
    fontWeight: "bold",
  },
};

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    setLoading(true);
    console.log("Forgot Password Request:", values);

    setTimeout(() => {
      setLoading(false);
      message.success("Password reset link has been sent to your email.");
    }, 2000);
  };

  return (
    <Layout>
      <Header style={styles.header}>Forgot Password - AFMMS</Header>

      <Content style={styles.container}>
        <Card style={styles.card}>
          <Title level={2} style={{ marginBottom: "20px" }}>Reset Password</Title>
          <p style={{ marginBottom: "20px" }}>
            Enter your registered email address, and we will send you instructions to reset your password.
          </p>

          <Form layout="vertical" onFinish={onFinish}>
            {/* Email Input */}
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                { required: true, message: "Please enter your email!" },
                { type: "email", message: "Enter a valid email address!" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Enter your email" />
            </Form.Item>

            {/* Reset Button */}
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} style={styles.button}>
                {loading ? "Processing..." : "Send Reset Link"}
              </Button>
            </Form.Item>
          </Form>

          {/* Back to Login */}
          <div style={styles.footer}>
            <Link href="/login" style={{ color: "#A61B22" }}>Back to Login</Link>
          </div>
        </Card>
      </Content>

      <Footer style={{ textAlign: "center", backgroundColor: "#02245b", color: "#fff", marginTop: "10px" }}>
        AFMMS ©{new Date().getFullYear()} Created by John Paul
      </Footer>
    </Layout>
  );
};

export default ForgotPassword;
