"use client";

import { useState, useEffect } from "react";
import { Row, Col, Card, Typography, Table, Tag } from "antd";
import { Bar, Line } from "react-chartjs-2";
import {
  SettingOutlined,
  FileDoneOutlined,
  HourglassOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ChartTitle, Tooltip, Legend);

const { Title, Paragraph } = Typography;

const AdminDashboard = () => {
  const [maintenanceStats, setMaintenanceStats] = useState({
    pending: 20,
    inProgress: 35,
    completed: 80,
    total: 135,
  });

  const [requests, setRequests] = useState([]);

  useEffect(() => {
    // Simulate fetching data (Replace with actual API call)
    setTimeout(() => {
      setMaintenanceStats({
        pending: 15,
        inProgress: 40,
        completed: 90,
        total: 145,
      });

      setRequests([
        { key: "1", requestID: "REQ001", client: "John Doe", category: "Electrical", status: "Pending", assignedTo: "Technician A" },
        { key: "2", requestID: "REQ002", client: "Jane Smith", category: "Plumbing", status: "In Progress", assignedTo: "Technician B" },
        { key: "3", requestID: "REQ003", client: "Mike Johnson", category: "HVAC", status: "Completed", assignedTo: "Technician C" },
        { key: "4", requestID: "REQ004", client: "Sarah Lee", category: "Cleaning", status: "Pending", assignedTo: "Technician D" },
      ]);
    }, 2000);
  }, []);

  // 📊 Bar Chart Data (Requests Breakdown)
  const barChartData = {
    labels: ["Pending", "In Progress", "Completed"],
    datasets: [
      {
        label: "Number of Requests",
        data: [maintenanceStats.pending, maintenanceStats.inProgress, maintenanceStats.completed],
        backgroundColor: ["#ff4d4f", "#faad14", "#52c41a"],
      },
    ],
  };

  // 📈 Line Chart Data (Requests Over Time)
  const lineChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "New Requests",
        data: [10, 20, 30, 25, 40, 50],
        borderColor: "#1890ff",
        backgroundColor: "rgba(24, 144, 255, 0.2)",
        fill: true,
      },
      {
        label: "Completed Requests",
        data: [5, 15, 20, 30, 35, 45],
        borderColor: "#52c41a",
        backgroundColor: "rgba(82, 196, 26, 0.2)",
        fill: true,
      },
    ],
  };

  // 📝 Table Columns
  const columns = [
    { title: "Request ID", dataIndex: "requestID", key: "requestID" },
    { title: "Client Name", dataIndex: "client", key: "client" },
    { title: "Category", dataIndex: "category", key: "category" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = status === "Completed" ? "green" : status === "In Progress" ? "orange" : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    { title: "Assigned To", dataIndex: "assignedTo", key: "assignedTo" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      {/* 📌 Page Title */}
      <Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>
        Admin Dashboard
      </Title>

      {/* 📊 Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card title="Pending Requests" bordered={false} style={{ textAlign: "center" }}>
            <HourglassOutlined style={{ fontSize: "40px", color: "#ff4d4f" }} />
            <Title level={3}>{maintenanceStats.pending}</Title>
            <Paragraph>Waiting for Technician</Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card title="In Progress" bordered={false} style={{ textAlign: "center" }}>
            <SettingOutlined style={{ fontSize: "40px", color: "#faad14" }} />
            <Title level={3}>{maintenanceStats.inProgress}</Title>
            <Paragraph>Currently Being Worked On</Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card title="Completed Requests" bordered={false} style={{ textAlign: "center" }}>
            <FileDoneOutlined style={{ fontSize: "40px", color: "#52c41a" }} />
            <Title level={3}>{maintenanceStats.completed}</Title>
            <Paragraph>Successfully Resolved</Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card title="Total Requests" bordered={false} style={{ textAlign: "center" }}>
            <CalendarOutlined style={{ fontSize: "40px", color: "#1890ff" }} />
            <Title level={3}>{maintenanceStats.total}</Title>
            <Paragraph>Overall Requests Logged</Paragraph>
          </Card>
        </Col>
      </Row>

      {/* 📊 Graphs Section */}
      <Row gutter={[16, 16]}>
        {/* 📊 Bar Chart */}
        <Col xs={24} md={12}>
          <Card title="Maintenance Requests Overview" bordered={false}>
            <Bar data={barChartData} />
          </Card>
        </Col>

        {/* 📈 Line Chart */}
        <Col xs={24} md={12}>
          <Card title="Maintenance Requests Over Time" bordered={false}>
            <Line data={lineChartData} />
          </Card>
        </Col>
      </Row>

      {/* 📝 Table for Maintenance Requests */}
      <Card title="Recent Maintenance Requests" style={{ marginTop: "20px" }} bordered={false}>
        <Table columns={columns} dataSource={requests} pagination={{ pageSize: 5 }} />
      </Card>
    </div>
  );
};

export default AdminDashboard;
