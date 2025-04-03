"use client";

import { useEffect, useState } from "react";
import React from "react";
import { Row, Col, Card, Typography, Table, Tag, message, Select } from "antd";
import { Bar, Line } from "react-chartjs-2";
import { ToolOutlined, ClockCircleOutlined, CheckCircleOutlined, FileDoneOutlined } from "@ant-design/icons";
import { supabase } from "../../../lib/supabase";
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

const { Title } = Typography;
const { Option } = Select;

const TechnicianDashboard = () => {
  const [technicianId, setTechnicianId] = useState(null);
  const [taskStats, setTaskStats] = useState({ totalTasks: 0, pending: 0, inProgress: 0, completed: 0, });
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [taskTrends, setTaskTrends] = useState([]);
  const [timeFilter, setTimeFilter] = useState("monthly");

  const getTechnicianSession = () => {
    try {
      const storedTechnicianId = sessionStorage.getItem("technicianId");

      if (!storedTechnicianId) {
        message.error("Technician ID not found in session.");
        return null;
      }

      return storedTechnicianId;
    } catch (error) {
      console.error("Error retrieving session:", error.message);
      message.error("Failed to retrieve session.");
      return null;
    }
  };

  useEffect(() => {
    const fetchTechnicianData = async () => {
      // Get technician ID from sessionStorage
      const userId = getTechnicianSession();
      if (!userId) return;

      setTechnicianId(userId);

      // Fetch all tasks assigned to this technician
      const { data: tasks, error } = await supabase
        .from("requests")
        .select("id, category, client, status, preferred_date, created_at")
        .eq("assigned_technician_id", userId);

      if (error) {
        console.error("Error fetching tasks:", error.message);
        return;
      }

      // Count tasks based on status
      const totalTasks = tasks.length;
      const pending = tasks.filter((task) => task.status === "Pending").length;
      const inProgress = tasks.filter((task) => task.status === "In Progress").length;
      const completed = tasks.filter((task) => task.status === "completed").length;

       // Process trends based on selected filter
       setTaskStats({ totalTasks, pending, inProgress, completed });
       setAssignedTasks(tasks);
       setTaskTrends(processTaskTrends(tasks, timeFilter));
     };
 
     fetchTechnicianData();
   }, [technicianId, timeFilter]); 
 
   // Process task completion trends based on selected filter
   const processTaskTrends = (tasks, filter) => {
     const trendData = {};
 
     tasks
       .filter((task) => task.status === "completed")
       .forEach((task) => {
         const date = new Date(task.created_at);
 
         let key;
         if (filter === "daily") {
           key = date.toISOString().split("T")[0];
         } else if (filter === "weekly") {
           const weekStart = new Date(date.setDate(date.getDate() - date.getDay())).toISOString().split("T")[0];
           key = `Week of ${weekStart}`;
         } else if (filter === "monthly") {
           key = date.toLocaleString("default", { month: "short", year: "numeric" });
         } else if (filter === "yearly") {
           key = date.getFullYear();
         }
 
         trendData[key] = (trendData[key] || 0) + 1;
       });
 
     return {
       labels: Object.keys(trendData),
       data: Object.values(trendData),
     };
   };

  // Bar Chart Data (Task Breakdown)
  const barChartData = {
    labels: ["Pending", "In Progress", "Completed"],
    datasets: [
      {
        label: "Number of Tasks",
        data: [taskStats.pending, taskStats.inProgress, taskStats.completed],
        backgroundColor: ["#ff4d4f", "#faad14", "#52c41a"],
      },
    ],
  };

  // Line Chart Data (Performance Trends)
  const lineChartData = {
    labels: taskTrends.labels || [],
    datasets: [
      {
        label: `Tasks Completed (${timeFilter})`,
        data: taskTrends.data || [],
        borderColor: "#52c41a",
        backgroundColor: "rgba(82, 196, 26, 0.2)",
        fill: true,
      },
    ],
  };

  // Table Columns
  const columns = [
    {
      title: "Task ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Client",
      dataIndex: "client",
      key: "client",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        // Convert status to title case
        const titleCaseStatus = status.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
    
        let color = status === "completed" ? "green" : status === "In Progress" ? "orange" : "red";
        return <Tag color={color}>{titleCaseStatus}</Tag>;
      },
    },
    
    {
      title: "Due Date",
      dataIndex: "preferred_date",
      key: "preferred_date",
    },
  ];

  return (
    <div style={{ padding: "10px", background: "#f8f9fa" }}>
      {/* Header */}
      <Title level={5} style={{ 
        textAlign: "start", 
        marginBottom: "10px",
        color: "#2c3e50",
        fontWeight: 600,
        letterSpacing: "0.5px"
      }}>
        Technician/ Dashboard
      </Title>

      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        {[
          { 
            title: "Total Tasks", 
            value: taskStats.totalTasks, 
            icon: <ToolOutlined />, 
            color: "#1890ff",
            bgColor: "#e6f7ff"
          },
          { 
            title: "Pending Tasks", 
            value: taskStats.pending, 
            icon: <ClockCircleOutlined />, 
            color: "#ff4d4f",
            bgColor: "#fff1f0"
          },
          { 
            title: "In Progress", 
            value: taskStats.inProgress, 
            icon: <FileDoneOutlined />, 
            color: "#faad14",
            bgColor: "#fffbe6"
          },
          { 
            title: "Completed Tasks", 
            value: taskStats.completed, 
            icon: <CheckCircleOutlined />, 
            color: "#52c41a",
            bgColor: "#f6ffed"
          }
        ].map((item) => (
          <Col xs={24} sm={12} md={6} key={item.title}>
            <Card 
              hoverable
              style={{ 
                borderRadius: "12px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                border: "none",
                transition: "all 0.3s ease",
              }}
              bodyStyle={{ 
                padding: "20px",
                textAlign: "center",
              }}
            >
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "56px",
                height: "56px",
                borderRadius: "12px",
                backgroundColor: item.bgColor,
                marginBottom: "16px"
              }}>
                {React.cloneElement(item.icon, { 
                  style: { 
                    fontSize: "24px", 
                    color: item.color 
                  } 
                })}
              </div>
              <Title level={4} style={{ 
                marginBottom: "8px", 
                color: "#7f8c8d",
                fontWeight: 500
              }}>
                {item.title}
              </Title>
              <Title level={2} style={{ 
                margin: 0, 
                color: "#2c3e50",
                fontWeight: 600
              }}>
                {item.value}
              </Title>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col xs={24} md={12}>
          <Card 
            title="Task Breakdown"
            style={{ 
              borderRadius: "12px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
              border: "none"
            }}
            headStyle={{ 
              borderBottom: "none",
              padding: "0 20px",
              marginTop: "10px"
            }}
            bodyStyle={{ padding: "20px" }}
          >
            <Bar 
              data={barChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      usePointStyle: true,
                    }
                  }
                },
                scales: {
                  x: {
                    grid: {
                      display: false
                    }
                  },
                  y: {
                    grid: {
                      color: "#f0f0f0"
                    }
                  }
                }
              }}
            />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title={
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                width: "100%",
                padding: "0 4px"
              }}>
                <span style={{ 
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#2c3e50"
                }}>
                  Performance Trends
                </span>
                <Select 
                  defaultValue="monthly" 
                  onChange={setTimeFilter} 
                  style={{ width: 150 }}
                  dropdownStyle={{
                    borderRadius: "8px"
                  }}
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
              boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
              border: "none"
            }}
            headStyle={{ 
              borderBottom: "none",
              padding: "0 20px",
              marginTop: "10px"
            }}
            bodyStyle={{ padding: "20px" }}
          >
            <Line 
              data={lineChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      usePointStyle: true,
                    }
                  }
                },
                scales: {
                  x: {
                    grid: {
                      display: false
                    }
                  },
                  y: {
                    grid: {
                      color: "#f0f0f0"
                    }
                  }
                }
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tasks Table */}
      <Card 
        title="Assigned Maintenance Tasks"
        style={{ 
          marginTop: "24px",
          borderRadius: "12px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
          border: "none"
        }}
        headStyle={{ 
          borderBottom: "none",
          padding: "0 20px",
          marginTop: "10px"
        }}
        bodyStyle={{ padding: "20px" }}
      >
        <Table 
          columns={columns} 
          dataSource={assignedTasks} 
          pagination={{ pageSize: 5 }} 
          rowKey="id"
          style={{
            borderRadius: "8px",
            overflow: "hidden"
          }}
        />
      </Card>
    </div>
  );
};

export default TechnicianDashboard;
