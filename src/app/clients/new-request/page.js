"use client";

import "@ant-design/v5-patch-for-react-19";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Select, DatePicker, Upload, message, Card, Row, Col } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { supabase } from "../../../../lib/supabase";

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
      const { data, error } = await supabase.from("requests").insert([
        {
          title: values.title,
          category: values.category,
          description: values.description,
          preferred_date: values.preferredDate?.format("YYYY-MM-DD"),
          urgency: values.urgency,
          image_url: fileList.length > 0 ? fileList[0].url : null, // Handle image upload
          status: "Pending", // Default status
          created_at: new Date(),
        },
      ]);

      if (error) {
        throw new Error(error.message);
      }

      message.success("Request submitted successfully!");
      router.push("/clients/requests"); // Redirect to My Requests page
    } catch (error) {
      message.error("Failed to submit request. Please try again.");
      console.error("Error submitting request:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="New Maintenance Request" bordered={false} style={{ maxWidth: 700, margin: "auto", marginTop: 20 }}>
      <Form layout="vertical" onFinish={onFinish}>
        {/* First Row: Request Title & Category */}
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
              label="Category"
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
        <Form.Item label="Upload Image (Optional)" name="image">
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
