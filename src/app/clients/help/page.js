"use client";

import { Layout, Card, Typography, Collapse, Button, Form, Input, message, Col, Row } from "antd";
import { MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const HelpPage = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Fetch logged-in client from session
  useEffect(() => {
    const storedUser = sessionStorage.getItem("clientDetails");
    if (storedUser) {
      const client = JSON.parse(storedUser);
      setUser(client);
    } else {
      message.error("User not found. Please log in again.");
    }
  }, []);

  const onFinish = async (values) => {
    setLoading(true);

    try {
      const { error } = await supabase.from("support_requests").insert([
        {
          client_name: values.name,
          email: values.email,
          phone: values.phone, 
          message: values.message,
        },
      ]);

      if (error) {
        throw new Error(error.message);
      }

      // Notify the client
      await supabase.from("notifications").insert([
        {
          user_id: user.id, 
          message: `Your inquiry has been successfully submitted! Our support team will review it, and one of our administrators will be in touch with you shortly. Thank you for reaching out!`, 
          client: "yes", 
          client_recipient_id: user.id, 
          date: new Date(), 
          status: "unread",
        },
      ]);

      // Notify the admin
      await supabase.from("notifications").insert([
        {
          user_id: user.id, 
          message: `You have received a new support request from ${values.name}. Please review the details and take the necessary action promptly.`,
          admin: "yes",
          date: new Date(),
          status: "unread",
        },
      ]);

      message.success("Your support request has been submitted!");
    } catch (error) {
      message.error("Failed to submit request. Please try again.");
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Define FAQ items using `items` instead of `children`
  const faqItems = [
    {
      key: "1",
      label: "How do I submit a maintenance request?",
      children: <Paragraph>Go to the "New Request" page, fill in the details, and submit the request. You can track it under "My Requests."</Paragraph>,
    },
    {
      key: "2",
      label: "How can I check the status of my request?",
      children: <Paragraph>Navigate to "My Requests" to see the status of your submitted maintenance requests.</Paragraph>,
    },
    {
      key: "3",
      label: "What if my issue is urgent?",
      children: <Paragraph>When submitting a request, select "High" urgency. Our team will prioritize it accordingly.</Paragraph>,
    },
    {
      key: "4",
      label: "How do I contact support?",
      children: <Paragraph>You can reach out to support using the contact details below or by submitting a support request.</Paragraph>,
    },
  ];

  return (
    <Layout style={{ padding: "20px" }}>
      <Content>
        {/* Help Section */}
        <Card title="Help & Support" bordered={false} style={{ maxWidth: 800, margin: "auto" }}>
          <Title level={3} style={{ textAlign: "center" }}>
            How Can We Help You?
          </Title>
          <Paragraph style={{ textAlign: "center", color: "#555" }}>
            Browse the FAQs or contact our support team for further assistance.
          </Paragraph>

          {/* ✅ Fixed FAQ Section */}
          <Collapse accordion items={faqItems} />
        </Card>

        {/* Contact Section */}
        <Card title="Contact Support" bordered={false} style={{ maxWidth: 800, margin: "20px auto" }}>
          <Paragraph>
            <MailOutlined /> <strong>Email:</strong> support@afmms.com
          </Paragraph>
          <Paragraph>
            <PhoneOutlined /> <strong>Phone:</strong> +1 (555) 123-4567
          </Paragraph>
          <Paragraph>Our support team is available 24/7 to assist you.</Paragraph>
        </Card>

        {/* Support Request Form */}
        <Card title="Submit a Support Request" bordered={false} style={{ maxWidth: 800, margin: "auto" }}>
          <Form layout="vertical" onFinish={onFinish}>
            <Row gutter={16}>
              <Col span={8} flex="auto">
                <Form.Item
                  label="Full Name"
                  name="name"
                  rules={[{ required: true, message: "Please enter your full name!" }]}
                >
                  <Input placeholder="Enter your full name" />
                </Form.Item>
              </Col>

              <Col span={8} flex="auto">
                <Form.Item
                  label="Email Address"
                  name="email"
                  rules={[
                    { required: true, message: "Please enter your email!" },
                    { type: "email", message: "Enter a valid email address!" },
                  ]}
                >
                  <Input placeholder="Enter your email" />
                </Form.Item>
              </Col>

              <Col span={8} flex="auto">
                <Form.Item
                  label="Phone Number"
                  name="phone"
                  rules={[
                    { required: true, message: "Please enter your phone number!" },
                    { pattern: /^[0-9]+$/, message: "Enter a valid phone number!" },
                  ]}
                >
                  <Input placeholder="Enter your phone number" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Describe Your Issue"
              name="message"
              rules={[{ required: true, message: "Please describe your issue!" }]}
            >
              <TextArea rows={4} placeholder="Enter details of your issue" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default HelpPage;
