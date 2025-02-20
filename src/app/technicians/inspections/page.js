"use client";

import { useState, useEffect } from "react";
import { Card, Button, Table, Tag, Row, Col, Typography, message } from "antd";
import { 
  CheckCircleOutlined, EnvironmentOutlined, CalendarOutlined, FileSearchOutlined 
} from "@ant-design/icons";
import { supabase } from "../../../../lib/supabase";

const { Title, Text } = Typography;

const TechnicianInspections = () => {
  const [loading, setLoading] = useState(true);
  const [inspections, setInspections] = useState([]);
  const [scheduledInspections, setScheduledInspections] = useState([]);

  useEffect(() => {
    // Dummy Data for UI
    const dummyScheduledInspections = [
      { id: "I001", title: "HVAC System Check", location: "Building A - Floor 3", status: "Scheduled" },
      { id: "I002", title: "Fire Safety Inspection", location: "Warehouse 2", status: "Scheduled" },
      { id: "I003", title: "Elevator Maintenance", location: "Tower B - Lobby", status: "Scheduled" },
      { id: "I004", title: "Electrical Wiring Audit", location: "Office Block C", status: "Scheduled" },
    ];

    const dummyAllInspections = [
      { id: "I001", title: "HVAC System Check", location: "Building A - Floor 3", status: "Completed" },
      { id: "I002", title: "Fire Safety Inspection", location: "Warehouse 2", status: "Completed" },
      { id: "I003", title: "Elevator Maintenance", location: "Tower B - Lobby", status: "Pending" },
      { id: "I004", title: "Electrical Wiring Audit", location: "Office Block C", status: "Scheduled" },
      { id: "I005", title: "Water Leak Check", location: "Parking Basement", status: "Scheduled" },
      { id: "I006", title: "Security Camera Inspection", location: "Control Room", status: "Completed" },
    ];

    setScheduledInspections(dummyScheduledInspections);
    setInspections(dummyAllInspections);
    setLoading(false);
  }, []);

  // Mark an Inspection as Done
  const markAsDone = (inspectionID) => {
    message.success(`Inspection ${inspectionID} marked as Completed.`);
    setScheduledInspections((prev) => prev.filter((insp) => insp.id !== inspectionID));
    setInspections((prev) =>
      prev.map((insp) => (insp.id === inspectionID ? { ...insp, status: "Completed" } : insp))
    );
  };

  // Define Table Columns
  const columns = [
    { title: "Inspection ID", dataIndex: "id", key: "id" },
    { title: "Title", dataIndex: "title", key: "title" },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      render: (location) => (
        <>
          <EnvironmentOutlined style={{ color: "#1890ff" }} /> {location}
        </>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = status === "Completed" ? "green" : status === "Pending" ? "orange" : "blue";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>Technician Inspections</Title>

      {/* 📌 Scheduled Inspections (Cards) */}
      <Title level={3} style={{ textAlign: "left", marginBottom: "20px" }}>Scheduled Inspections</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
        {scheduledInspections.map((inspection) => (
          <Col xs={24} sm={12} md={6} key={inspection.id}>
            <Card
              title={inspection.title}
              bordered={false}
              style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)", textAlign: "center" }}
            >
              <Text>
                <EnvironmentOutlined style={{ color: "#1890ff" }} /> {inspection.location}
              </Text>
              <br />
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                style={{ marginTop: "10px" }}
                onClick={() => markAsDone(inspection.id)}
              >
                Mark as Done
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 📌 All Inspections Table */}
      <Card bordered={false} style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
        <Table
          columns={columns}
          dataSource={inspections}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default TechnicianInspections;
