"use client";

import { useEffect, useState } from "react";
import { Card, Form, Input, Button, Rate, Col, Row, Typography, List, Avatar, Divider, Spin, message, label } from "antd";
import { supabase } from "../../../../lib/supabase";

const { Title, Text } = Typography;

const FeedbackPage = () => {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch logged-in client from session
  useEffect(() => {
    const storedUser = sessionStorage.getItem("clientDetails");
    if (storedUser) {
      const client = JSON.parse(storedUser);
      setUser(client);
    } else {
      message.error("User not found. Please log in again.");
    }
  }, []);

  // Fetch client's unrated completed requests
  useEffect(() => {
    if (!user) return;

    const fetchRequests = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("user_id", user?.id)
        .eq("status", "completed")
        .is("rating", null);

      if (error) {
        message.error("Error fetching requests.");
        console.error(error);
      } else {
        setRequests(data);
      }
      setLoading(false);
    };

    fetchRequests();
  }, [user]);

  // Fetch existing feedback from other clients
  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("feedback")
        .select("full_name, rating, comment")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
      } else {
        setReviews(data);
      }
    };

    fetchReviews();
  }, []);

  // Submit general feedback
  const handleGeneralFeedback = async (values) => {
    setSubmitting(true);
    const { error } = await supabase.from("feedback").insert([
      {
        user_id: user?.user_metadata?.id,
        full_name: user?.user_metadata?.fullName,
        rating: values.rating,
        comment: values.comment,
      },
    ]);

    if (error) {
      message.error("Error submitting feedback.");
      console.error(error);
    } else {
      message.success("Thank you for your feedback!");
    }
    setSubmitting(false);
  };

  // Submit request-specific feedback
  const handleRequestFeedback = async (requestId, values) => {
    setSubmitting(true);
    const { error } = await supabase
      .from("requests")
      .update({ rating: values.rating, feedback: values.comment })
      .eq("id", requestId);

    if (error) {
      message.error("Error submitting request feedback.");
      console.error(error);
    } else {
      message.success("Feedback submitted successfully!");
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    }
    setSubmitting(false);
  };

  return (
    <Row gutter={[16, 16]} style={{ padding: "20px" }}>
      {/* Left: General Feedback & Reviews */}
      <Col xs={24} md={16}>
        <Title level={3} style={{ color: "#02245B" }}>We Value Your Feedback</Title>
        <Text>
          Your thoughts help us improve our services. Please take a moment to rate us and share your experience.
        </Text>

        <Card title={<Title level={4}>General Feedback</Title>} style={{ margin: "20px 0", paddingRight:"10px", paddingLeft:"10px", paddingBottom:"0px" }}>
          <Form onFinish={handleGeneralFeedback} style={{margin:"auto", marginBottom:0}}>
            <Row gutter={16} align="middle">
                <Col span={8}>
                    <label style={{ marginBottom: "5px" }}>Rate Us</label>
                    <Form.Item name="rating" rules={[{ required: true, message: "Please rate our service!" }]}>
                    <Rate />
                    </Form.Item>
                </Col>

                <Col span={16}>
                    <Row gutter={16}>
                    <Col  span={24}>
                        <label style={{ marginBottom: "5px" }}>What do you love about our services?</label>
                        <Form.Item name="love">
                        <Input.TextArea placeholder="What do you love about us?" />
                        </Form.Item>
                    </Col>
                    <Col  span={24}>
                        <label style={{ marginBottom: "5px" }}>What don't you love about our services?</label>
                        <Form.Item name="dislike">
                        <Input.TextArea placeholder="What don't you love about us?" />
                        </Form.Item>
                    </Col>
                    <Col  span={24}>
                        <label style={{ marginBottom: "5px" }}>What would you love us to change?</label>
                        <Form.Item name="change">
                        <Input.TextArea placeholder="What should we change?" />
                        </Form.Item>
                    </Col>
                    </Row>
                </Col>
            </Row>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting}>Submit Feedback</Button>
            </Form.Item>
          </Form>
        </Card>

        <Divider />

        <Title level={4}>What Our Clients Say</Title>
        {reviews.length === 0 ? (
          <Text>No feedback yet. Be the first to share your thoughts!</Text>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={reviews}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar>{item.full_name?.charAt(0).toUpperCase()}</Avatar>}
                  title={<strong>{item.full_name}</strong>}
                  description={
                    <>
                      <Rate disabled value={item.rating} />
                      <p>{item.comment}</p>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Col>

      {/* Right: Requests Feedback */}
      <Col xs={24} md={8}>
        <Title level={4}>Rate Your Completed Requests</Title>
        {loading ? (
          <Spin />
        ) : requests.length === 0 ? (
          <Text>No pending feedback requests.</Text>
        ) : (
          requests.map((req) => (
            <Card key={req.id} title={req.title} style={{ marginBottom: "15px" }}>
              <p><strong>Category:</strong> {req.category}</p>
              <p><strong>Technician:</strong> {req.assigned_technician_name}</p>

              <Form onFinish={(values) => handleRequestFeedback(req.id, values)}>
                <Form.Item name="rating" rules={[{ required: true, message: "Please rate the service!" }]}>
                  <Rate />
                </Form.Item>
                <Form.Item name="comment">
                  <Input.TextArea placeholder="Write your feedback (optional)" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={submitting}>Submit Feedback</Button>
                </Form.Item>
              </Form>
            </Card>
          ))
        )}
      </Col>
    </Row>
  );
};

export default FeedbackPage;
