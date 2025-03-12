"use client";

import { useState, useEffect } from "react";
import { Row, Col, Card, Typography, Select } from "antd";
import { Bar, Line, Doughnut,  } from "react-chartjs-2";
import { SettingOutlined, FileDoneOutlined, HourglassOutlined, CalendarOutlined } from "@ant-design/icons";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title as ChartTitle, Tooltip, Legend, ArcElement } from "chart.js";
import {supabase} from "../../../lib/supabase"; // Adjust path as needed

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ChartTitle, Tooltip, Legend, ArcElement);

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
  const [technicianStats, setTechnicianStats] = useState({
    available: 0,
    inactive: 0,
    assigned: 0,
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

  //fetch tecnicians
  const fetchTechnicianStats = async () => {
    const { data, error } = await supabase.from("technicians").select("availability, workload");
  
    if (error) {
      console.error("Error fetching technicians:", error);
      return;
    }
  
    const available = data.filter((tech) => tech.availability === true).length;
    const inactive = data.filter((tech) => tech.availability === false).length;
    const assigned = data.filter((tech) => tech.workload > 0).length;
  
    setTechnicianStats({ available, inactive, assigned });
  };
  
  useEffect(() => {
    fetchTechnicianStats();
  }, []);

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

  //Calculate percentages
  const totalp = maintenanceStats.total ? Math.round((maintenanceStats.total / maintenanceStats.total) * 100) : 0;
  const pendingp = maintenanceStats.total ? Math.round((maintenanceStats.pending / maintenanceStats.total) * 100) : 0;
  const inProgressp = maintenanceStats.total ? Math.round((maintenanceStats.inProgress / maintenanceStats.total) * 100) : 0;
  const completedp = maintenanceStats.total ? Math.round((maintenanceStats.completed / maintenanceStats.total) * 100) : 0;



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

  // 📊 Status Bar Chart Data
  const statusBarChartData = {
    labels: ["Pending", "In Progress", "Completed"],
    datasets: [
      {
        label: "Number of Tasks",
        data: [maintenanceStats.pending, maintenanceStats.inProgress, maintenanceStats.completed],
        backgroundColor: ["#ff4d4f", "#faad14", "#52c41a"],
      },
    ],
  };

  const doughnutChartData = {
    labels: ["Available", "Inactive", "Assigned"],
    datasets: [
      {
        data: [technicianStats.available, technicianStats.inactive, technicianStats.assigned],
        backgroundColor: ["#52c41a", "#ff4d4f", "#1890ff"],
        hoverOffset: 4,
      },
    ],
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
    <div style={{ padding: "10px", paddingTop:"2px" }}>
      <h4 level={5} style={{ textAlign: "left", marginBottom:"10px" }}>Admin/ Dashboard</h4>

      <Row gutter={[16, 16]}>
        {[
          { title: "Total Requests", value: maintenanceStats.total, percentage: totalp, icon: <FileDoneOutlined style={{ fontSize: "35px", color: "#A61B22",  }} /> },
          { title: "Pending Requests", value: maintenanceStats.pending, percentage: pendingp, icon: <HourglassOutlined style={{ fontSize: "35px", color: "#A61B22" }} /> },
          { title: "Completed Requests", value: maintenanceStats.completed, percentage: completedp, icon: <SettingOutlined style={{ fontSize: "35px", color: "#A61B22" }} /> },
          { title: "Requests In Progress", value: maintenanceStats.inProgress, percentage: inProgressp, icon: <CalendarOutlined style={{ fontSize: "35px", color: "#A61B22" }} /> },
        ].map(({ title, value, icon, percentage }) => (
          <Col xs={24} sm={12} md={6} key={title}>
            <Card
              size="small"
              bordered={false}
              style={{
                padding: "5px",
                boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
                borderBottom: "5px solid #02245b",
                position: "relative",
              }}
            >
              {/* Percentage Display */}
              <div
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "10px",
                  backgroundColor: "#f0f0f0",
                  padding: "3px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: "#02245b",
                }}
              >
                {percentage}%
              </div>

              <Row gutter={[16, 0]} align="middle">
                {/* Icon Column */}
                <Col span={6} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "40px", backgroundColor: "rgba(223, 29, 29, 0.1)", borderRadius: "5px" }}>
                    {icon}
                  </div>
                </Col>

                {/* Text Column */}
                <Col span={18}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Title level={5} style={{ marginBottom: "2px", color: "#333", fontSize: "14px" }}>
                      {title}
                    </Title>
                    <Title level={3} style={{ margin: 0, color: "#1890ff", fontSize: "24px" }}>
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

      <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
        <Col xs={24} md={12}>
          <Card title="Requests by Status" bordered={false}>
            {barChartData && (
              <Bar
              data={statusBarChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "y", // Makes the bar chart horizontal
                plugins: { 
                  legend: { display: true }, 
                  tooltip: { enabled: true } 
                }
              }}
              style={{ height: "300px" }}
            />
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Technician Availability" bordered={false}>
            <Doughnut 
              data={doughnutChartData} 
              options={{ responsive: true, maintainAspectRatio: false }} 
              style={{ height: "300px" }}
            />
          </Card>
        </Col>

      </Row>

    </div>
  );
};

export default AdminDashboard;
