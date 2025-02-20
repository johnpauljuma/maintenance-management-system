"use client";

import "@ant-design/v5-patch-for-react-19";
import { useEffect, useState } from "react";
import { Table, Tag, Space, Button, message, Card, Input, Select, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { supabase } from "../../../../lib/supabase";

const { Option } = Select;

const MyRequests = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(5); // Default entries per page

  // Dummy Data for Initial Load
  const dummyRequests = [
    { id: 1, title: "Electrical Socket Repair", category: "Electrical", urgency: "high", status: "Pending", assigned_technician: null },
    { id: 2, title: "Leaking Pipe Fix", category: "Plumbing", urgency: "medium", status: "In Progress", assigned_technician: "Technician A" },
    { id: 3, title: "HVAC System Maintenance", category: "HVAC", urgency: "low", status: "Completed", assigned_technician: "Technician B" },
    { id: 4, title: "Office Cleaning", category: "Cleaning", urgency: "medium", status: "Pending", assigned_technician: null },
    { id: 5, title: "Door Lock Repair", category: "General Repairs", urgency: "high", status: "Completed", assigned_technician: "Technician C" },
  ];

  useEffect(() => {
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        //console.error("Error fetching requests:", error.message);
        setRequests(dummyRequests);
      } else {
        setRequests(data.length ? data : dummyRequests);
      }

      setLoading(false);
    };

    fetchRequests();
  }, []);

  // Handle Search Input Change
  useEffect(() => {
    const filtered = requests.filter((request) =>
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRequests(filtered);
  }, [searchTerm, requests]);

  // Handle Request Cancellation
  const handleCancel = async (requestID) => {
    const { error } = await supabase.from("requests").update({ status: "Cancelled" }).eq("id", requestID);

    if (error) {
      //message.error("Failed to cancel request.");
      //console.error("Error cancelling request:", error.message);
    } else {
      message.success("Request cancelled successfully.");
      setRequests((prev) =>
        prev.map((req) => (req.id === requestID ? { ...req, status: "Cancelled" } : req))
      );
    }
  };

  // Define Columns for the Table
  const columns = [
    { title: "Request ID", dataIndex: "id", key: "id" },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Category", dataIndex: "category", key: "category" },
    {
      title: "Urgency",
      dataIndex: "urgency",
      key: "urgency",
      render: (urgency) => {
        const color = urgency === "high" ? "red" : urgency === "medium" ? "orange" : "green";
        return <Tag color={color}>{urgency.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color = status === "Completed" ? "green" : status === "In Progress" ? "orange" : status === "Pending" ? "blue" : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Assigned Technician",
      dataIndex: "assigned_technician",
      key: "assigned_technician",
      render: (tech) => tech || "Not Assigned",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) =>
        record.status === "Pending" ? (
          <Button danger size="small" onClick={() => handleCancel(record.id)}>
            Cancel
          </Button>
        ) : (
          <Tag color="gray">N/A</Tag>
        ),
    },
  ];

  return (
    <Card title="My Maintenance Requests" bordered={false} style={{ margin: "20px" }}>
      {/* Search and Entries Per Page Controls */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={16}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search by Title or Category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={8}>
          <Select
            defaultValue={pageSize}
            style={{ width: "100%" }}
            onChange={(value) => setPageSize(value)}
          >
            <Option value={5}>Show 5 Entries</Option>
            <Option value={10}>Show 10 Entries</Option>
            <Option value={15}>Show 15 Entries</Option>
            <Option value={20}>Show 20 Entries</Option>
          </Select>
        </Col>
      </Row>

      {/* Table Display */}
      <Table
        columns={columns}
        dataSource={filteredRequests.length ? filteredRequests : requests}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize }}
      />
    </Card>
  );
};

export default MyRequests;
