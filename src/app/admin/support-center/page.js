"use client";

import { useEffect, useState } from "react";
import { Layout, Card, Typography, Pagination, Dropdown, Menu, Button, message, Spin } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { supabase } from "../../../../lib/supabase";
import dayjs from "dayjs"; // For date formatting

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const SupportCenter = () => {
  const [loading, setLoading] = useState(true);
  const [supportRequests, setSupportRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // Number of items per page

  useEffect(() => {
    fetchSupportRequests();
  }, []);

  const fetchSupportRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("support_requests").select("*").order("date", { ascending: false });

      if (error) throw error;

      setSupportRequests(data);
    } catch (error) {
      message.error("Failed to load support requests.");
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from("support_requests").delete().eq("support_request_id", id);
      if (error) throw error;

      message.success("Support request deleted.");
      fetchSupportRequests(); // Refresh list after deletion
    } catch (error) {
      message.error("Failed to delete request.");
      console.error(error.message);
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentRequests = supportRequests.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Layout style={{ padding: "20px" }}>
      <Content>
        <Title level={2} style={{ textAlign: "center" }}>
          Support Center
        </Title>
        <Paragraph style={{ textAlign: "center", color: "#555" }}>
          Manage and respond to raised support issues.
        </Paragraph>

        {loading ? (
          <Spin size="large" style={{ display: "block", margin: "40px auto" }} />
        ) : (
          <>
            {currentRequests.length === 0 ? (
              <Paragraph style={{ textAlign: "center", color: "#888" }}>No support requests found.</Paragraph>
            ) : (
              currentRequests.map((request) => (
                <Card
                  key={request.support_request_id}
                  style={{ borderLeft: "5px solid #a61b22", maxWidth:1000, alignSelf:"center", margin:"auto", marginBottom: "10px", }}
                  styles={{ body: { padding: "15px" } }}
                >
                  {/* Contact Info Inline */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Text strong>{request.client_name}</Text>
                    <Text>{request.email}</Text>
                    <Text>{request.phone}</Text>

                    {/* 3 Dots Menu */}
                    <Dropdown
                    menu={{
                        items: [
                        {
                            key: "delete",
                            label: (
                            <Button type="text" danger onClick={() => handleDelete(request.support_request_id)}>
                                Delete
                            </Button>
                            ),
                        },
                        ],
                    }}
                    trigger={["click"]}
                    >
                    <MoreOutlined style={{ fontSize: "18px", cursor: "pointer" }} />
                    </Dropdown>
                  </div>

                  {/* Support Message */}
                  <Paragraph style={{ marginTop: "10px" }}>{request.message}</Paragraph>

                  {/* Date Created (Right Aligned) */}
                  <div style={{ textAlign: "right", color: "#888", fontSize: "12px" }}>
                    <Text>Created on: {dayjs(request.date).format("DD MMM YYYY, hh:mm A")}</Text>
                  </div>
                </Card>
              ))
            )}

            {/* Pagination */}
            {supportRequests.length > pageSize && (
              <Pagination
                current={currentPage}
                total={supportRequests.length}
                pageSize={pageSize}
                onChange={(page) => setCurrentPage(page)}
                style={{ textAlign: "center", marginTop: "20px" }}
              />
            )}
          </>
        )}
      </Content>
    </Layout>
  );
};

export default SupportCenter;
