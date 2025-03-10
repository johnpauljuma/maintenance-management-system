"use client";

import { useState } from "react";
import { Layout, Card, Table, Button, Space, Typography, Row, Col, Tag } from "antd";
import { PlusOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, FileSearchOutlined } from "@ant-design/icons";

const { Content } = Layout;
const { Title, Text } = Typography;

const TechnicianInspections = () => {
  const [inspections, setInspections] = useState([
    {
      id: "INS-101",
      date: "2025-03-01",
      status: "Completed",
      client: "ABC Corp",
      remarks: "All systems functional.",
    },
    {
      id: "INS-102",
      date: "2025-03-05",
      status: "Pending",
      client: "XYZ Ltd",
      remarks: "Scheduled for next week.",
    },
    {
      id: "INS-103",
      date: "2025-02-25",
      status: "Cancelled",
      client: "Global Solutions",
      remarks: "Client rescheduled.",
    },
    {
      id: "INS-104",
      date: "2025-02-28",
      status: "In Progress",
      client: "Tech Innovators",
      remarks: "Technician on site.",
    },
  ]);

  const statusColors = {
    Completed: "green",
    Pending: "blue",
    "In Progress": "orange",
    Cancelled: "red",
  };

  const statusIcons = {
    Completed: <CheckCircleOutlined style={{ color: "green" }} />,
    Pending: <ClockCircleOutlined style={{ color: "blue" }} />,
    "In Progress": <FileSearchOutlined style={{ color: "orange" }} />,
    Cancelled: <CloseCircleOutlined style={{ color: "red" }} />,
  };

  const overviewData = [
    { title: "Total Inspections", value: inspections.length, color: "#1890ff" },
    { title: "Completed Inspections", value: inspections.filter((i) => i.status === "Completed").length, color: "#52c41a" },
    { title: "Pending Inspections", value: inspections.filter((i) => i.status === "Pending").length, color: "#faad14" },
    { title: "Cancelled Inspections", value: inspections.filter((i) => i.status === "Cancelled").length, color: "#f5222d" },
  ];

  const handleMarkAsCompleted = (record) => {
    setInspections((prev) =>
      prev.map((insp) =>
        insp.id === record.id ? { ...insp, status: "Completed", remarks: "Marked as completed." } : insp
      )
    );
  };

  const columns = [
    {
      title: "Inspection ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Space>
          {statusIcons[status]}
          <Text style={{ color: statusColors[status] }}>{status}</Text>
        </Space>
      ),
    },
    {
      title: "Client",
      dataIndex: "client",
      key: "client",
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) =>
        record.status === "In Progress" ? (
          <Button type="primary" onClick={() => handleMarkAsCompleted(record)}>
            Mark as Completed
          </Button>
        ) : (
          <Tag color="default">No Action</Tag>
        ),
    },
  ];

  return (
    <Layout style={{ padding: "20px", backgroundColor: "#f0f2f5" }}>
      <Content>
        {/* Page Header */}
        <Title level={3}>Technician Inspection Overview</Title>

        {/* Responsive Overview Cards */}
        <Row gutter={[16, 16]}>
          {overviewData.map((item, index) => (
            <Col key={index} xs={24} sm={12} md={6}>
              <Card
                style={{
                  borderTop: `4px solid ${item.color}`,
                  textAlign: "center",
                  borderRadius: "8px",
                }}
                bordered={false}
              >
                <Title level={4} style={{ color: item.color, marginBottom: 0 }}>
                  {item.value}
                </Title>
                <Text>{item.title}</Text>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Request New Inspection Button - Aligned Right */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
          <Button type="primary" icon={<PlusOutlined />} size="large">
            Request New Inspection
          </Button>
        </div>

        {/* Inspections Table */}
        <Card
          title="Assigned Inspections"
          bordered={false}
          style={{ marginTop: 20, borderTop: "4px solid #02245b", borderRadius: "8px" }}
        >
          <Table columns={columns} dataSource={inspections} rowKey="id" pagination={{ pageSize: 5 }} />
        </Card>
      </Content>
    </Layout>
  );
};

export default TechnicianInspections;
