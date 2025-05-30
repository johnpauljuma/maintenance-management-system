"use client";

import { useState, useEffect } from "react";
import React from 'react';
import { Row, Col, Card, Typography, Select } from "antd";
import { Bar, Line } from "react-chartjs-2";
import { SettingOutlined, FileDoneOutlined, HourglassOutlined, CalendarOutlined } from "@ant-design/icons";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title as ChartTitle, Tooltip, Legend } from "chart.js";
import { supabase } from "../../../lib/supabase";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ChartTitle, Tooltip, Legend);

const { Title, Paragraph } = Typography;
const { Option } = Select;

const ClientDashboard = () => {
  const [clientId, setClientId] = useState(null);
  const [maintenanceStats, setMaintenanceStats] = useState({
    totalRequests: 0,
    pending: 0,
    completed: 0,
    scheduled: 0,
  });
  const [barChartData, setBarChartData] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);
  const [timeFilter, setTimeFilter] = useState("monthly");

  useEffect(() => {
    // Retrieve stored user session
    const storedUser = sessionStorage.getItem("clientDetails");
    //console.log("User", storedUser);
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setClientId(user.id);
      //console.log("User ID", user.id);
    }
  }, []);

  useEffect(() => {
    if (clientId) {
      fetchRequests();
    }
  }, [clientId, timeFilter]);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .eq("user_id", clientId);

    if (error) {
      console.error("Error fetching requests:", error);
      return;
    }

    // Calculate stats
    const totalRequests = data.length;
    const pending = data.filter((req) => req.status === "Pending").length;
    const completed = data.filter((req) => req.status === "completed").length;
    const scheduled = data.filter((req) => req.status === "In Progress").length;

    setMaintenanceStats({ totalRequests, pending, completed, scheduled });

    // Update Bar Chart Data
    const categoryCounts = data.reduce((acc, req) => {
      acc[req.category] = (acc[req.category] || 0) + 1;
      return acc;
    }, {});
    
    // Extract categories dynamically
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
    
    // Update Line Chart Data (Based on timeFilter)
    updateLineChart(data);
  };

  const updateLineChart = (data) => {
    const formatDataByTime = (timeframe) => {
      let labels = [];
      let completedData = [];
      let pendingData = [];

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
          groupedData[key] = { completed: 0, pending: 0 };
        }
        if (req.status === "completed") groupedData[key].completed += 1;
        if (req.status === "Pending") groupedData[key].pending += 1;
      });

      labels = Object.keys(groupedData);
      completedData = labels.map((label) => groupedData[label].completed);
      pendingData = labels.map((label) => groupedData[label].pending);

      return { labels, completedData, pendingData };
    };

    const { labels, completedData, pendingData } = formatDataByTime(timeFilter);

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
      ],
    });
  };

  return (
    <div style={{ padding: "20px", background: "#f5f7fa" }}>
      <Title level={5} style={{ marginBottom: "24px", textAlign: "start", color: "#2c3e50" }}>
        Client/ Dashboard
      </Title>

      <Row gutter={[16, 16]}>
        {[
          { title: "Total Requests", value: maintenanceStats.totalRequests, icon: <FileDoneOutlined style={{ fontSize: "24px" }} />, color: "#1890ff" },
          { title: "Pending Requests", value: maintenanceStats.pending, icon: <HourglassOutlined style={{ fontSize: "24px" }} />, color: "#ff4d4f" },
          { title: "Completed Requests", value: maintenanceStats.completed, icon: <SettingOutlined style={{ fontSize: "24px" }} />, color: "#52c41a" },
          { title: "Requests In Progress", value: maintenanceStats.scheduled, icon: <CalendarOutlined style={{ fontSize: "24px" }} />, color: "#faad14" },
        ].map(({ title, value, icon, color }) => (
          <Col xs={24} sm={12} md={6} key={title}>
            <Card 
              hoverable
              style={{ 
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                border: "none",
                transition: "transform 0.2s",
                padding: "0px", textAlign: "center",
                borderTop: `4px solid ${color}`,
              }}
            >
              
              <div style={{ 
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: `${color}20`, // 20% opacity
                marginBottom: "16px",
                
              }}>
                {React.cloneElement(icon, { style: { ...icon.props.style, color } })}
              </div>
              <Title level={4} style={{ marginBottom: "8px", color: "#7f8c8d" }}>
                {title}
              </Title>
              <Title level={2} style={{ margin: "auto", color: "#2c3e50" }}>
                {value}
              </Title>
              
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
        <Col xs={24} md={12}>
          <Card 
            title="Maintenance Requests by Type" 
            style={{ 
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              border: "none",
            }}
          >
            {barChartData && (
              <Bar
                data={barChartData}
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false, 
                  plugins: { 
                    legend: { display: true, position: "top" }, 
                    tooltip: { enabled: true } 
                  },
                  scales: {
                    x: { grid: { display: false } },
                    y: { grid: { color: "#f0f0f0" } }
                  }
                }}
                style={{ height: "300px" }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title={
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "500", color: "#2c3e50" }}>Maintenance Trends Over Time</span>
                <Select 
                  defaultValue="monthly" 
                  onChange={setTimeFilter} 
                  style={{ width: 200 }}
                  dropdownStyle={{ borderRadius: "8px" }}
                >
                  <Option value="daily">Daily</Option>
                  <Option value="weekly">Weekly</Option>
                  <Option value="monthly">Monthly</Option>
                  <Option value="yearly">Yearly</Option>
                </Select>
              </div>
            }
            style={{ 
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              border: "none",
            }}
          >
            {lineChartData && (
              <Line
                data={lineChartData}
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false, 
                  plugins: { 
                    legend: { display: true, position: "top" }, 
                    tooltip: { enabled: true } 
                  },
                  scales: {
                    x: { grid: { display: false } },
                    y: { grid: { color: "#f0f0f0" } }
                  }
                }}
                style={{ height: "300px" }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ClientDashboard;
