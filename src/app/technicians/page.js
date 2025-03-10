"use client";

import { useEffect, useState } from "react";
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

       // ✅ Process trends based on selected filter
       setTaskStats({ totalTasks, pending, inProgress, completed });
       setAssignedTasks(tasks);
       setTaskTrends(processTaskTrends(tasks, timeFilter));
     };
 
     fetchTechnicianData();
   }, [technicianId, timeFilter]); // Refetch when filter changes
 
   // 📊 Process task completion trends based on selected filter
   const processTaskTrends = (tasks, filter) => {
     const trendData = {};
 
     tasks
       .filter((task) => task.status === "completed")
       .forEach((task) => {
         const date = new Date(task.created_at);
 
         let key;
         if (filter === "daily") {
           key = date.toISOString().split("T")[0]; // YYYY-MM-DD
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

  // 📊 Bar Chart Data (Task Breakdown)
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

  // 📈 Line Chart Data (Performance Trends)
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

  // 📝 Table Columns
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
    <div style={{ padding: "20px" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>
        Technician Dashboard
      </Title>

      <Row gutter={[16, 16]}>
        {/* Summary Cards */}
        <Col xs={24} sm={12} md={6}>
          <Card title="Total Tasks" bordered={false} style={{ textAlign: "center" }}>
            <ToolOutlined style={{ fontSize: "40px", color: "#1890ff" }} />
            <Title level={3}>{taskStats.totalTasks}</Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card title="Pending Tasks" bordered={false} style={{ textAlign: "center" }}>
            <ClockCircleOutlined style={{ fontSize: "40px", color: "#ff4d4f" }} />
            <Title level={3}>{taskStats.pending}</Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card title="In Progress" bordered={false} style={{ textAlign: "center" }}>
            <FileDoneOutlined style={{ fontSize: "40px", color: "#faad14" }} />
            <Title level={3}>{taskStats.inProgress}</Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card title="Completed Tasks" bordered={false} style={{ textAlign: "center" }}>
            <CheckCircleOutlined style={{ fontSize: "40px", color: "#52c41a" }} />
            <Title level={3}>{taskStats.completed}</Title>
          </Card>
        </Col>
      </Row>

      {/* Graphs Section */}
      <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
        <Col xs={24} md={12}>
          <Card title="Task Breakdown" bordered={false}>
            <Bar data={barChartData} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title={
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <h3 style={{ margin: 0 }}>Performance Trends</h3>
                {/* Time Filter Dropdown */}
                <Select defaultValue="monthly" onChange={setTimeFilter} style={{ width: 150 }}>
                  <Option value="daily">Daily</Option>
                  <Option value="weekly">Weekly</Option>
                  <Option value="monthly">Monthly</Option>
                  <Option value="yearly">Yearly</Option>
                </Select>
              </div>
            }
            bordered={false}
          >
            <Line data={lineChartData} />
          </Card>
        </Col>

      </Row>

      {/* Table of Assigned Tasks */}
      <Card title="Assigned Maintenance Tasks" style={{ marginTop: "20px" }} bordered={false}>
        <Table columns={columns} dataSource={assignedTasks} pagination={{ pageSize: 5 }} rowKey="id" />
      </Card>
    </div>
  );
};

export default TechnicianDashboard;
