"use client";

import { useEffect, useState } from "react";
import { Card, Row, Col, Table, Tag, Button, Select, Input } from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  StopOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const ManageTechnicians = () => {
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState([]);

  useEffect(() => {
    setLoading(true);

    // Dummy Data - Technicians Overview & Table
    setTimeout(() => {
      setTechnicians([
        { id: "T001", name: "John Doe", specialization: "Electrical", status: "Available", rating: 4.5 },
        { id: "T002", name: "Jane Smith", specialization: "Plumbing", status: "Assigned", rating: 4.0 },
        { id: "T003", name: "Mike Johnson", specialization: "HVAC", status: "Available", rating: 4.8 },
        { id: "T004", name: "Sarah Lee", specialization: "Cleaning", status: "Inactive", rating: 3.5 },
        { id: "T005", name: "Robert Brown", specialization: "General Repairs", status: "Assigned", rating: 4.2 },
        { id: "T006", name: "Emily Wilson", specialization: "Electrical", status: "Available", rating: 4.9 },
      ]);

      setLoading(false);
    }, 1500);
  }, []);

  // Table Columns
  const columns = [
    { title: "Technician ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Specialization", dataIndex: "specialization", key: "specialization" },
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
    { title: "Rating", dataIndex: "rating", key: "rating", render: (rating) => `${rating} ⭐` },
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
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Manage Technicians</h2>

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
            <p>{technicians.filter((tech) => tech.status === "Available").length}</p>
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
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: "10px" }}>
        <Col xs={24} sm={12} md={8}>
          <Input prefix={<SearchOutlined />} placeholder="Search Technicians..." />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Select defaultValue="all" style={{ width: "100%" }}>
            <Option value="all">All</Option>
            <Option value="available">Available</Option>
            <Option value="assigned">Assigned</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </Col>
      </Row>

      <Table columns={columns} dataSource={technicians} loading={loading} rowKey="id" pagination={{ pageSize: 5 }} />
    </div>
  );
};

export default ManageTechnicians;
