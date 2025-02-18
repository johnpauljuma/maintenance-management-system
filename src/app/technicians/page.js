"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Table, Tag } from "antd";
import { Bar, Line } from "react-chartjs-2";
import {
  ToolOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileDoneOutlined,
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

const { Title } = Typography;

const TechnicianDashboard = () => {
  const [taskStats, setTaskStats] = useState({
    totalTasks: 50,
    pending: 10,
    inProgress: 20,
    completed: 20,
  });

  const [assignedTasks, setAssignedTasks] = useState([]);

  useEffect(() => {
    // Simulate fetching data (Replace with actual API call)
    setTimeout(() => {
      setTaskStats({
        totalTasks: 60,
        pending: 12,
        inProgress: 25,
        completed: 23,
      });

      setAssignedTasks([
        {
          key: "1",
          taskID: "TASK001",
          category: "Electrical",
          status: "Pending",
          client: "John Doe",
          dueDate: "2025-02-25",
        },
        {
          key: "2",
          taskID: "TASK002",
          category: "Plumbing",
          status: "In Progress",
          client: "Jane Smith",
          dueDate: "2025-02-22",
        },
        {
          key: "3",
          taskID: "TASK003",
          category: "HVAC",
          status: "Completed",
          client: "Mike Johnson",
          dueDate: "2025-02-20",
        },
        {
          key: "4",
          taskID: "TASK004",
          category: "Cleaning",
          status: "Pending",
          client: "Sarah Lee",
          dueDate: "2025-02-26",
        },
      ]);
    }, 2000);
  }, []);

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
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Tasks Completed",
        data: [5, 10, 15, 20, 25, 30],
        borderColor: "#52c41a",
        backgroundColor: "rgba(82, 196, 26, 0.2)",
        fill: true,
      },
      {
        label: "Tasks Pending",
        data: [10, 8, 7, 6, 5, 4],
        borderColor: "#ff4d4f",
        backgroundColor: "rgba(255, 77, 79, 0.2)",
        fill: true,
      },
    ],
  };

  // 📝 Table Columns
  const columns = [
    {
      title: "Task ID",
      dataIndex: "taskID",
      key: "taskID",
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
        let color = status === "Completed" ? "green" : status === "In Progress" ? "orange" : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
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
          <Card title="Performance Trends" bordered={false}>
            <Line data={lineChartData} />
          </Card>
        </Col>
      </Row>

      {/* Table of Assigned Tasks */}
      <Card title="Assigned Maintenance Tasks" style={{ marginTop: "20px" }} bordered={false}>
        <Table columns={columns} dataSource={assignedTasks} pagination={{ pageSize: 5 }} />
      </Card>
    </div>
  );
};

export default TechnicianDashboard;
