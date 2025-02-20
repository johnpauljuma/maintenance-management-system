"use client";

import { useState } from "react";
import { Layout, Card, Table, Tag, Button, Space, Input } from "antd";
import { BellOutlined, CheckCircleOutlined, ExclamationCircleOutlined, SearchOutlined } from "@ant-design/icons";

const { Content } = Layout;

const AdminNotifications = () => {
  const [filter, setFilter] = useState("all"); // Default: Show all notifications
  const [searchTerm, setSearchTerm] = useState("");

  // Dummy Notifications Data
  const notificationsData = [
    { id: 1, type: "System", message: "New user registered", status: "Unread", date: "2024-06-12" },
    { id: 2, type: "Critical", message: "Server downtime detected", status: "Unread", date: "2024-06-11" },
    { id: 3, type: "Alert", message: "New fault reported", status: "Read", date: "2024-06-10" },
    { id: 4, type: "System", message: "Database backup completed", status: "Read", date: "2024-06-09" },
    { id: 5, type: "Critical", message: "Security breach attempt detected", status: "Unread", date: "2024-06-08" },
    { id: 6, type: "Alert", message: "Maintenance scheduled for 2 AM", status: "Read", date: "2024-06-07" },
  ];

  // Handle Filters
  const filteredNotifications = notificationsData.filter(
    (notif) =>
      (filter === "all" || notif.status.toLowerCase() === filter) &&
      notif.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table Columns
  const columns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        let color = type === "Critical" ? "red" : type === "Alert" ? "orange" : "blue";
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Unread" ? "red" : "green"}>{status}</Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
  ];

  return (
    <Layout style={{ padding: "20px", backgroundColor: "#f0f2f5" }}>
      <Content>
        {/* Notification Overview */}
        <Card title="Notifications Overview" bordered={false} style={{ marginBottom: 20, borderTop: "4px solid #a61b22" }}>
          <Space size="middle">
            <Button icon={<BellOutlined />} style={{ backgroundColor: "#a61b22", color: "#fff", border: "none" }}>
              Total: {notificationsData.length}
            </Button>
            <Button icon={<CheckCircleOutlined />} style={{ backgroundColor: "#52c41a", color: "#fff", border: "none" }}>
              Read: {notificationsData.filter((n) => n.status === "Read").length}
            </Button>
            <Button icon={<ExclamationCircleOutlined />} style={{ backgroundColor: "#f5222d", color: "#fff", border: "none" }}>
              Unread: {notificationsData.filter((n) => n.status === "Unread").length}
            </Button>
          </Space>
        </Card>

        {/* Filters & Search */}
        <Card bordered={false} style={{ marginBottom: 20 }}>
          <Space size="middle">
            <Button type={filter === "all" ? "primary" : "default"} onClick={() => setFilter("all")}>
              All
            </Button>
            <Button type={filter === "unread" ? "primary" : "default"} onClick={() => setFilter("unread")}>
              Unread
            </Button>
            <Button type={filter === "read" ? "primary" : "default"} onClick={() => setFilter("read")}>
              Read
            </Button>
            <Input
              placeholder="Search notifications..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 250 }}
            />
          </Space>
        </Card>

        {/* Notification Table */}
        <Card title="Notifications" bordered={false} style={{ borderTop: "4px solid #02245b" }}>
          <Table columns={columns} dataSource={filteredNotifications} rowKey="id" pagination={{ pageSize: 5 }} />
        </Card>
      </Content>
    </Layout>
  );
};

export default AdminNotifications;
