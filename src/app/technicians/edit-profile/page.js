"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import { Form, Input, Button, message, Select, Spin, Row, Col, Typography } from "antd";

const { Option } = Select;
const { Title } = Typography;

const EditProfile = () => {
  const router = useRouter();
  const [form] = Form.useForm(); // ✅ Properly initialize form
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTechnician = async () => {
      const technicianId = sessionStorage.getItem("technicianId");
      if (!technicianId) {
        message.error("Technician not logged in.");
        router.replace("/technicians");
        return;
      }

      const { data, error } = await supabase
        .from("technicians")
        .select("*")
        .eq("technician_id", technicianId)
        .single();

      if (error || !data) {
        message.error("Failed to fetch profile.");
        router.replace("/technicians");
      } else {
        form.setFieldsValue(data); // ✅ Set initial form values
      }
      setLoading(false);
    };

    fetchTechnician();
  }, [router, form]);

  // Handle profile update
  const handleUpdate = async (values) => {
    setSaving(true);
    const technicianId = sessionStorage.getItem("technicianId");

    const { error } = await supabase
      .from("technicians")
      .update(values)
      .eq("technician_id", technicianId);

    if (error) {
      message.error("Failed to update profile.");
    } else {
      message.success("Profile updated successfully!");
      router.push("/technicians/profile");
    }

    setSaving(false);
  };

  if (loading) return <Spin size="large" style={{ display: "block", margin: "auto", marginTop: "50px" }} />;

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 30 }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: 20 }}>Edit Profile</Title>
      
      {/* ✅ Pass the `form` prop explicitly */}
      <Form form={form} layout="vertical" onFinish={handleUpdate}>
        <Row gutter={24}>
          {/* Left Column */}
          <Col xs={24} md={12}>
            <Form.Item name="technician_id" label="Technician ID">
              <Input disabled />
            </Form.Item>

            <Form.Item name="name" label="Full Name" rules={[{ required: true, message: "Enter your name" }]}>
              <Input />
            </Form.Item>

            <Form.Item name="email" label="Email">
              <Input />
            </Form.Item>

            <Form.Item name="phone" label="Phone">
              <Input />
            </Form.Item>

            <Form.Item name="specialization" label="Specialization">
              <Input />
            </Form.Item>
          </Col>

          {/* Right Column */}
          <Col xs={24} md={12}>
            <Form.Item name="location" label="Work Location">
              <Input />
            </Form.Item>

            <Form.Item name="address" label="Address">
              <Input />
            </Form.Item>

            <Form.Item name="status" label="Status">
              <Input disabled />
            </Form.Item>

            <Form.Item name="availability" label="Availability">
              <Input disabled />
            </Form.Item>

            <Form.Item name="rating" label="Rating">
              <Input disabled />
            </Form.Item>
          </Col>
        </Row>

        <Button type="primary" htmlType="submit" loading={saving} block>
          Save Changes
        </Button>
      </Form>
    </div>
  );
};

export default EditProfile;
