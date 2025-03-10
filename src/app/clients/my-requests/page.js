"use client";

import "@ant-design/v5-patch-for-react-19";
import { useEffect, useState } from "react";
import { Table, Tag, Button, message, Card, Input, Select, Row, Col, Image } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { supabase } from "../../../../lib/supabase";

const { Option } = Select;

const MyRequests = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [user, setUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [urgencyFilter, setUrgencyFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    const fetchUserAndRequests = async () => {
      setLoading(true);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error("Error fetching user:", userError?.message);
        setLoading(false);
        return;
      }

      setUser(userData.user);

      const { data: requestsData, error: requestError } = await supabase
        .from("requests")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (requestError) {
        console.error("Error fetching requests:", requestError.message);
      } else {
        setRequests(requestsData);
        setFilteredRequests(requestsData);
      }

      setLoading(false);
    };

    fetchUserAndRequests();
  }, []);

  useEffect(() => {
    let filtered = requests.filter(
      (request) =>
        request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter !== "All") {
      filtered = filtered.filter((req) => req.status.toLowerCase().includes(statusFilter.toLowerCase()));
    }
    if (urgencyFilter !== "All") {
      filtered = filtered.filter((req) => req.urgency.toLowerCase().includes(urgencyFilter.toLowerCase()));
    }
    if (categoryFilter !== "All") {
      filtered = filtered.filter((req) => req.category.toLowerCase().includes(categoryFilter.toLowerCase()));
    }

    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, urgencyFilter, categoryFilter, requests]);

  const handleCancel = async (requestID) => {
    const { error } = await supabase.from("requests").update({ status: "Cancelled" }).eq("id", requestID);
    if (error) {
      message.error("Failed to cancel request.");
    } else {
      message.success("Request cancelled successfully.");
      setRequests((prev) =>
        prev.map((req) => (req.id === requestID ? { ...req, status: "Cancelled" } : req))
      );
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image_url",
      key: "image",
      render: (image_url) =>
        image_url ? <Image width={50} src={image_url} alt="Request" /> : "N/A",
    },
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
        // Convert status to title case
        const titleCaseStatus = status.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
    
        let color = status === "completed" ? "green" : status === "In Progress" ? "orange" : "red";
        return <Tag color={color}>{titleCaseStatus}</Tag>;
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
          <>
            <Button size="small" style={{ marginRight: "5px" }}>Edit</Button>
            <Button danger size="small" onClick={() => handleCancel(record.id)}>Cancel</Button>
          </>
        ) : (
          <Tag color="gray">N/A</Tag>
        ),
    },
  ];

  return (
    <Card title="My Maintenance Requests" bordered={false} style={{ margin: "20px" }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search by Title or Category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={4}>
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: "100%" }}>
            <Option value="All">All Statuses</Option>
            <Option value="Pending">Pending</Option>
            <Option value="In Progress">In Progress</Option>
            <Option value="Completed">Completed</Option>
            <Option value="Cancelled">Cancelled</Option>
          </Select>
        </Col>
        <Col xs={24} sm={4}>
          <Select value={urgencyFilter} onChange={setUrgencyFilter} style={{ width: "100%" }}>
            <Option value="All">All Urgencies</Option>
            <Option value="high">High</Option>
            <Option value="medium">Medium</Option>
            <Option value="low">Low</Option>
          </Select>
        </Col>
        <Col xs={24} sm={4}>
          <Select value={categoryFilter} onChange={setCategoryFilter} style={{ width: "100%" }}>
            <Option value="All">All Categories</Option>
            <Option value="Electrical">Electrical</Option>
            <Option value="Plumbing">Plumbing</Option>
            <Option value="HVAC">HVAC</Option>
          </Select>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={filteredRequests}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize,
          showSizeChanger: true,
          onShowSizeChange: (_, size) => setPageSize(size),
        }}
      />
    </Card>
  );
};

export default MyRequests;
