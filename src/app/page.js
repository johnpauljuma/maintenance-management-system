"use client";
import '@ant-design/v5-patch-for-react-19';

import { Layout, Button, Row, Col, Typography, Card } from "antd";
import Link from "next/link";
import { DownOutlined, SettingOutlined, BarChartOutlined, ToolOutlined, DatabaseOutlined } from "@ant-design/icons";
import AppFooter from './components/Footer';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

const styles = {
  heroSection: {
    position: "relative",
    width: "100%",
    height: "87vh",
    backgroundImage: "url('/images/image2.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    color: "white",
    textAlign: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  textContainer: {
    position: "relative",
    textAlign: "center",
    zIndex: 2,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: "30px",
    borderRadius: "10px",
    maxWidth: "700px",
  },
  getStartedButton: {
    marginTop: "20px",
    zIndex: 2,
    backgroundColor: "#A61B22",
    borderRadius: "10px",
    fontWeight: "bold",
  },
  scrollDownButton: {
    position: "absolute",
    bottom: "20px",
    right: "20px",
    backgroundColor: "#02245b",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 2,
  },
  cardSection: {
    padding: "50px 20px",
    backgroundColor: "#fff",
    textAlign: "center",
  },
  card: {
    width: "100%",
    textAlign: "center",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  cardIcon: {
    fontSize: "50px",
    color: "#A61B22",
    marginBottom: "15px",
  },
};

const LandingPage = () => {
  return (
    <Layout>
      {/* Navbar */}
      <Header style={{ backgroundColor: "#02245B", padding: "0 50px", marginBottom: "10px", boxShadow: "0 0 5px" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ color: "#fff", margin: 0 }}>AFMMS</Title>
          </Col>
          <Col>
            <Link href="/login" passHref>
              <Button type="primary" style={{ marginRight: "10px", backgroundColor: "#A61b22" }}>Login</Button>
            </Link>
            <Link href="/signup" passHref>
              <Button type="default">Sign Up</Button>
            </Link>
          </Col>
        </Row>
      </Header>

      {/* Hero Section with Static Text */}
      <Content style={styles.heroSection}>
        <div style={styles.overlay}></div>
        <div style={styles.textContainer}>
          <Title level={1} style={{ color: "white" }}>Welcome to AFMMS</Title>
          <Paragraph style={{ color: "white", fontSize: "20px" }}>
            Your all-in-one solution for efficient asset and facility maintenance management.  
            Simplify task assignments, track maintenance requests, and ensure smooth operations.
          </Paragraph>
          <Link href="/login" passHref>
            <Button type="primary" size="large" style={styles.getStartedButton}>Get Started</Button>
          </Link>
        </div>

        {/* Scroll Down Button */}
        <Button
          style={styles.scrollDownButton}
          icon={<DownOutlined />}
          onClick={() => window.scrollBy({ top: 600, behavior: "smooth" })}
        />
      </Content>

      {/* About Section with Cards */}
      <Content style={styles.cardSection}>
        <Title level={2}>Why Choose AFMMS?</Title>
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} sm={12} md={6}>
            <Card style={styles.card}>
              <SettingOutlined style={styles.cardIcon} />
              <Title level={3}>Optimize Maintenance</Title>
              <Paragraph>
                Efficiently assign tasks and reduce downtime with smart scheduling.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={styles.card}>
              <BarChartOutlined style={styles.cardIcon} />
              <Title level={3}>Preventive Maintenance</Title>
              <Paragraph>
                Schedule and track maintenance tasks before issues arise.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={styles.card}>
              <ToolOutlined style={styles.cardIcon} />
              <Title level={3}>Manage Resources</Title>
              <Paragraph>
                Track and manage your facility's assets with real-time updates.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={styles.card}>
              <DatabaseOutlined style={styles.cardIcon} />
              <Title level={3}>Data & Reporting</Title>
              <Paragraph>
                Gain insights and generate reports to optimize operations.
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </Content>

      {/* Footer */}
      <AppFooter />
    </Layout>
  );
};

export default LandingPage;
