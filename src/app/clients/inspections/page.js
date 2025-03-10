"use client";

import { useState } from "react";
import { Layout, Card, Table, Button, Space, Typography, Row, Col } from "antd";
import { PlusOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, FileSearchOutlined } from "@ant-design/icons";

const { Content } = Layout;
const { Title, Text } = Typography;

const ClientInspections = () => {
  const [inspections, setInspections] = useState([
    {
      id: "INS-001",
      date: "2025-03-01",
      status: "Completed",
      technician: "John Doe",
      remarks: "All systems functional.",
    },
    {
      id: "INS-002",
      date: "2025-03-05",
      status: "Pending",
      technician: "Jane Smith",
      remarks: "Scheduled for next week.",
    },
    {
      id: "INS-003",
      date: "2025-02-25",
      status: "Cancelled",
      technician: "Mike Johnson",
      remarks: "Client rescheduled.",
    },
    {
      id: "INS-004",
      date: "2025-02-28",
      status: "In Progress",
      technician: "Sarah Lee",
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
      title: "Technician",
      dataIndex: "technician",
      key: "technician",
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
    },
  ];

  return (
    <Layout style={{ padding: "20px", backgroundColor: "#f0f2f5" }}>
      <Content>
        {/* Page Header */}
        <Title level={3}>Inspection Overview</Title>

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
          title="Inspection History"
          bordered={false}
          style={{ marginTop: 20, borderTop: "4px solid #02245b", borderRadius: "8px" }}
        >
          <Table columns={columns} dataSource={inspections} rowKey="id" pagination={{ pageSize: 5 }} />
        </Card>
      </Content>
    </Layout>
  );
};

export default ClientInspections;
