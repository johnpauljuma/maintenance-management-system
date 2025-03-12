"use client";

import "@ant-design/v5-patch-for-react-19";
import { useEffect, useState } from "react";
import { Card, Row, Col, Table, Tag, Button, message } from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  StopOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { supabase } from "../../../../lib/supabase";
import AddTechnicianModal from "../../components/AddTechnicianModal";
import ViewTechnicianModal from "@/app/components/ViewTechnicianModal";

const ManageTechnicians = () => {
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [technicianStats, setTechnicianStats] = useState({
    available: 0,
    inactive: 0,
    assigned: 0,
  });
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); 

  // Fetch Technicians from Supabase
  useEffect(() => {
    const fetchTechnicians = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("technicians").select("*");

      if (error) {
        console.error("Error fetching technicians:", error.message);
        message.error("Failed to load technicians.");
      } else {
        setTechnicians(data);
      }
      setLoading(false);
    };

    //fetch tecnicians
    const fetchTechnicianStats = async () => {
      const { data, error } = await supabase.from("technicians").select("availability, workload");
    
      if (error) {
        console.error("Error fetching technicians:", error);
        return;
      }
    
      const available = data.filter((tech) => tech.availability === true).length;
      const inactive = data.filter((tech) => tech.availability === false).length;
      const assigned = data.filter((tech) => tech.workload > 0).length;
    
      setTechnicianStats({ available, inactive, assigned });
    };
    fetchTechnicians();
    fetchTechnicianStats()
  }, []);  

  // Handle adding a new technician
  const handleAddTechnician = async (newTechnician) => {
    setLoading(true);

    const { data, error } = await supabase.from("technicians").insert([newTechnician]).select();

    if (error) {
      console.error("Error adding technician:", error.message);
      message.error("Failed to add technician.");
    } else {
      setTechnicians([...technicians, ...data]);
      message.success("Technician added successfully!");
    }

    setLoading(false);
  };

  // Function to open the View modal
  const handleViewTechnician = (technician) => {
    setSelectedTechnician(technician);
    setIsViewModalOpen(true);
  };

  // Function to delete a technician
  const handleDeleteTechnician = async (id) => {
    setLoading(true);

    const { error } = await supabase.from("technicians").delete().eq("id", id);

    if (error) {
      console.error("Error deleting technician:", error.message);
      message.error("Failed to delete technician.");
    } else {
      setTechnicians(technicians.filter((tech) => tech.id !== id));
      message.success("Technician deleted successfully!");
    }

    setLoading(false);
  };

  // Table Columns
  const columns = [
    { title: "Technician ID", dataIndex: "technician_id", key: "technician_id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Specialization", dataIndex: "specialization", key: "specialization" },
    { title: "Location", dataIndex: "location", key: "location" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color =
          status === "Available" ? "green" :
          status === "Assigned" ? "blue" :
          "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    { title: "Rating", dataIndex: "rating", key: "rating", render: (rating) => `${rating || 0} ⭐` },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <>
          <Button size="small" style={{ backgroundColor: "grey", color: "#fff", marginRight: "5px" }} onClick={() => handleViewTechnician(record)}>
            View
          </Button>
          <Button danger size="small" onClick={() => handleDeleteTechnician(record.id)}>
            Delete
          </Button>
        </>   
      ),
    },
  ];

  return (
    <div style={{ padding: "10px" }}>
      {/* 🔹 Page Title & Add Button */}
      <Row justify="space-between" align="middle" style={{ marginBottom: "10px" }}>
        <Col>
          <h4>Admin/ Manage Technicians</h4>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Add New Technician
          </Button>
        </Col>
      </Row>

      {/* 🔹 Overview Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" bordered={false} style={{ textAlign: "center", boxShadow:"0 0 5px", borderTop:"5px #A61b22 solid " }}>
            <UserOutlined style={{ fontSize: "40px", color: "#1890ff" }} />
            <h3>Total Technicians</h3>
            <p>{technicians.length}</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small" bordered={false} style={{ textAlign: "center", boxShadow:"0 0 5px", borderTop:"5px #A61b22 solid " }}>
            <CheckCircleOutlined style={{ fontSize: "40px", color: "#52c41a" }} />
            <h3>Available</h3>
            <p>{technicianStats.available}</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small" bordered={false} style={{ textAlign: "center", boxShadow:"0 0 5px", borderTop:"5px #A61b22 solid " }}>
            <ToolOutlined style={{ fontSize: "40px", color: "#faad14" }} />
            <h3>Assigned</h3>
            <p>{technicianStats.assigned}</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small" bordered={false} style={{ textAlign: "center", boxShadow:"0 0 5px", borderTop:"5px #A61b22 solid " }}>
            <StopOutlined style={{ fontSize: "40px", color: "#ff4d4f" }} />
            <h3>Inactive</h3>
            <p>{technicianStats.inactive}</p>
          </Card>
        </Col>
      </Row>

      {/* 🔹 Technician Table */}
      <h3 style={{ margin: "30px 0 10px" }}>Technician List</h3>
      <Table columns={columns} dataSource={technicians} loading={loading} rowKey="id" pagination={{ pageSize: 5 }} />

      {/* 🔹 Add Technician Modal */}
      <AddTechnicianModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddTechnician={handleAddTechnician} />

      // Include the ViewTechnicianModal in the return statement
      <ViewTechnicianModal technician={selectedTechnician} isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} />
    </div>
  );
};

export default ManageTechnicians;
