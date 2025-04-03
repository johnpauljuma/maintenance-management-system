"use client";

import { useState, useRef, useEffect, } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Select, DatePicker, Upload, message, Card, Row, Col, Typography, Spin } from "antd";
import { InboxOutlined, EnvironmentOutlined, CalendarOutlined, UserOutlined, PhoneOutlined } from "@ant-design/icons";
import { supabase } from "../../../../lib/supabase";
import Script from 'next/script';
import sendEmails from "../../../../lib/emailService"; 

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const NewRequest = () => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const router = useRouter();

  // Handle file upload change
  const handleChange = ({ fileList }) => {
    // Validate file size (max 5MB)
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
  
      if (authError || !authData?.user) {
        throw new Error("User not authenticated. Please log in.");
      }
  
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user.id;

      console.log("User uuid:", userId);
  
      let imageUrl = null;
  
      // Check if there's a file to upload
      if (fileList.length > 0) {
        const file = fileList[0].originFileObj;
        const fileExt = file.name.split(".").pop();
        const fileName = `request-${Date.now()}.${fileExt}`;
        const filePath = `requests/${fileName}`;
  
        // Upload image to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("request-images")
          .upload(filePath, file);
  
        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }
  
        // Get the public URL of the uploaded image
        const { data: publicUrlData } = supabase.storage
          .from("request-images")
          .getPublicUrl(filePath);
  
        imageUrl = publicUrlData.publicUrl;
      }
  
      const userEmail = authData.user.email;

      // Insert form data into Supabase database
      const { data: insertedRequest, error: error } = await supabase
        .from("requests")
        .insert([{
          client: values.name,
          phone: values.phone,
          title: values.title,
          category: values.category,
          description: values.description,
          preferred_date: values.preferredDate?.format("YYYY-MM-DD"),
          urgency: values.urgency,
          location: values.location,
          image_url: imageUrl,
          status: "Pending",
          user_id: userId,
          client_email: userEmail, // Store the user's email
        }])
  
      if (error) {
        throw new Error(error.message);
      }
  
      console.log("User Email:", userEmail);
      // Send emails (make sure sendEmails is imported)
      await sendEmails({
        ...insertedRequest,
        client: values.name, // Ensure client name is included
        preferred_date: values.preferredDate?.format("YYYY-MM-DD") // Reformat if needed
      }, userEmail);

      

      message.success("Request submitted successfully!");
      router.push("/clients/my-requests"); // Redirect after submission
    } catch (error) {
      message.error(`Failed to submit request: ${error.message}`);
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px 0" }}>

      <Card 
        title={
          <Title level={3} style={{ textAlign: "center", marginBottom: 0 }}>
            ✨ New Maintenance Request
          </Title>
        }
        variant="borderless"
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          overflow: "hidden"
        }}
      >
        <Form layout="vertical" onFinish={onFinish}>
          {/* Personal Info Section */}
          <div style={{ 
            backgroundColor: "#f6f9ff", 
            padding: "16px", 
            borderRadius: "8px", 
            marginBottom: "24px" 
          }}>
            <Title level={5} style={{ color: "#1890ff", marginBottom: "16px" }}>
              <UserOutlined style={{ marginRight: "8px" }} />
              Personal Information
            </Title>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Full Name"
                  name="name"
                  rules={[{ required: true, message: "Please enter your name!" }]}
                >
                  <Input 
                    prefix={<UserOutlined style={{ color: "#bfbfbf" }} />} 
                    placeholder="John Doe" 
                  />
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
                  <Input 
                    prefix={<PhoneOutlined style={{ color: "#bfbfbf" }} />} 
                    placeholder="0712 345 678" 
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Request Details Section */}
          <div style={{ 
            backgroundColor: "#fff9f0", 
            padding: "16px", 
            borderRadius: "8px", 
            marginBottom: "24px" 
          }}>
            <Title level={5} style={{ color: "#fa8c16", marginBottom: "16px" }}>
              🛠️ Request Details
            </Title>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Request Title"
                  name="title"
                  rules={[{ required: true, message: "Please enter a request title!" }]}
                >
                  <Input placeholder="e.g., Leaking faucet in kitchen" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Service Category"
                  name="category"
                  rules={[{ required: true, message: "Please select a category!" }]}
                >
                  <Select placeholder="Select a category">
                    <Option value="electrical">⚡ Electrical</Option>
                    <Option value="plumbing">🚰 Plumbing</Option>
                    <Option value="hvac">❄️ HVAC</Option>
                    <Option value="cleaning">🧹 Cleaning</Option>
                    <Option value="general">🔧 General Repairs</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Description"
              name="description"
              rules={[
                { required: true, message: "Please enter a description!" },
                { min: 3, message: "Description should be at least 3 characters" }
              ]}
            >
              <TextArea 
                rows={4} 
                placeholder="Describe the issue in detail (what, where, when it started, etc.)..." 
                style={{ resize: "none" }}
                showCount 
                maxLength={500}
              />
            </Form.Item>
          </div>

          {/* Scheduling Section */}
          <div style={{ 
            backgroundColor: "#f6ffed", 
            padding: "16px", 
            borderRadius: "8px", 
            marginBottom: "24px" 
          }}>
            <Title level={5} style={{ color: "#52c41a", marginBottom: "16px" }}>
              <CalendarOutlined style={{ marginRight: "8px" }} />
              Scheduling
            </Title>
            <Row gutter={16}>
              <Col xs={24} md={12}>
              <Form.Item 
                label="Preferred Date" 
                name="preferredDate"
                rules={[{ required: true, message: "Please select a preferred date!" }]}
              >
                <DatePicker 
                  style={{ width: "100%" }} 
                  disabledDate={(current) => current && current < new Date().setHours(0, 0, 0, 0)}
                />
              </Form.Item>

              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Urgency Level"
                  name="urgency"
                  rules={[{ required: true, message: "Please select urgency level!" }]}
                >
                  <Select placeholder="How urgent is this?">
                    <Option value="low">🐢 Low (Within 1 week)</Option>
                    <Option value="medium">🚶 Medium (Within 3 days)</Option>
                    <Option value="high">🚑 High (Immediately)</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Location Section */}
          <div style={{ backgroundColor: "#f0f9ff", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
            <Title level={5} style={{ color: "#096dd9", marginBottom: "16px" }}>📍 Location</Title>
            <Form.Item label="Enter Your Location" name="location" rules={[{ required: true, message: "Please enter your location!" }]}>
              <Input prefix={<EnvironmentOutlined />} placeholder="e.g., 123 Street Name, City" />
            </Form.Item>
          </div>

          {/* Image Upload Section */}
          <div style={{ marginBottom: "24px" }}>
            <Title level={5} style={{ marginBottom: "16px" }}>
              📸 Upload Photo (Optional)
            </Title>
            <Form.Item name="image">
              <Upload.Dragger
                name="file"
                listType="picture-card"
                maxCount={1}
                fileList={fileList}
                onChange={handleChange}
                beforeUpload={() => false} // Prevent auto upload
                style={{ borderRadius: "8px" }}
                accept="image/*"
              >
                <div style={{ padding: "16px" }}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined style={{ fontSize: "32px", color: "#1890ff" }} />
                  </p>
                  <p className="ant-upload-text" style={{ marginBottom: "4px" }}>
                    {fileList.length ? "Change photo" : "Click or drag file here"}
                  </p>
                  <p className="ant-upload-hint" style={{ fontSize: "12px" }}>
                    {fileList.length ? 
                      fileList[0].name : 
                      "Supports JPG, PNG (max 5MB)"}
                  </p>
                </div>
              </Upload.Dragger>
            </Form.Item>
          </div>

          {/* Submit Button */}
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              size="large"
              style={{
                height: "48px",
                fontSize: "16px",
                fontWeight: "500",
                borderRadius: "8px"
              }}
              
            >
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default NewRequest;