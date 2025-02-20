"use client";

import "@ant-design/v5-patch-for-react-19";
import { useState } from "react";
import { Layout, Form, Input, Button, Card, Switch, Upload, message, Row, Col } from "antd";
import { UserOutlined, MailOutlined, LockOutlined, UploadOutlined } from "@ant-design/icons";

const { Content } = Layout;

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]); // ✅ Correct usage

  const onFinish = (values) => {
    setLoading(true);

    // Simulate API request
    setTimeout(() => {
      message.success("Settings updated successfully!");
      setLoading(false);
    }, 2000);
  };

  return (
    <Layout style={{ padding: "20px", backgroundColor: "#f0f2f5" }}>
      <Content>
        <Card title="Admin Settings" bordered={false} style={{ borderTop: "4px solid #a61b22" }}>
          <Form layout="vertical" onFinish={onFinish}>
            
            {/* Profile Information */}
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Full Name" name="fullName" rules={[{ required: true, message: "Enter your full name!" }]}>
                  <Input prefix={<UserOutlined />} placeholder="Admin Name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Email Address" name="email" rules={[{ required: true, type: "email", message: "Enter a valid email!" }]}>
                  <Input prefix={<MailOutlined />} placeholder="admin@example.com" />
                </Form.Item>
              </Col>
            </Row>

            {/* Upload Profile Picture */}
            <Form.Item label="Profile Picture" name="profilePic">
              <Upload
                name="file"
                listType="picture"
                maxCount={1}
                fileList={fileList} // ✅ Fixed Upload Warning
                onChange={({ fileList }) => setFileList(fileList)}
                beforeUpload={() => false} // Prevent auto-upload
              >
                <Button icon={<UploadOutlined />} style={{ backgroundColor: "#a61b22", color: "#fff", border: "none" }}>
                  Upload Profile Picture
                </Button>
              </Upload>
            </Form.Item>

            {/* Change Password */}
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="New Password" name="password" rules={[{ required: true, message: "Enter a new password!" }]}>
                  <Input.Password prefix={<LockOutlined />} placeholder="New Password" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Confirm Password" name="confirmPassword" dependencies={["password"]} hasFeedback
                  rules={[
                    { required: true, message: "Confirm your password!" },
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

            {/* System Settings */}
            <Card title="System Preferences" bordered={false} style={{  color: "#fff", marginBottom: "10px" }}>
              <Form.Item label="Enable Auto-Assignment" style={{ color: "#fff" }}>
                <Switch defaultChecked />
              </Form.Item>
            </Card>

            {/* Notification & Security */}
            <Card title="Notifications & Security" bordered={false} style={{ color: "#fff" }}>
              <Form.Item label="Enable Email Alerts" style={{ color: "#fff" }}>
                <Switch defaultChecked />
              </Form.Item>
              <Form.Item label="Enable Two-Factor Authentication" style={{ color: "#fff" }}>
                <Switch />
              </Form.Item>
            </Card>

            {/* Save Changes Button */}
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block style={{ backgroundColor: "#a61b22", border: "none", width:"10%" }}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </Form.Item>

          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default AdminSettings;
