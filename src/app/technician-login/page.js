"use client";

import "@ant-design/v5-patch-for-react-19";
import { useState } from "react";
import { Layout, Form, Input, Button, Card, Typography, message } from "antd";
import { IdcardOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import bcrypt from "bcryptjs";
import Link from "next/link";

const { Title } = Typography;
const { Header, Content, Footer } = Layout;

const TechnicianLogin = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values) => {
    setLoading(true);
    const { technicianId, password } = values;
  
    // ✅ Step 1: Fetch technician data by ID
    const { data: technician, error } = await supabase
      .from("technicians")
      .select("*") // Fetch all details for session storage
      .eq("technician_id", technicianId)
      .limit(1)
      .single();
  
    if (error || !technician) {
      message.error("Technician ID not found!");
      setLoading(false);
      return;
    }
  
    // ✅ Step 2: Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, technician.password);
    if (!isPasswordValid) {
      message.error("Invalid password!");
      setLoading(false);
      return;
    }
  
    // ✅ Step 3: Store technician details in sessionStorage
    sessionStorage.setItem("technicianId", technicianId); 
    sessionStorage.setItem("technicianLoggedIn", "true");
    sessionStorage.setItem("technician", JSON.stringify(technician)); // Store entire technician object
    
    message.success("Login successful!");
    setLoading(false);
  
    // ✅ Redirect to technician dashboard
    router.replace("/technicians");
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
            <Form.Item label="Technician ID" name="technicianId" rules={[{ required: true, message: "Enter your Technician ID!" }]}>
              <Input prefix={<IdcardOutlined />} placeholder="Enter your Technician ID" />
            </Form.Item>

            <Form.Item label="Password" name="password" rules={[{ required: true, message: "Enter your password!" }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </Form.Item>
          </Form>

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
