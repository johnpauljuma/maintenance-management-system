"use client";

import "@ant-design/v5-patch-for-react-19";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Select, DatePicker, Upload, message, Card, Row, Col } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { supabase } from "../../../../lib/supabase";
import sendEmails from "../../../../lib/emailService"; // Adjust the import path as necessary

const { Option } = Select;
const { TextArea } = Input;

const NewRequest = () => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]); // ✅ Track uploaded files
  const router = useRouter();

  // Handle file upload change
  const handleChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const onFinish = async (values) => {
    setLoading(true);
  
    try {
      // 1. Authenticate user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        throw new Error("User not authenticated. Please log in.");
      }
      const userId = authData.user.id;
  
      // 2. Handle file upload if exists
      let imageUrl = null;
      if (fileList.length > 0) {
        const file = fileList[0].originFileObj;
        const fileExt = file.name.split(".").pop();
        const fileName = `request-${Date.now()}.${fileExt}`;
        const filePath = `requests/${fileName}`;
  
        // Upload with error handling
        const { error: uploadError } = await supabase.storage
          .from("request-images")
          .upload(filePath, file);
        if (uploadError) throw uploadError;
  
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("request-images")
          .getPublicUrl(filePath);
        imageUrl = publicUrl;
      }
  
      // 3. Insert request data (WITH .select() to get the inserted record)
      const { data: insertedRequest, error: insertError } = await supabase
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
        }])
        .select()
        .single(); // Add .select() and .single() to get the inserted record
  
      if (insertError) throw insertError;
  
      // 4. Get user email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();
      if (userError || !userData?.email) throw new Error("Could not retrieve user email");
  
      // 5. Send emails (make sure sendEmails is imported)
      await sendEmails({
        ...insertedRequest,
        client: values.name, // Ensure client name is included
        preferred_date: values.preferredDate?.format("YYYY-MM-DD") // Reformat if needed
      }, userData.email);
  
      // 6. Success
      message.success("Request submitted successfully! Check your email for confirmation.");
      router.push("/clients/my-requests");
      
    } catch (error) {
      console.error("Submission error:", error);
      message.error(`Failed to submit request: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="New Maintenance Request" bordered={false} style={{ maxWidth: 700, margin: "auto", marginTop: 20 }}>
      <Form layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Full Name"
              name="name"
              rules={[{ required: true, message: "Please enter your name!" }]}
            >
              <Input placeholder="Enter client name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[{ required: true, message: "Please enter your phone number!" }]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Request Title"
              name="title"
              rules={[{ required: true, message: "Please enter a request title!" }]}
            >
              <Input placeholder="Enter request title" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Service Category"
              name="category"
              rules={[{ required: true, message: "Please select a category!" }]}
            >
              <Select placeholder="Select a category">
                <Option value="electrical">Electrical Repairs</Option>
                <Option value="plumbing">Plumbing</Option>
                <Option value="hvac">HVAC Maintenance</Option>
                <Option value="cleaning">Cleaning Services</Option>
                <Option value="general">General Repairs</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Description (Spanning Full Width) */}
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please enter a description!" }]}
        >
          <TextArea rows={4} placeholder="Describe the issue in detail" />
        </Form.Item>

        {/* Second Row: Preferred Date & Urgency Level */}
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label="Preferred Date" name="preferredDate">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Urgency Level"
              name="urgency"
              rules={[{ required: true, message: "Please select urgency level!" }]}
            >
              <Select placeholder="Select urgency level">
                <Option value="low">Low</Option>
                <Option value="medium">Medium</Option>
                <Option value="high">High</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Location" name="location">
              <Input style={{ width: "100%" }} placeholder="Enter location" />
            </Form.Item>
          </Col>
        </Row>

        {/* Image Upload */}
        <Form.Item label="Upload Fault Image (Optional)" name="image">
          <Upload.Dragger
            name="file"
            listType="picture"
            maxCount={1}
            fileList={fileList}
            onChange={handleChange}
            beforeUpload={(file) => {
              const isImage = file.type.startsWith("image/");
              if (!isImage) {
                message.error("You can only upload image files!");
              }
              return isImage || Upload.LIST_IGNORE;
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to upload</p>
          </Upload.Dragger>
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default NewRequest;