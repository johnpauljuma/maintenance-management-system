"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Select, DatePicker, Upload, message, Card, Row, Col, Typography, Spin } from "antd";
import { InboxOutlined, EnvironmentOutlined, CalendarOutlined, UserOutlined, PhoneOutlined } from "@ant-design/icons";
import { supabase } from "../../../../lib/supabase";

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const NewRequest = () => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const router = useRouter();

  // Handle file upload change
  const handleChange = ({ fileList }) => {
    const validFiles = fileList.filter(file => {
      if (file.size && file.size > 5 * 1024 * 1024) {
        message.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });
    setFileList(validFiles);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Get the logged-in user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) throw new Error("User not authenticated.");

      const userId = authData.user.id;
      let imageUrl = null;

      // Handle file upload if exists
      if (fileList.length > 0) {
        const file = fileList[0].originFileObj;
        const fileExt = file.name.split(".").pop();
        const fileName = `location-${Date.now()}.${fileExt}`;
        const filePath = `locations/${fileName}`;

        // Upload image to Supabase Storage
        const { error: uploadError } = await supabase.storage.from("location-images").upload(filePath, file);
        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage.from("location-images").getPublicUrl(filePath);
        imageUrl = publicUrl;
      }

      // Insert request data
      const { error } = await supabase.from("requests").insert([{
        client: values.name,
        phone: values.phone,
        title: values.title,
        category: values.category,
        description: values.description,
        preferred_date: values.preferredDate?.format("YYYY-MM-DD"),
        urgency: values.urgency,
        location: values.location,
        location_image: imageUrl,
        status: "Pending",
        user_id: userId,
      }]);

      if (error) throw error;

      message.success("Request submitted successfully!");
      router.push("/clients/my-requests");
    } catch (error) {
      console.error("Submission error:", error);
      message.error(`Failed to submit request: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px 0" }}>
      <Card 
        title={<Title level={3} style={{ textAlign: "center", marginBottom: 0 }}>✨ New Maintenance Request</Title>}
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          overflow: "hidden"
        }}
      >
        <Form layout="vertical" onFinish={onFinish}>
          {/* Personal Information */}
          <div style={{ backgroundColor: "#f6f9ff", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
            <Title level={5} style={{ color: "#1890ff", marginBottom: "16px" }}>
              <UserOutlined style={{ marginRight: "8px" }} />
              Personal Information
            </Title>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Full Name" name="name" rules={[{ required: true, message: "Please enter your name!" }]}>
                  <Input prefix={<UserOutlined />} placeholder="John Doe" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item 
                  label="Phone Number" 
                  name="phone" 
                  rules={[
                    { required: true, message: "Please enter your phone number!" },
                    { pattern: /^[0-9]{10,15}$/, message: "Please enter a valid phone number!" }
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="0712 345 678" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Request Details */}
          <div style={{ backgroundColor: "#fff9f0", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
            <Title level={5} style={{ color: "#fa8c16", marginBottom: "16px" }}>🛠️ Request Details</Title>
            <Form.Item label="Request Title" name="title" rules={[{ required: true, message: "Please enter a request title!" }]}>
              <Input placeholder="e.g., Leaking faucet in kitchen" />
            </Form.Item>
            <Form.Item label="Description" name="description" rules={[{ required: true, message: "Please enter a description!" }]}>
              <TextArea rows={4} placeholder="Describe the issue in detail..." showCount maxLength={500} />
            </Form.Item>
          </div>

          {/* Scheduling */}
          <div style={{ backgroundColor: "#f6ffed", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
            <Title level={5} style={{ color: "#52c41a", marginBottom: "16px" }}>📅 Scheduling</Title>
            <Form.Item label="Preferred Date" name="preferredDate" rules={[{ required: true, message: "Please select a date!" }]}>
              <DatePicker style={{ width: "100%" }} suffixIcon={<CalendarOutlined />} />
            </Form.Item>
          </div>

          {/* Location Input & Image Upload */}
          <div style={{ backgroundColor: "#f0f9ff", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
            <Title level={5} style={{ color: "#096dd9", marginBottom: "16px" }}>📍 Location</Title>
            <Form.Item label="Enter Your Location" name="location" rules={[{ required: true, message: "Please enter your location!" }]}>
              <Input prefix={<EnvironmentOutlined />} placeholder="e.g., 123 Street Name, City" />
            </Form.Item>
            <Title level={5} style={{ marginBottom: "16px" }}>📸 Attach Location Screenshot</Title>
            <Form.Item name="locationImage">
              <Upload.Dragger 
                name="file"
                listType="picture-card"
                maxCount={1}
                fileList={fileList}
                onChange={handleChange}
                beforeUpload={() => false}
              >
                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                <p>Click or drag to upload a screenshot</p>
              </Upload.Dragger>
            </Form.Item>
          </div>

          {/* Submit Button */}
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>Submit Request</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default NewRequest;
