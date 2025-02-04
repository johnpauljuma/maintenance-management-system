"use client";

import { useState } from "react";
import { Layout, Form, Input, Button, Row, Col, Card, Typography, message } from "antd";
import Link from "next/link";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

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
  forgotPassword: {
    textAlign: "right",
    marginBottom: "10px",
  },
};

const Login = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values) => {
    setLoading(true);
    const { email, password } = values;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      message.error(error.message);
    } else {
      message.success("Login successful!");
      router.push("/clients"); // Redirect to user dashboard after login
    }

    setLoading(false);
  };

  return (
    <Layout>
      <Header style={styles.header}>Client Login - AFMMS</Header>

      <Content style={styles.container}>
        <Card style={styles.card}>
          <Title level={2} style={{ marginBottom: "20px" }}>Login</Title>

          <Form layout="vertical" onFinish={onFinish}>
            {/* Email */}
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

            {/* Password */}
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Please enter your password!" }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" />
            </Form.Item>

            {/* Forgot Password */}
            <div style={styles.forgotPassword}>
              <Link href="/forgot-password" style={{ color: "#A61B22" }}>Forgot Password?</Link>
            </div>

            {/* Login Button */}
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} style={styles.button}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </Form.Item>
          </Form>

          {/* Don't have an account? */}
          <div style={styles.footer}>
            Don't have an account? <Link href="/signup" style={{ color: "#A61B22" }}>Sign Up</Link>
          </div>
        </Card>
      </Content>

      <Footer style={{ textAlign: "center", backgroundColor: "#02245b", color: "#fff", marginTop: "10px" }}>
        AFMMS ©{new Date().getFullYear()} Created by John Paul
      </Footer>
    </Layout>
  );
};

export default Login;
