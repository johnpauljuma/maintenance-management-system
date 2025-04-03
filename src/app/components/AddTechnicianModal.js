"use client";

import "@ant-design/v5-patch-for-react-19";
import { useState } from "react";
import { Modal, Form, Input, Select, DatePicker, Button, Row, Col, message } from "antd";
import { supabase } from "../../../lib/supabase";
import bcrypt from "bcryptjs";

const { Option } = Select;

const AddTechnicianModal = ({ isOpen, onClose }) => {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleSubmit = async (values) => {
    setConfirmLoading(true);
    const { email, password, technicianId, name, specialization, location, availability, dateJoined } = values;
  
    try {
      // Encrypt password before storing
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Insert technician details into Supabase
      console.log("📦 Saving technician data in Supabase...");
      const { error: dbError } = await supabase.from("technicians").insert([
        {
          technician_id: technicianId,
          name,
          email,
          password: hashedPassword,
          specialization,
          location,
          availability,
          date_joined: dateJoined ? dateJoined.format("YYYY-MM-DD") : null,
        },
      ]);
  
      if (dbError) throw new Error(dbError.message);
      console.log("✅ Technician data saved!");
  
      message.success("Technician added successfully!");
      form.resetFields();
      onClose();
  
    } catch (error) {
      console.error("❌ Error:", error.message);
      message.error(error.message || "Failed to add technician.");
    } finally {
      setConfirmLoading(false);
    }
  };
  
  return (
    <Modal
      title="Add New Technician"
      open={isOpen}
      onCancel={onClose}
      confirmLoading={confirmLoading}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Close
        </Button>,
        <Button key="submit" type="primary" onClick={form.submit}>
          Submit
        </Button>,
      ]}
      width={700}
    >
      <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: "10px" }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Technician ID" name="technicianId" rules={[{ required: true, message: "Enter technician ID" }]}>
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="dateJoined" label="Date Joined" rules={[{ required: true, message: "Select joining date" }]}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Technician Name" rules={[{ required: true, message: "Enter technician name" }]}>
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Enter a valid email" }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="password" label="Password" rules={[{ required: true, message: "Enter password" }]}>
                <Input.Password />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Confirm your password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      return !value || getFieldValue("password") === value
                        ? Promise.resolve()
                        : Promise.reject(new Error("Passwords do not match!"));
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="specialization" label="Specialization" rules={[{ required: true, message: "Select specialization" }]}>
                <Select placeholder="Select specialization">
                  <Option value="Electrical">Electrical</Option>
                  <Option value="Plumbing">Plumbing</Option>
                  <Option value="HVAC">HVAC</Option>
                  <Option value="Cleaning">Cleaning</Option>
                  <Option value="General Repairs">General Repairs</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="location" label="Location" rules={[{ required: true, message: "Enter location" }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="availability" label="Availability" rules={[{ required: true, message: "Select availability" }]}>
                <Select>
                  <Option value="Yes">Yes</Option>
                  <Option value="No">No</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
};

export default AddTechnicianModal;
