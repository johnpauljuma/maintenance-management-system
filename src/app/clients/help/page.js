"use client";

import { Layout, Card, Typography, Collapse, Button, Form, Input, message } from "antd";
import { MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { useState } from "react";
import { supabase } from "../../../../lib/supabase";

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const HelpPage = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);

    try {
      const { data, error } = await supabase.from("support_requests").insert([
        {
          name: values.name,
          email: values.email,
          message: values.message,
          status: "Pending",
          created_at: new Date(),
        },
      ]);

      if (error) {
        throw new Error(error.message);
      }

      message.success("Your support request has been submitted!");
    } catch (error) {
      message.error("Failed to submit request. Please try again.");
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Define FAQ items using `items` instead of `children`
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
            <Form.Item
              label="Full Name"
              name="name"
              rules={[{ required: true, message: "Please enter your full name!" }]}
            >
              <Input placeholder="Enter your full name" />
            </Form.Item>

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
