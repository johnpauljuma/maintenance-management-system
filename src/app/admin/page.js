"use client";

import { useState, useEffect } from "react";
import { Row, Col, Card, Typography, Select } from "antd";
import { Bar, Line } from "react-chartjs-2";
import { SettingOutlined, FileDoneOutlined, HourglassOutlined, CalendarOutlined } from "@ant-design/icons";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title as ChartTitle, Tooltip, Legend } from "chart.js";
import {supabase} from "../../../lib/supabase"; // Adjust path as needed

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ChartTitle, Tooltip, Legend);

const { Title } = Typography;
const { Option } = Select;

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [maintenanceStats, setMaintenanceStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    total: 0,
  });
  const [barChartData, setBarChartData] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);
  const [timeFilter, setTimeFilter] = useState("monthly");

  useEffect(() => {
    const fetchRequests = async () => {
      const { data, error } = await supabase
            .from("requests")
            .select("*");
      
      if (error) {
        console.error("Error fetching requests:", error);
        return;
      }

      setRequests(data);
      calculateStats(data);
      updateCharts(data);
    };

    fetchRequests();
  }, [timeFilter]);

  const calculateStats = (data) => {
    const pending = data.filter((req) => req.status === "Pending").length;
    const inProgress = data.filter((req) => req.status === "In Progress").length;
    const completed = data.filter((req) => req.status === "completed").length;
    setMaintenanceStats({
      pending,
      inProgress,
      completed,
      total: data.length,
    });
  };

  const updateCharts = (data) => {
    // Bar Chart Data
    const categoryCounts = data.reduce((acc, req) => {
      acc[req.category] = (acc[req.category] || 0) + 1;
      return acc;
    }, {});
    
    const categories = Object.keys(categoryCounts);
    const counts = Object.values(categoryCounts);

    setBarChartData({
      labels: categories,
      datasets: [
        {
          label: "Requests",
          data: counts,
          backgroundColor: ["#1890ff", "#ff4d4f", "#52c41a", "#faad14", "#722ed1"],
        },
      ],
    });

    // Line Chart Data
    updateLineChart(data);
  };

  const updateLineChart = (data) => {
    const formatDataByTime = (timeframe) => {
      let labels = [];
      let completedData = [];
      let pendingData = [];
      let inProgressData = [];

      const groupedData = {};
      data.forEach((req) => {
        const date = new Date(req.created_at);
        let key;
        if (timeframe === "daily") {
          key = date.toISOString().split("T")[0]; // YYYY-MM-DD
        } else if (timeframe === "weekly") {
          const weekNumber = Math.ceil(date.getDate() / 7);
          key = `Week ${weekNumber}, ${date.getFullYear()}`;
        } else if (timeframe === "monthly") {
          key = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
        } else {
          key = date.getFullYear().toString();
        }

        if (!groupedData[key]) {
          groupedData[key] = { completed: 0, pending: 0, inProgress: 0 };
        }
        if (req.status === "completed") groupedData[key].completed += 1;
        if (req.status === "Pending") groupedData[key].pending += 1;
        if (req.status === "In Progress") groupedData[key].inProgress += 1;
      });

      labels = Object.keys(groupedData);
      completedData = labels.map((label) => groupedData[label].completed);
      pendingData = labels.map((label) => groupedData[label].pending);
      inProgressData = labels.map((label) => groupedData[label].inProgress);

      return { labels, completedData, pendingData, inProgressData };
    };

    const { labels, completedData, pendingData, inProgressData } = formatDataByTime(timeFilter);

    setLineChartData({
      labels,
      datasets: [
        {
          label: "Completed Requests",
          data: completedData,
          borderColor: "#1890ff",
          backgroundColor: "rgba(24, 144, 255, 0.2)",
          fill: true,
        },
        {
          label: "Pending Requests",
          data: pendingData,
          borderColor: "#ff4d4f",
          backgroundColor: "rgba(255, 77, 79, 0.2)",
          fill: true,
        },
        {
          label: "In Progress",
          data: inProgressData,
          borderColor: "#faad14",
          backgroundColor: "rgba(250, 173, 20, 0.2)",
          fill: true,
        },
      ],
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2} style={{ textAlign: "center" }}>Admin Dashboard</Title>

      <Row gutter={[16, 16]}>
        {[
          { title: "Total Requests", value: maintenanceStats.total, icon: <FileDoneOutlined style={{ fontSize: "30px", color: "#1890ff",  }} /> },
          { title: "Pending Requests", value: maintenanceStats.pending, icon: <HourglassOutlined style={{ fontSize: "30px", color: "#ff4d4f" }} /> },
          { title: "Completed Requests", value: maintenanceStats.completed, icon: <SettingOutlined style={{ fontSize: "30px", color: "#52c41a" }} /> },
          { title: "Requests In Progress", value: maintenanceStats.inProgress, icon: <CalendarOutlined style={{ fontSize: "30px", color: "#faad14" }} /> },
        ].map(({ title, value, icon }) => (
          <Col xs={24} sm={12} md={6} key={title}>
            <Card
              size="small"
              bordered={false}
              style={{
                padding: "10px",
                boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
                borderTop: "5px solid #A61B22",
              }}
            >
              <Row gutter={[16, 0]} align="middle">
                {/* Icon Column */}
                <Col span={6} style={{ textAlign: "center", color: "#A61B22" }}>
                  <div style={{ fontSize: "40px" }}>{icon}</div>
                </Col>

                {/* Text Column */}
                <Col span={18} >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <Title level={5} style={{ marginBottom: "2px", color: "#333", fontSize: "14px" }}>
                      {title}
                    </Title>
                    <Title level={3} style={{ margin: 0, color: "#1890ff", fontSize: "24px", textAlign:"center", backgroundColor:"red"}}>
                      {value}
                    </Title>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>


        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
        <Col xs={24} md={12}>
          <Card title="Requests by Category" bordered={false}>
            {barChartData && (
              <Bar
                data={barChartData}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true }, tooltip: { enabled: true } } }}
                style={{ height: "300px" }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title={
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>Request Trends Over Time</h3>
                <Select defaultValue="monthly" onChange={setTimeFilter} style={{ width: 200 }}>
                  <Option value="daily">Daily</Option>
                  <Option value="weekly">Weekly</Option>
                  <Option value="monthly">Monthly</Option>
                  <Option value="yearly">Yearly</Option>
                </Select>
              </div>
            }
            bordered={false}
          >
            {lineChartData && (
              <Line
                data={lineChartData}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true }, tooltip: { enabled: true } } }}
                style={{ height: "300px" }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
