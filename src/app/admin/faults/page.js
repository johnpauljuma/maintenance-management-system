"use client";

import { useEffect, useState } from "react";
import { Card, Row, Col, Table, Tag, Button, Select, message, Input } from "antd";
import {
  ExclamationCircleOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  UserOutlined,
  ToolOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const AdminManageFaults = () => {
  const [loading, setLoading] = useState(false);
  const [faults, setFaults] = useState([]);
  const [unassignedFaults, setUnassignedFaults] = useState([]);

  useEffect(() => {
    setLoading(true);

    // Dummy Data - Faults Overview
    setTimeout(() => {
      setUnassignedFaults([
        { id: 1, title: "Leaking Pipe", category: "Plumbing", description: "Water leakage in restroom.", urgency: "High" },
        { id: 2, title: "Broken AC", category: "HVAC", description: "AC not cooling properly.", urgency: "Medium" },
      ]);

      setFaults([
        { id: "F001", title: "Electrical Failure", category: "Electrical", status: "New", assigned: "None" },
        { id: "F002", title: "Plumbing Leak", category: "Plumbing", status: "In Progress", assigned: "Technician A" },
        { id: "F003", title: "HVAC Issue", category: "HVAC", status: "Unresolved", assigned: "None" },
        { id: "F004", title: "Broken Window", category: "General Repairs", status: "Completed", assigned: "Technician B" },
        { id: "F005", title: "Lighting Issue", category: "Electrical", status: "New", assigned: "None" },
        { id: "F006", title: "Blocked Drain", category: "Plumbing", status: "In Progress", assigned: "Technician C" },
      ]);

      setLoading(false);
    }, 1500);
  }, []);

  // Assign Technician to Fault
  const handleAssign = (faultId) => {
    message.success(`Technician assigned to fault ID ${faultId}`);
    setUnassignedFaults(unassignedFaults.filter((fault) => fault.id !== faultId));
  };

  // Table Columns
  const columns = [
    { title: "Fault ID", dataIndex: "id", key: "id" },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Category", dataIndex: "category", key: "category" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = status === "Completed" ? "green" : status === "In Progress" ? "orange" : status === "Unresolved" ? "red" : "blue";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Assigned Technician",
      dataIndex: "assigned",
      key: "assigned",
      render: (assigned) => (assigned === "None" ? <Tag color="red">Unassigned</Tag> : assigned),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) =>
        record.assigned === "None" ? (
          <Button type="primary" size="small" onClick={() => handleAssign(record.id)}>
            Assign
          </Button>
        ) : (
          <Tag color="green">Assigned</Tag>
        ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Manage Faults</h2>

      {/* 🔹 Overview Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)", textAlign: "center" }}>
            <ExclamationCircleOutlined style={{ fontSize: "40px", color: "#ff4d4f" }} />
            <h3>New Faults</h3>
            <p>12</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)", textAlign: "center" }}>
            <SyncOutlined style={{ fontSize: "40px", color: "#faad14" }} />
            <h3>In Progress</h3>
            <p>8</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)", textAlign: "center" }}>
            <CheckCircleOutlined style={{ fontSize: "40px", color: "#52c41a" }} />
            <h3>Unresolved</h3>
            <p>5</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)", textAlign: "center" }}>
            <UserOutlined style={{ fontSize: "40px", color: "#1890ff" }} />
            <h3>Available Technicians</h3>
            <p>10</p>
          </Card>
        </Col>
      </Row>

      {/* 🔹 Unassigned Faults */}
      <h3 style={{ margin: "20px 0" }}>Unassigned Faults</h3>
      <Row gutter={[16, 16]}>
        {unassignedFaults.map((fault) => (
          <Col xs={24} sm={12} md={8} key={fault.id}>
            <Card bordered={false} style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
              <h4>{fault.title}</h4>
              <p>
                <b>Category:</b> {fault.category}
              </p>
              <p>
                <b>Urgency:</b> <Tag color={fault.urgency === "High" ? "red" : "orange"}>{fault.urgency}</Tag>
              </p>
              <p>{fault.description}</p>
              <Button type="primary" onClick={() => handleAssign(fault.id)}>
                Assign Technician
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 🔹 Faults Table */}
      <h3 style={{ margin: "30px 0 10px" }}>All Faults</h3>
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: "10px" }}>
        <Col xs={24} sm={12} md={8}>
          <Input prefix={<SearchOutlined />} placeholder="Search Faults..." />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Select defaultValue="all" style={{ width: "100%" }}>
            <Option value="all">All</Option>
            <Option value="new">New</Option>
            <Option value="inprogress">In Progress</Option>
            <Option value="unresolved">Unresolved</Option>
            <Option value="completed">Completed</Option>
          </Select>
        </Col>
      </Row>

      <Table columns={columns} dataSource={faults} loading={loading} rowKey="id" pagination={{ pageSize: 5 }} />
    </div>
  );
};

export default AdminManageFaults;
