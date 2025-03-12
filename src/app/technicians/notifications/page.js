"use client";

import { useState, useEffect } from "react";
import { Layout, Card, Table, Tag, Button, Space, Input, Spin, message, Modal, Typography } from "antd";
import { BellOutlined, CheckCircleOutlined, ExclamationCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { supabase } from "../../../../lib/supabase";

const { Content } = Layout;
const { Text } = Typography;

const TechnicianNotifications = () => {
  const [technicianId, setTechnicianId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [subscription, setSubscription] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Fetch technician ID from session storage
  useEffect(() => {
    const storedUser = sessionStorage.getItem("technicianId");
    if (storedUser) {
      setTechnicianId(storedUser);
    }
  }, []);

  // Fetch notifications when technicianId is set
  useEffect(() => {
    if (technicianId) {
      fetchNotifications();
      const newSubscription = listenForNotifications();
      setSubscription(newSubscription);
      return () => {
        if (subscription) supabase.removeChannel(subscription);
      };
    }
  }, [technicianId]);

  // Fetch Notifications for Technicians
  const fetchNotifications = async () => {
    if (!technicianId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("technician_recipient_id", technicianId)
      .eq("technician", "yes")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      message.error("Failed to load notifications.");
    } else {
      setNotifications(data || []);
    }

    setLoading(false);
  };

  // Listen for Real-Time Notifications
  const listenForNotifications = () => {
    return supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `technician_recipient_id=eq.${technicianId}` },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
          message.info("New notification received!");
        }
      )
      .subscribe();
  };
  //
  const listenForTechnicianNotifications = (technicianId) => {
    return supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `technician_recipient_id=eq.${technicianId}`,
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
  useEffect(() => {
    if (technicianId) {
      const subscription = listenForTechnicianNotifications(technicianId);
  
      return () => {
        subscription.unsubscribe(); // Cleanup on component unmount
      };
    }
  }, [technicianId]);
//  
  // Mark Notification as Read
  const markAsRead = async (id) => {
    const { error } = await supabase.from("notifications").update({ status: "read" }).eq("notification_id", id);
    if (!error) {
      setNotifications((prev) => prev.map((n) => (n.notification_id === id ? { ...n, status: "read" } : n)));
    } else {
      message.error("Failed to update notification.");
    }
  };

  // Handle message click (open modal and mark as read)
  const handleMessageClick = async (record) => {
    setSelectedNotification(record);
    setModalVisible(true);

    if (record.status === "unread") {
      await markAsRead(record.notification_id);
    }
  };

  // Filter Notifications
  const filteredNotifications = notifications.filter(
    (notif) =>
      (filter === "all" || notif.status?.toLowerCase() === filter) &&
      notif.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table Columns
  const columns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        let color = type === "Critical" ? "red" : type === "Alert" ? "orange" : "blue";
        return <Tag color={color}>{type || "Info"}</Tag>;
      },
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: (message, record) => {
        const truncatedMessage = message.length > 50 ? `${message.substring(0, 50)}...` : message;
        return (
          <Text
            strong={record.status === "unread"}
            style={{ cursor: "pointer" }}
            onClick={() => handleMessageClick(record)}
          >
            {truncatedMessage}
          </Text>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Tag
          color={status === "unread" ? "red" : "green"}
          style={{ cursor: "pointer" }}
          onClick={() => markAsRead(record.notification_id)}
        >
          {status || "unread"}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => (date ? new Date(date).toLocaleString() : "N/A"),
    },
  ];

  return (
    <Layout style={{ padding: "20px", backgroundColor: "#f0f2f5" }}>
      <Content>
        {/* Notification Overview */}
        <Card title="Notifications Overview" bordered={false} style={{ marginBottom: 20, borderTop: "4px solid #a61b22" }}>
          <Space size="middle">
            <Button icon={<BellOutlined />} style={{ backgroundColor: "#a61b22", color: "#fff", border: "none" }}>
              Total: {notifications.length}
            </Button>
            <Button icon={<CheckCircleOutlined />} style={{ backgroundColor: "#52c41a", color: "#fff", border: "none" }}>
              Read: {notifications.filter((n) => n.status === "read").length}
            </Button>
            <Button icon={<ExclamationCircleOutlined />} style={{ backgroundColor: "#f5222d", color: "#fff", border: "none" }}>
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

        {/* Notification Modal */}
        <Modal
          title="Notification Details"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <p><strong>Type:</strong> {selectedNotification?.type}</p>
          <p><strong>Message:</strong> {selectedNotification?.message}</p>
          <p><strong>Date:</strong> {selectedNotification?.date ? new Date(selectedNotification.date).toLocaleString() : "N/A"}</p>
        </Modal>
      </Content>
    </Layout>
  );
};

export default TechnicianNotifications;
