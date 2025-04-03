"use client"

import { Layout, Row, Col, Typography, Card, Space } from "antd";
import { MailOutlined, PhoneOutlined, HomeOutlined, DoubleRightOutlined } from "@ant-design/icons";
import Link from "next/link";

const { Footer } = Layout;
const { Text, Title } = Typography;

const AppFooter = () => {
  return (
    <Footer
      style={{
        backgroundColor: "#001529",
        padding: "40px 80px",
        color: "#fff",
        textAlign: "center",
        marginBottom: "50px"
      }}
    >
      <Row justify="space-between" align="top" gutter={[32, 32]}>
        {/* Left Section - Company Info */}
        <Col xs={24} sm={12} md={10} style={{ textAlign: "left", borderRight: "2px solid #ddd", }}>
          <Title level={3} style={{ color: "#fff", marginBottom: "10px" }}>
            AFMMS
          </Title>
          <Text style={{ color: "#ccc", fontSize: "14px" }}>
            Empowering organizations with efficient asset and facility management
          </Text>
          <Card
            style={{
              backgroundColor: "#002140",
              color: "#fff",
              marginTop: "20px",
              padding: "5px",
              borderRadius: "10px",
              border: "none",
              boxShadow: "0 0 5px rgba(0,0,0,0.2)",
              width: "90%",
              fontSize: "20px"
            }}
          >
            <Typography.Paragraph
                style={{
                    color: "#ddd",
                    margin: 0,
                    fontStyle: "italic",
                    fontSize: "18px",
                    fontWeight: "500",
                }}
                >
                <span style={{ color: "#40a9ff", fontSize: "25px", fontWeight: "bold" }}>“</span>
                Streamlining processes, increasing productivity, and ensuring sustainability
                <span style={{ color: "#40a9ff", fontSize: "25px" , fontWeight: "bold" }}>”</span>
            </Typography.Paragraph>

          </Card>
        </Col>

        {/* Center Section - Quick Links */}
        <Col xs={24} sm={12} md={6} style={{ textAlign: "left", paddingLeft: "20px", borderRight: "2px solid #ddd", }}>
          <Title level={4} style={{ color: "#fff", marginBottom: "20px" }}>
            Quick Links
          </Title>
          <Space direction="vertical" size="middle">
            {["Dashboard", "New Request", "My Requests", "Settings", "Help"].map((item, index) => (
                <Link
                key={index}
                href={`/${item.toLowerCase().replace(" ", "-")}`}
                style={{
                    color: "#bbb",
                    fontSize: "14px",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#40a9ff")}
                onMouseLeave={(e) => (e.target.style.color = "#bbb")}
                >
                <DoubleRightOutlined style={{ color: "#40a9ff" }} />
                <Text style={{ color: "inherit" }}>{item}</Text>
                </Link>
            ))}
          </Space>
        </Col>

        {/* Right Section - Get in Touch */}
        <Col xs={24} sm={12} md={6} style={{ textAlign: "left" }}>
          <Title level={4} style={{ color: "#fff", marginBottom: "20px" }}>
            Get in Touch
          </Title>
          <Space direction="vertical" size="middle">
            <Space>
              <HomeOutlined style={{ color: "#A61B22" }} />
              <Text style={{ color: "#ddd" }}>1234 Main St, City, Country</Text>
            </Space>
            <Space>
              <MailOutlined style={{ color: "#A61B22" }} />
              <Text style={{ color: "#ddd" }}>contact@afmms.com</Text>
            </Space>
            <Space>
              <PhoneOutlined style={{ color: "#A61B22" }} />
              <Text style={{ color: "#ddd" }}>+1 (555) 123-4567</Text>
            </Space>
          </Space>
        </Col>
      </Row>

    <hr style={{marginTop: "30px", color: "#A61B22"}}></hr>
      {/* Rights Reserved */}
      <Row justify="center" style={{ marginTop: "10px" }}>
        <Col>
          <Text style={{ color: "#aaa", fontSize: "14px" }}>
            &copy; {new Date().getFullYear()} AFMMS. All Rights Reserved.
          </Text>
          <Text style={{ display: "block", marginTop: "10px", color: "white", fontStyle: "italic", fontWeight: "bold" }}>
            # Developed by:{" "}
            <a href="https://github.com/johnpauljuma" target="_blank" rel="noopener noreferrer">
              John Paul
            </a>
          </Text>
        </Col>
      </Row>
    </Footer>
  );
};

export default AppFooter;
