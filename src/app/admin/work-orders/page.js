"use client";

import { useState } from "react";
import { Layout, Card, Table, Button, Input, Tag, Row, Col, Space } from "antd";
import { PlusCircleOutlined, SearchOutlined, FileDoneOutlined } from "@ant-design/icons";

const { Content } = Layout;

// Dummy data for work orders in progress
const workOrdersInProgress = [
  {
    id: "WO-001",
    title: "HVAC System Repair",
    technician: "John Doe",
    expectedCompletion: "2024-03-10",
  },
  {
    id: "WO-002",
    title: "Plumbing Leak Fix",
    technician: "Jane Smith",
    expectedCompletion: "2024-03-12",
  },
  {
    id: "WO-003",
    title: "Electrical Panel Upgrade",
    technician: "Mike Johnson",
    expectedCompletion: "2024-03-15",
  },
  {
    id: "WO-004",
    title: "Office Renovation",
    technician: "Sarah Lee",
    expectedCompletion: "2024-03-18",
  },
];

// Dummy data for the table
const workOrdersTableData = [
  {
    key: "1",
    orderId: "WO-001",
    title: "HVAC System Repair",
    category: "HVAC",
    technician: "John Doe",
    status: "In Progress",
  },
  {
    key: "2",
    orderId: "WO-002",
    title: "Plumbing Leak Fix",
    category: "Plumbing",
    technician: "Jane Smith",
    status: "Pending",
  },
  {
    key: "3",
    orderId: "WO-003",
    title: "Electrical Panel Upgrade",
    category: "Electrical",
    technician: "Mike Johnson",
    status: "Completed",
  },
  {
    key: "4",
    orderId: "WO-004",
    title: "Office Renovation",
    category: "General Repairs",
    technician: "Sarah Lee",
    status: "In Progress",
  },
  {
    key: "5",
    orderId: "WO-005",
    title: "Fire Alarm System Check",
    category: "Safety",
    technician: "David Brown",
    status: "Completed",
  },
  {
    key: "6",
    orderId: "WO-006",
    title: "HVAC Maintenance",
    category: "HVAC",
    technician: "Michael White",
    status: "Pending",
  },
];

const WorkOrders = () => {
  const [filteredData, setFilteredData] = useState(workOrdersTableData);

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    const filtered = workOrdersTableData.filter((order) =>
      order.title.toLowerCase().includes(value) || order.orderId.toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  // Table columns
  const columns = [
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Assigned Technician",
      dataIndex: "technician",
      key: "technician",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = status === "Completed" ? "green" : status === "In Progress" ? "orange" : "blue";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <Layout style={{ padding: "20px" }}>
      <Content>
        {/* Work Orders in Progress Cards */}
        <Row gutter={[16, 16]}>
          {workOrdersInProgress.map((order) => (
            <Col xs={24} sm={12} md={6} key={order.id}>
              <Card
                title={order.title}
                bordered={false}
                extra={<Tag color="orange">In Progress</Tag>}
                style={{
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  borderRadius: "10px",
                  textAlign: "center",
                }}
              >
                <p><strong>Technician:</strong> {order.technician}</p>
                <p><strong>Expected Completion:</strong> {order.expectedCompletion}</p>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Table Controls */}
        <Row justify="space-between" align="middle" style={{ margin: "20px 0" }}>
          <Col xs={24} sm={12} md={6}>
            <Button type="primary" icon={<PlusCircleOutlined />} size="large">
              Add New Work Order
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search Work Orders..."
              prefix={<SearchOutlined />}
              onChange={handleSearch}
              size="large"
            />
          </Col>
        </Row>

        {/* Work Orders Table */}
        <Card title="All Work Orders" bordered={false}>
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={{
              pageSizeOptions: ["5", "10", "15"],
              showSizeChanger: true,
              defaultPageSize: 5,
            }}
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default WorkOrders;
