"use client";

import { useState, useEffect } from "react";
import { Row, Col, Card, Typography } from "antd";
import { Bar, Line } from "react-chartjs-2";
import { SettingOutlined, FileDoneOutlined, HourglassOutlined, CalendarOutlined } from "@ant-design/icons";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title as ChartTitle, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ChartTitle, Tooltip, Legend);

const { Title, Paragraph } = Typography;

const ClientDashboard = () => {
  const [maintenanceStats, setMaintenanceStats] = useState({
    totalRequests: 120,
    pending: 15,
    completed: 85,
    scheduled: 20,
  });

  useEffect(() => {
    // Simulate fetching data (replace with actual API call)
    setTimeout(() => {
      setMaintenanceStats({
        totalRequests: 130,
        pending: 20,
        completed: 90,
        scheduled: 25,
      });
    }, 2000);
  }, []);

  // Bar Chart Data (Maintenance Types)
  const barChartData = {
    labels: ["Electrical", "Plumbing", "HVAC", "Cleaning", "General Repairs"],
    datasets: [
      {
        label: "Requests",
        data: [30, 20, 15, 25, 10],
        backgroundColor: ["#1890ff", "#ff4d4f", "#52c41a", "#faad14", "#722ed1"],
      },
    ],
  };

  // Line Chart Data (Maintenance Trends)
  const lineChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Completed Requests",
        data: [5, 10, 15, 30, 40, 50],
        borderColor: "#1890ff",
        backgroundColor: "rgba(24, 144, 255, 0.2)",
        fill: true,
      },
      {
        label: "Pending Requests",
        data: [3, 5, 10, 8, 6, 4],
        borderColor: "#ff4d4f",
        backgroundColor: "rgba(255, 77, 79, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Dashboard Header */}
      <Title level={2} style={{ marginBottom: "20px", textAlign: "center" }}>
        Client Dashboard
      </Title>

      {/* Maintenance Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card title="Total Requests" bordered={false} style={{ textAlign: "center" }}>
            <FileDoneOutlined style={{ fontSize: "40px", color: "#1890ff" }} />
            <Title level={3}>{maintenanceStats.totalRequests}</Title>
            <Paragraph>All Maintenance Requests</Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card title="Pending Requests" bordered={false} style={{ textAlign: "center" }}>
            <HourglassOutlined style={{ fontSize: "40px", color: "#ff4d4f" }} />
            <Title level={3}>{maintenanceStats.pending}</Title>
            <Paragraph>Waiting for Technician</Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card title="Completed Requests" bordered={false} style={{ textAlign: "center" }}>
            <SettingOutlined style={{ fontSize: "40px", color: "#52c41a" }} />
            <Title level={3}>{maintenanceStats.completed}</Title>
            <Paragraph>Successfully Fixed</Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card title="Scheduled Requests" bordered={false} style={{ textAlign: "center" }}>
            <CalendarOutlined style={{ fontSize: "40px", color: "#faad14" }} />
            <Title level={3}>{maintenanceStats.scheduled}</Title>
            <Paragraph>Planned for Future</Paragraph>
          </Card>
        </Col>
      </Row>

      {/* Graphs Section */}
      <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
        <Col xs={24} md={12}>
          <Card title="Maintenance Requests by Type" bordered={false}>
            <Bar data={barChartData} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Maintenance Trends Over Time" bordered={false}>
            <Line data={lineChartData} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ClientDashboard;
