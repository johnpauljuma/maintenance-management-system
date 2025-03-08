"use client";

import "@ant-design/v5-patch-for-react-19";
import { useEffect, useState } from "react";
import { Card, Row, Col, Table, Tag, Button, message } from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  StopOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { supabase } from "../../../../lib/supabase";
import AddTechnicianModal from "../../components/AddTechnicianModal";

const ManageTechnicians = () => {
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Technicians from Supabase
  useEffect(() => {
    const fetchTechnicians = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("technicians").select("*");

      if (error) {
        console.error("Error fetching technicians:", error.message);
        message.error("Failed to load technicians.");
      } else {
        setTechnicians(data);
      }
      setLoading(false);
    };

    fetchTechnicians();
  }, []);

  // Handle adding a new technician
  const handleAddTechnician = async (newTechnician) => {
    setLoading(true);

    const { data, error } = await supabase.from("technicians").insert([newTechnician]).select();

    if (error) {
      console.error("Error adding technician:", error.message);
      message.error("Failed to add technician.");
    } else {
      setTechnicians([...technicians, ...data]);
      message.success("Technician added successfully!");
    }

    setLoading(false);
  };

  // Table Columns
  const columns = [
    { title: "Technician ID", dataIndex: "technician_id", key: "technician_id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Specialization", dataIndex: "specialization", key: "specialization" },
    { title: "Location", dataIndex: "location", key: "location" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color =
          status === "Available" ? "green" :
          status === "Assigned" ? "blue" :
          "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    { title: "Rating", dataIndex: "rating", key: "rating", render: (rating) => `${rating || 0} ⭐` },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button type="primary" size="small">
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      {/* 🔹 Page Title & Add Button */}
      <Row justify="space-between" align="middle" style={{ marginBottom: "20px" }}>
        <Col>
          <h2>Manage Technicians</h2>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Add New Technician
          </Button>
        </Col>
      </Row>

      {/* 🔹 Overview Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ textAlign: "center", boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
            <UserOutlined style={{ fontSize: "40px", color: "#1890ff" }} />
            <h3>Total Technicians</h3>
            <p>{technicians.length}</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ textAlign: "center", boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
            <CheckCircleOutlined style={{ fontSize: "40px", color: "#52c41a" }} />
            <h3>Available</h3>
            <p>{technicians.filter((tech) => tech.availability === "TRUE").length}</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ textAlign: "center", boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
            <ToolOutlined style={{ fontSize: "40px", color: "#faad14" }} />
            <h3>Assigned</h3>
            <p>{technicians.filter((tech) => tech.status === "Assigned").length}</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ textAlign: "center", boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
            <StopOutlined style={{ fontSize: "40px", color: "#ff4d4f" }} />
            <h3>Inactive</h3>
            <p>{technicians.filter((tech) => tech.status === "Inactive").length}</p>
          </Card>
        </Col>
      </Row>

      {/* 🔹 Technician Table */}
      <h3 style={{ margin: "30px 0 10px" }}>Technician List</h3>
      <Table columns={columns} dataSource={technicians} loading={loading} rowKey="id" pagination={{ pageSize: 5 }} />

      {/* 🔹 Add Technician Modal */}
      <AddTechnicianModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddTechnician={handleAddTechnician} />
    </div>
  );
};

export default ManageTechnicians;
