"use client";

import { useState, useEffect } from "react";
import { Layout, Card, List, Tag, Button, Space, Input, Spin, Typography, Modal, Pagination } from "antd";
import { BellOutlined, CheckCircleOutlined, ExclamationCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { supabase } from "../../../../lib/supabase";

const { Content } = Layout;
const { Text } = Typography;

const ClientNotifications = () => {
  const [clientId, setClientId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const storedUser = sessionStorage.getItem("clientDetails");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setClientId(user.id);
    }
  }, []);

  useEffect(() => {
    if (clientId) {
      fetchNotifications();
      const subscription = listenForNotifications();
      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [clientId]);

  const fetchNotifications = async () => {
    if (!clientId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("client_recipient_id", clientId)
      .eq("client", "yes")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
    } else {
      setNotifications(data);
    }

    setLoading(false);
  };

  const listenForNotifications = () => {
    return supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `client_recipient_id=eq.${clientId},client=eq.yes`,
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

  const toggleReadStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "unread" ? "read" : "unread";
    const { error } = await supabase.from("notifications").update({ status: newStatus }).eq("notification_id", id);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.notification_id === id ? { ...n, status: newStatus } : n))
      );
    }
  };

  const showNotification = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);

    if (notification.status === "unread") {
      toggleReadStatus(notification.notification_id, notification.status);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  const truncateMessage = (message, maxLength = 50) => {
    return message.length > maxLength ? message.substring(0, maxLength) + "..." : message;
  };

  const filteredNotifications = notifications.filter(
    (notif) =>
      notif?.status &&
      (filter === "all" || notif.status.toLowerCase() === filter) &&
      notif.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedNotifications = filteredNotifications.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <Layout style={{ padding: "20px", backgroundColor: "#f0f2f5" }}>
      <Content>
        {/* Notifications Overview */}
        <Card title="Notifications Overview" variant="borderless" style={{ marginBottom: 20, borderTop: "4px solid #a61b22" }}>
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
        <Card variant="borderless" style={{ marginBottom: 20 }}>
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

        {/* Notifications List */}
        <Card title="Notifications" variant="borderless" style={{ borderTop: "4px solid #02245b" }}>
          {loading ? (
            <Spin size="large" />
          ) : (
            <>
              <List
                dataSource={paginatedNotifications}
                renderItem={(item) => (
                  <Card
                    style={{
                      marginBottom: "10px",
                      borderLeft: item.status === "unread" ? "5px solid #f5222d" : "none",
                      background: item.status === "unread" ? "#fff2f0" : "#f6ffed",
                      cursor: "pointer",
                    }}
                    onClick={() => showNotification(item)}
                  >
                    <List.Item>
                      <List.Item.Meta
                        title={<Text strong={item.status === "unread"}>{truncateMessage(item.message)}</Text>}
                        description={
                          <Tag
                            color={item.status === "unread" ? "red" : "green"}
                            style={{ cursor: "pointer" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleReadStatus(item.notification_id, item.status);
                            }}
                          >
                            {item.status}
                          </Tag>
                        }
                      />
                      <Space>
                        <span>{new Date(item.date).toLocaleString()}</span>
                      </Space>
                    </List.Item>
                  </Card>
                )}
              />
              {/* Pagination */}
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredNotifications.length}
                onChange={(page) => setCurrentPage(page)}
                style={{ textAlign: "center", marginTop: "20px" }}
              />
            </>
          )}
        </Card>
      </Content>

      {/* Modal for full message */}
      <Modal
        title="Notification"
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
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

export default ClientNotifications;
