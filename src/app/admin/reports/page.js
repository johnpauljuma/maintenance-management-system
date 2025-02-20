"use client";

import "@ant-design/v5-patch-for-react-19";
import { useEffect, useState } from "react";
import { Card, Row, Col } from "antd";
import {
  UserOutlined,
  ToolOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title as ChartTitle,
  Tooltip,
  Legend,
  
} from "chart.js";
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement, 
    RadialLinearScale,
    ChartTitle,
    Tooltip,
    Legend
  );
import { Bar, Line, Doughnut, Pie, Radar } from "react-chartjs-2";

// Register ChartJS Components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ChartTitle, Tooltip, Legend);

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({});

  useEffect(() => {
    setLoading(true);

    // Simulated API Data
    setTimeout(() => {
      setReportData({
        activeClients: 120,
        activeTechnicians: 45,
        unresolvedFaults: 30,
        resolvedFaults: 250,
        totalFaults: 280,
      });

      setLoading(false);
    }, 1500);
  }, []);

  // 📊 Bar Chart: Faults Overview
  const barChartData = {
    labels: ["Unresolved", "Resolved", "Total"],
    datasets: [
      {
        label: "Faults",
        data: [30, 250, 280],
        backgroundColor: ["#ff4d4f", "#52c41a", "#1890ff"],
      },
    ],
  };

  // 📈 Line Chart: Faults Over Time
  const lineChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "New Faults",
        data: [5, 15, 20, 35, 25, 30],
        borderColor: "#1890ff",
        backgroundColor: "rgba(24, 144, 255, 0.2)",
        fill: true,
      },
      {
        label: "Resolved Faults",
        data: [2, 10, 15, 25, 22, 28],
        borderColor: "#52c41a",
        backgroundColor: "rgba(82, 196, 26, 0.2)",
        fill: true,
      },
    ],
  };

  // 🍩 Doughnut Chart: Fault Distribution by Category
  const doughnutChartData = {
    labels: ["Electrical", "Plumbing", "HVAC", "Cleaning", "General Repairs"],
    datasets: [
      {
        label: "Faults",
        data: [40, 30, 20, 15, 10],
        backgroundColor: ["#1890ff", "#ff4d4f", "#52c41a", "#faad14", "#722ed1"],
      },
    ],
  };

  // 🥧 Pie Chart: Technician Availability
  const pieChartData = {
    labels: ["Available", "Assigned", "Inactive"],
    datasets: [
      {
        label: "Technicians",
        data: [25, 15, 5],
        backgroundColor: ["#52c41a", "#faad14", "#ff4d4f"],
      },
    ],
  };

  // 📊 Radar Chart: Fault Severity
  const radarChartData = {
    labels: ["Low", "Medium", "High", "Critical"],
    datasets: [
      {
        label: "Faults by Severity",
        data: [50, 80, 100, 50],
        borderColor: "#1890ff",
        backgroundColor: "rgba(24, 144, 255, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>System Reports & Analytics</h2>

      {/* 🔹 Overview Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={4}>
          <Card bordered={false} style={{ textAlign: "center", boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
            <UserOutlined style={{ fontSize: "40px", color: "#1890ff" }} />
            <h3>Active Clients</h3>
            <p>{reportData.activeClients}</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={4}>
          <Card bordered={false} style={{ textAlign: "center", boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
            <ToolOutlined style={{ fontSize: "40px", color: "#52c41a" }} />
            <h3>Active Technicians</h3>
            <p>{reportData.activeTechnicians}</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={4}>
          <Card bordered={false} style={{ textAlign: "center", boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
            <ExclamationCircleOutlined style={{ fontSize: "40px", color: "#ff4d4f" }} />
            <h3>Unresolved Faults</h3>
            <p>{reportData.unresolvedFaults}</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={4}>
          <Card bordered={false} style={{ textAlign: "center", boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
            <CheckCircleOutlined style={{ fontSize: "40px", color: "#52c41a" }} />
            <h3>Resolved Faults</h3>
            <p>{reportData.resolvedFaults}</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={4}>
          <Card bordered={false} style={{ textAlign: "center", boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
            <FileTextOutlined style={{ fontSize: "40px", color: "#1890ff" }} />
            <h3>Total Faults</h3>
            <p>{reportData.totalFaults}</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card bordered={false} style={{ textAlign: "center", boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
            <FileTextOutlined style={{ fontSize: "40px", color: "#1890ff" }} />
            <h3>Total Faults</h3>
            <p>{reportData.totalFaults}</p>
          </Card>
        </Col>
      </Row>

      {/* 🔹 Graphs Section */}
      <h3 style={{ margin: "30px 0 10px" }}>Reports & Graphs</h3>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Faults Overview" bordered={false}>
            <Bar data={barChartData} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Fault Trends Over Time" bordered={false}>
            <Line data={lineChartData} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
        <Col xs={24} md={12}>
          <Card title="Fault Distribution by Category" bordered={false}>
            <Doughnut data={doughnutChartData} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Technician Availability" bordered={false}>
            <Pie data={pieChartData} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
        <Col xs={24} md={12}>
          <Card title="Fault Severity Levels" bordered={false}>
            <Radar data={radarChartData} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Reports;
