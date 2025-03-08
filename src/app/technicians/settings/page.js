"use client";

import { useState, useEffect } from "react";
import { Form, Input, Button, Card, Switch, TimePicker, message, Typography, Divider, Select } from "antd";
import { UserOutlined, LockOutlined, BellOutlined, ClockCircleOutlined, BulbOutlined } from "@ant-design/icons";
import { supabase } from "../../../../lib/supabase";
import dayjs from "dayjs";
import bcrypt from "bcryptjs";

const { Title } = Typography;
const { Option } = Select;

const TechnicianSettings = () => {
  const [loading, setLoading] = useState(false);
  const [technician, setTechnician] = useState(null);
  const [availability, setAvailability] = useState(true);
  const [theme, setTheme] = useState("system"); // Default to system theme
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchTechnician = async () => {
      const technicianId = sessionStorage.getItem("technicianId");
      if (!technicianId) {
        message.error("Technician not logged in.");
        return;
      }

      const { data, error } = await supabase
        .from("technicians")
        .select("*")
        .eq("technician_id", technicianId)
        .single();

      if (error || !data) {
        message.error("Failed to fetch settings.");
        return;
      }

      setTechnician(data);
      setAvailability(data.availability === "yes");
      form.setFieldsValue({
        fullName: data.full_name,
        email: data.email,
        phone: data.phone,
        receiveNotifications: data.receive_notifications,
      });

      // Load theme preference
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme) setTheme(storedTheme);
    };

    fetchTechnician();
  }, [form]);

  /** 🔐 Handle Password Change */
  const handlePasswordChange = async (values) => {
    const technicianId = sessionStorage.getItem("technicianId");

    const { data, error } = await supabase
      .from("technicians")
      .select("password")
      .eq("technician_id", technicianId)
      .single();

    if (error || !data) {
      message.error("Failed to verify password.");
      return;
    }

    const isMatch = await bcrypt.compare(values.currentPassword, data.password);
    if (!isMatch) {
      message.error("Current password is incorrect.");
      return;
    }

    if (values.newPassword !== values.confirmPassword) {
      message.error("New passwords do not match.");
      return;
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 10);
    const { error: updateError } = await supabase
      .from("technicians")
      .update({ password: hashedPassword })
      .eq("technician_id", technicianId);

    if (updateError) {
      message.error("Failed to update password.");
    } else {
      message.success("Password updated successfully!");
    }
  };

  /** ✅ Update Availability */
  const handleAvailabilityChange = async (checked) => {
    setAvailability(checked);
    const technicianId = sessionStorage.getItem("technicianId");

    const { error } = await supabase
      .from("technicians")
      .update({ availability: checked ? "yes" : "no" })
      .eq("technician_id", technicianId);

    if (error) {
      message.error("Failed to update availability.");
    } else {
      message.success(`Availability updated to ${checked ? "Active" : "Inactive"}`);
    }
  };
  
  /** 🎨 Handle Theme Change */
  const handleThemeChange = (value) => {
    setTheme(value);
    localStorage.setItem("theme", value);
    document.documentElement.setAttribute("data-theme", value);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>
        Technician Settings
      </Title>

      {/* 🔐 Password Update Section */}
      <Card bordered={false} style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
        <Title level={4}>Change Password</Title>
        <Form layout="vertical" onFinish={handlePasswordChange}>
          <Form.Item label="Current Password" name="currentPassword" rules={[{ required: true, message: "Enter current password!" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Enter current password" />
          </Form.Item>

          <Form.Item label="New Password" name="newPassword" rules={[{ required: true, message: "Enter new password!" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Enter new password" />
          </Form.Item>

          <Form.Item label="Confirm Password" name="confirmPassword" rules={[{ required: true, message: "Confirm new password!" }]}>
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

      {/* 🔔 Notification Preferences */}
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

      {/* ✅ Availability Section */}
      <Card bordered={false} style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
        <Title level={4}>Availability Settings</Title>
        <Form form={form} layout="vertical">
          <Form.Item label="Available for Tasks">
            <Switch
              checked={availability}
              onChange={(checked) => setAvailability(checked)}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" onClick={handleAvailabilityChange} block>
              Save Availability
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Divider />

      {/* 🎨 Personalization */}
      <Card bordered={false} style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
        <Title level={4}>Theme Preferences</Title>
        <Form layout="vertical">
          <Form.Item label="Choose Theme">
            <Select value={theme} onChange={handleThemeChange} style={{ width: "100%" }}>
              <Option value="light">
                🌞 Light Mode
              </Option>
              <Option value="dark">
                🌙 Dark Mode
              </Option>
              <Option value="system">
                🖥 System Default
              </Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TechnicianSettings;
