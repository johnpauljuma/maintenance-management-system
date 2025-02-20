"use client";

import { useState, useEffect } from "react";
import { Card, Button, Table, Tag, Row, Col, Typography, message } from "antd";
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { supabase } from "../../../../lib/supabase";

const { Title, Text } = Typography;

const TechnicianTasks = () => {
  const [loading, setLoading] = useState(true);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);

  useEffect(() => {
    // Dummy data for UI Testing
    const dummyPendingTasks = [
      { id: "T001", title: "Fix Electrical Wiring", category: "Electrical", client_name: "John Doe", deadline: "2025-02-25" },
      { id: "T002", title: "Plumbing Leak Fix", category: "Plumbing", client_name: "Jane Smith", deadline: "2025-02-26" },
      { id: "T003", title: "HVAC System Repair", category: "HVAC", client_name: "Mark Taylor", deadline: "2025-02-27" },
      { id: "T004", title: "Cleaning Service", category: "Cleaning", client_name: "Emily Johnson", deadline: "2025-02-28" },
    ];

    const dummyAllTasks = [
      { id: "T001", title: "Fix Electrical Wiring", category: "Electrical", status: "Pending", client_name: "John Doe" },
      { id: "T002", title: "Plumbing Leak Fix", category: "Plumbing", status: "Completed", client_name: "Jane Smith" },
      { id: "T003", title: "HVAC System Repair", category: "HVAC", status: "In Progress", client_name: "Mark Taylor" },
      { id: "T004", title: "Cleaning Service", category: "Cleaning", status: "Pending", client_name: "Emily Johnson" },
      { id: "T005", title: "Office Maintenance", category: "General", status: "In Progress", client_name: "Michael Brown" },
      { id: "T006", title: "Replace Light Fixtures", category: "Electrical", status: "Completed", client_name: "Sarah White" },
    ];

    setPendingTasks(dummyPendingTasks);
    setAllTasks(dummyAllTasks);
    setLoading(false);
  }, []);

  // Handle Accept Task
  const handleAccept = (taskID) => {
    message.success(`Task ${taskID} accepted successfully.`);
    setPendingTasks((prev) => prev.filter((task) => task.id !== taskID));
    setAllTasks((prev) => prev.map((task) => (task.id === taskID ? { ...task, status: "In Progress" } : task)));
  };

  // Handle Reject Task
  const handleReject = (taskID) => {
    message.warning(`Task ${taskID} rejected.`);
    setPendingTasks((prev) => prev.filter((task) => task.id !== taskID));
    setAllTasks((prev) => prev.map((task) => (task.id === taskID ? { ...task, status: "Rejected" } : task)));
  };

  // Define columns for the table
  const columns = [
    { title: "Task ID", dataIndex: "id", key: "id" },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Category", dataIndex: "category", key: "category" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = status === "Completed" ? "green" : status === "In Progress" ? "orange" : status === "Pending" ? "blue" : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    { title: "Client Name", dataIndex: "client_name", key: "client_name" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>Technician Tasks</Title>

      {/* 📌 Pending Tasks Section */}
      <Title level={4}>Pending Tasks</Title>
      {pendingTasks.length > 0 ? (
        <Row gutter={[16, 16]}>
          {pendingTasks.map((task) => (
            <Col xs={24} sm={12} md={6} key={task.id}>
              <Card title={task.title} bordered={false} style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
                <Text><strong>Category:</strong> {task.category}</Text>
                <br />
                <Text><strong>Client:</strong> {task.client_name}</Text>
                <br />
                <Text><strong>Status:</strong> <Tag color="blue">Pending</Tag></Text>
                <br />
                <Text><strong>Deadline:</strong> {task.deadline}</Text>
                <br />
                <div style={{ marginTop: "10px", textAlign: "center" }}>
                  <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleAccept(task.id)} style={{ marginRight: "10px" }}>
                    Accept
                  </Button>
                  <Button danger icon={<CloseCircleOutlined />} onClick={() => handleReject(task.id)}>
                    Reject
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Text type="secondary">No pending tasks at the moment.</Text>
      )}

      {/* 📌 All Tasks Table */}
      <Title level={4} style={{ marginTop: "30px" }}>All Tasks</Title>
      <Card bordered={false} style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
        <Table columns={columns} dataSource={allTasks} loading={loading} rowKey="id" pagination={{ pageSize: 5 }} />
      </Card>
    </div>
  );
};

export default TechnicianTasks;
