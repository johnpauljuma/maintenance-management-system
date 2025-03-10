"use client";

import "@ant-design/v5-patch-for-react-19";
import { useState, useEffect } from "react";
import { Layout, Card, Table, Tag, Button, Space, Input, Spin, Typography, Modal } from "antd";
import { BellOutlined, CheckCircleOutlined, ExclamationCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { supabase } from "../../../../lib/supabase";

const { Content } = Layout;
const { Text } = Typography;

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const subscription = listenForNotifications();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Fetch Notifications for Admin
  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("admin", "yes")
      .order("date", { ascending: false });

    if (error) console.error("Error fetching notifications:", error);
    else setNotifications(data);

    setLoading(false);
  };

  // Listen for Real-Time Notifications
  const listenForNotifications = () => {
    return supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: "admin=eq.yes",
        },
        (payload) => {
          setNotifications((prev) => {
            const exists = prev.some((n) => n.notification_id === payload.new.notification_id);
            return exists ? prev : [payload.new, ...prev];
          });
        }
      )
      .subscribe();
  };

  // Toggle Notification Read/Unread
  const toggleReadStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "unread" ? "read" : "unread";
    const { error } = await supabase
      .from("notifications")
      .update({ status: newStatus })
      .eq("notification_id", id);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === id ? { ...n, status: newStatus } : n
        )
      );
    }
  };

  // Handle Notification Click (Expand)
  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);
    if (notification.status === "unread") {
      toggleReadStatus(notification.notification_id, notification.status);
    }
  };

  // Filter Notifications
  const filteredNotifications = notifications.filter(
    (notif) =>
      (filter === "all" || notif.status === filter) &&
      (notif.message ? notif.message.toLowerCase().includes(searchTerm.toLowerCase()) : false)
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
      render: (message, record) => (
        <Text
          strong={record.status === "unread"} // Bold unread messages
          style={{ cursor: "pointer", color: "#1890ff" }}
          onClick={() => handleNotificationClick(record)}
        >
          {message && message.length > 50 ? `${message.substring(0, 50)}...` : message}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Tag
          color={status === "unread" ? "red" : "green"}
          style={{ cursor: "pointer" }}
          onClick={() => toggleReadStatus(record.notification_id, status)}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <Layout style={{ padding: "20px", backgroundColor: "#f0f2f5" }}>
      <Content>
        {/* Notification Overview */}
        <Card title="Notifications Overview" bordered={false} style={{ marginBottom: 20, borderTop: "4px solid #a61b22" }}>
          <Space size="middle">
            <Button
              icon={<BellOutlined />}
              style={{ backgroundColor: "#a61b22", color: "#fff", border: "none" }}
              onClick={() => setFilter("all")}
            >
              Total: {notifications.length}
            </Button>
            <Button
              icon={<CheckCircleOutlined />}
              style={{ backgroundColor: "#52c41a", color: "#fff", border: "none" }}
              onClick={() => setFilter("read")}
            >
              Read: {notifications.filter((n) => n.status === "read").length}
            </Button>
            <Button
              icon={<ExclamationCircleOutlined />}
              style={{ backgroundColor: "#f5222d", color: "#fff", border: "none" }}
              onClick={() => setFilter("unread")}
            >
              Unread: {notifications.filter((n) => n.status === "unread").length}
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
          {loading ? <Spin size="large" /> : <Table columns={columns} dataSource={filteredNotifications} rowKey="notification_id" pagination={{ pageSize: 5 }} />}
        </Card>
      </Content>

      {/* Notification Details Modal */}
      <Modal
        title="Notification Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        {selectedNotification && (
          <>
            <p>
              <strong>Type:</strong> {selectedNotification.type}
            </p>
            <p>
              <strong>Message:</strong> {selectedNotification.message}
            </p>
            <p>
              <strong>Date:</strong> {new Date(selectedNotification.date).toLocaleString()}
            </p>
          </>
        )}
      </Modal>
    </Layout>
  );
};

export default AdminNotifications;
