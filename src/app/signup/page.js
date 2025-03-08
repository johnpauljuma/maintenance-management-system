"use client";

import "@ant-design/v5-patch-for-react-19";
import { useState } from "react";
import { Layout, Form, Input, Button, Row, Col, Card, Select, Typography, Divider } from "antd";
import Link from "next/link";
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, HomeOutlined, GoogleOutlined } from "@ant-design/icons";
import { supabase } from "../../../lib/supabase";

const { Title } = Typography;
const { Header, Content, Footer } = Layout;
const { Option } = Select;

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "83vh",
    maxHeight: "100vh",
    backgroundColor: "#f0f2f5",
  },
  card: {
    width: "100%",
    maxWidth: "1000px",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
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
    width: "10%",
    backgroundColor: "#A61B22",
    color: "white",
    fontWeight: "bold",
    float: "right"
  },
};

const Signup = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    const { email, password, fullName, phone, address } = values;

    const { user, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { fullName, phone, address },
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Signup successful! Check your email for verification.");
    }

    setLoading(false);
  };

  return (
    <Layout>
      <Header style={styles.header}>Client Signup - AFMMS</Header>

      <Content style={styles.container}>
        <Card style={styles.card}>
          <Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>Create an Account</Title>

          <Form layout="vertical" onFinish={onFinish}>
            <Row gutter={16}>
              {/* Full Name */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Full Name"
                  name="fullName"
                  rules={[{ required: true, message: "Please enter your name!" }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Full Name" />
                </Form.Item>
              </Col>

              {/* Email */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Email Address"
                  name="email"
                  rules={[
                    { required: true, message: "Please enter your email!" },
                    { type: "email", message: "Enter a valid email address!" },
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Email Address" />
                </Form.Item>
              </Col>

              {/* Phone Number */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Phone Number"
                  name="phone"
                  rules={[
                    { required: true, message: "Please enter your phone number!" },
                    { pattern: /^[0-9]{10}$/, message: "Enter a valid 10-digit phone number!" },
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              {/* Address */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Address"
                  name="address"
                  rules={[{ required: true, message: "Please enter your address!" }]}
                >
                  <Input prefix={<HomeOutlined />} placeholder="Address" />
                </Form.Item>
              </Col>

              {/* Maintenance Service Preference */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Preferred Maintenance Service"
                  name="maintenanceType"
                  rules={[{ required: true, message: "Please select a maintenance service!" }]}
                >
                  <Select placeholder="Select Service">
                    <Option value="electrical">Electrical Repairs</Option>
                    <Option value="plumbing">Plumbing</Option>
                    <Option value="hvac">HVAC Maintenance</Option>
                    <Option value="cleaning">Cleaning Services</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>

              {/* Password */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: "Please enter your password!" },
                    { min: 6, message: "Password must be at least 6 characters!" },
                  ]}
                  hasFeedback
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              {/* Confirm Password */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Confirm Password"
                  name="confirmPassword"
                  dependencies={["password"]}
                  hasFeedback
                  rules={[
                    { required: true, message: "Please confirm your password!" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject("Passwords do not match!");
                      },
                    }),
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
                </Form.Item>
              </Col>
            </Row>

            {/* Signup Button */}
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} style={styles.button}>
                {loading ? "Signing Up..." : "Sign Up"}
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{color: "#A61B22", }}>afmms</Divider>

          {/* Already have an account? */}
          <div style={styles.footer}>
            Already have an account? <Link href="/login" style={{ color: "#02245b" }}>Login here</Link>
          </div>
        </Card>
      </Content>

      <Footer style={{ textAlign: "center", backgroundColor: "#02245b", color: "#fff", marginTop: "10px" }}>
        AFMMS ©{new Date().getFullYear()} Created by John Paul
      </Footer>
    </Layout>
  );
};

export default Signup;
