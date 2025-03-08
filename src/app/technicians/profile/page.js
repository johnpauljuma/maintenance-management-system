"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Row, Col, Tag, Button, Spin, message, Avatar, Rate, Typography, Divider } from "antd";
import { 
  UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, 
  ToolOutlined, HomeOutlined, CheckCircleOutlined, IdcardOutlined, 
  ProfileOutlined, StarOutlined
} from "@ant-design/icons";
import { supabase } from "../../../../lib/supabase";

const { Title, Text } = Typography;

const TechnicianProfile = () => {
  const router = useRouter();
  const [technician, setTechnician] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTechnician = async () => {
      const technicianId = sessionStorage.getItem("technicianId");
      if (!technicianId) {
        message.error("Technician not logged in.");
        router.replace("/technicians");
        return;
      }

      const { data, error } = await supabase
        .from("technicians")
        .select("*")
        .eq("technician_id", technicianId)
        .single();

      if (error || !data) {
        message.error("Technician not found.");
        router.replace("/technicians");
      } else {
        setTechnician(data);
      }
      setLoading(false);
    };

    fetchTechnician();
  }, [router]);

  if (loading) return <Spin size="large" style={{ display: "block", margin: "auto", marginTop: "50px" }} />;
  if (!technician) return null;

  return (
    <div style={{ padding: "20px" }}>
      <h3 style={{margin: "auto", justifyContent: "center", marginBottom: "10px", display: "flex"}}>My Profile</h3>
      <Row gutter={[24, 24]} justify="center">
        {/* Left Column - Profile Summary */}
        <Col xs={24} md={6}>
          <Card
            bordered={false}
            style={{
              textAlign: "center",
              padding: "20px",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
              borderRadius: "10px",
              gap: "20px"
            }}
          >
            <Avatar size={120} icon={<UserOutlined />} style={{ marginBottom: "15px" }} />
            <Title level={3} style={{ marginBottom: "15px" }}>{technician.full_name}</Title>
            <Tag color={technician.status === "Available" ? "green" : "red"} style={{ marginBottom: "15px" }}>{technician.status}</Tag>
            <p style={{ marginBottom: "15px" }}><ToolOutlined /> <Text>{technician.specialization}</Text></p>
            <p style={{ marginBottom: "15px" }}><EnvironmentOutlined /> <Text>{technician.location}</Text></p>
            <Rate disabled defaultValue={technician.rating || 0} />
            <br /><br />
            <Button type="primary" onClick={() => router.push("/technicians/edit-profile")}>
              Edit Profile
            </Button>
          </Card>
        </Col>

        {/* Right Column - Detailed Information */}
        <Col xs={24} md={16}>
          <Card 
            title="Personal Information" 
            bordered={false} 
            style={{
              padding: "20px",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
              borderRadius: "10px",
              marginBottom: "20px"
            }}
          >
            {/* Titles Row */}
            <Row gutter={[24, 16]} style={{ fontWeight: "bold", fontSize: "16px", color: "#555" }}>
              <Col span={4}><IdcardOutlined /> Technician ID</Col>
              <Col span={5}><ProfileOutlined /> Name</Col>
              <Col span={6}><MailOutlined /> Email</Col>
              <Col span={4}><PhoneOutlined /> Phone</Col>
              <Col span={4}><HomeOutlined /> Address</Col> 
            </Row>
            
            <Divider style={{ margin: "10px 0" }} />

            {/* Values Row */}
            <Row gutter={[24, 16]} style={{ fontSize: "15px", color: "#333" }}>
              <Col span={4}>{technician.technician_id}</Col>
              <Col span={5}>{technician.name}</Col>
              <Col span={6}>{technician.email}</Col>
              <Col span={4}>{technician.phone}</Col>
              <Col span={4}>{technician.address}</Col>
            </Row>           
          </Card>

          <Card 
            title="Work Information" 
            bordered={false} 
            style={{
              padding: "20px",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
              borderRadius: "10px",
              marginBottom: "20px"
            }}
          >
            {/* Second Row Titles */}
            <Row gutter={[24, 16]} style={{ fontWeight: "bold", fontSize: "16px", color: "#555" }}>
              <Col span={6}><ToolOutlined /> Specialization</Col>
              <Col span={6}><EnvironmentOutlined /> Work Location</Col>
              <Col span={6}><CheckCircleOutlined /> Status</Col>
              <Col span={6}><CheckCircleOutlined /> Availability</Col>
            </Row>
            
            <Divider style={{ margin: "10px 0" }} />

            {/* Second Row Values */}
            <Row gutter={[24, 16]} style={{ fontSize: "15px", color: "#333" }}>
              <Col span={6}>{technician.specialization}</Col>
              <Col span={6}>{technician.location}</Col>
              <Col span={6}>{technician.status}</Col>
              <Col span={6}>{technician.availability ? "Yes" : "No"}</Col>
            </Row>
          </Card>
          
          <Card 
            title="My Ratings" 
            bordered={false} 
            style={{
              padding: "20px",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
              borderRadius: "10px",
              marginBottom: "20px"
            }}
          >
            <Row gutter={[24, 16]} style={{ fontWeight: "bold", fontSize: "16px", color: "#555" }}>
              <Col span={6}><StarOutlined /> Rating</Col>
            </Row>
            
            <Divider style={{ margin: "10px 0" }} />

            {/* Second Row Values */}
            <Row gutter={[24, 16]} style={{ fontSize: "15px", color: "#333" }}>
            <Rate disabled defaultValue={technician.rating || 0} />
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TechnicianProfile;
