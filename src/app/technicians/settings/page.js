"use client";

import { useState, useEffect } from "react";
import { Form, Input, Button, Card, Switch, TimePicker, message, Typography, Divider } from "antd";
import { UserOutlined, LockOutlined, BellOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { supabase } from "../../../../lib/supabase";
import dayjs from "dayjs";

const { Title } = Typography;

const TechnicianSettings = () => {
  const [loading, setLoading] = useState(false);
  const [technician, setTechnician] = useState(null);
  const [availability, setAvailability] = useState({
    isAvailable: true,
    startTime: "08:00",
    endTime: "17:00",
  });

  const [form] = Form.useForm();

  useEffect(() => {
    const fetchTechnician = async () => {
      // Simulated technician data for UI
      const dummyTechnician = {
        fullName: "John Doe",
        email: "johndoe@example.com",
        phone: "+1 (555) 123-4567",
        receiveNotifications: true,
      };
      setTechnician(dummyTechnician);
      form.setFieldsValue(dummyTechnician);
    };

    fetchTechnician();
  }, [form]);

  const handleProfileUpdate = async (values) => {
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      setTechnician(values);
      message.success("Profile updated successfully!");
      setLoading(false);
    }, 1500);
  };

  const handlePasswordChange = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      message.success("Password updated successfully!");
      setLoading(false);
    }, 1500);
  };

  const handleAvailabilityChange = (field, value) => {
    setAvailability((prev) => ({ ...prev, [field]: value }));
  };

  const saveAvailability = () => {
    message.success("Availability updated successfully!");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>
        Technician Settings
      </Title>

      {/* 🔹 Profile Information Section */}
      <Card bordered={false} style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
        <Title level={4}>Profile Information</Title>
        <Form form={form} layout="vertical" onFinish={handleProfileUpdate}>
          <Form.Item label="Full Name" name="fullName" rules={[{ required: true, message: "Please enter your full name!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Enter full name" />
          </Form.Item>

          <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Enter a valid email!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Enter email" disabled />
          </Form.Item>

          <Form.Item label="Phone Number" name="phone" rules={[{ required: true, message: "Enter your phone number!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Update Profile
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Divider />

      {/* 🔹 Password Update Section */}
      <Card bordered={false} style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
        <Title level={4}>Change Password</Title>
        <Form layout="vertical" onFinish={handlePasswordChange}>
          <Form.Item label="New Password" name="newPassword" rules={[{ required: true, message: "Enter new password!" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Enter new password" />
          </Form.Item>

          <Form.Item label="Confirm Password" name="confirmPassword" rules={[{ required: true, message: "Confirm your password!" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Update Password
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Divider />

      {/* 🔹 Notification Preferences */}
      <Card bordered={false} style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
        <Title level={4}>Notification Preferences</Title>
        <Form layout="vertical">
          <Form.Item label="Receive Maintenance Notifications">
            <Switch
              checked={technician?.receiveNotifications}
              onChange={(checked) => {
                setTechnician((prev) => ({ ...prev, receiveNotifications: checked }));
                message.success(`Notifications ${checked ? "enabled" : "disabled"}`);
              }}
            />
          </Form.Item>
        </Form>
      </Card>

      <Divider />

      {/* 🔹 Availability Section */}
      <Card bordered={false} style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
        <Title level={4}>Availability Settings</Title>

        <Form layout="vertical">
          <Form.Item label="Available for Tasks">
            <Switch
              checked={availability.isAvailable}
              onChange={(checked) => handleAvailabilityChange("isAvailable", checked)}
            />
          </Form.Item>

          <Form.Item label="Working Hours">
            <TimePicker.RangePicker
              format="HH:mm"
              value={[dayjs(availability.startTime, "HH:mm"), dayjs(availability.endTime, "HH:mm")]}
              onChange={(times) => {
                if (times) {
                  handleAvailabilityChange("startTime", times[0].format("HH:mm"));
                  handleAvailabilityChange("endTime", times[1].format("HH:mm"));
                }
              }}
              prefix={<ClockCircleOutlined />}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" onClick={saveAvailability} block>
              Save Availability
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TechnicianSettings;
