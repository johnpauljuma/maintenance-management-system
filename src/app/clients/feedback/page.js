"use client";

import { useEffect, useState } from "react";
import { Card, Form, Input, Button, Rate, Col, Row, Typography, List, Avatar, Divider, Spin, message, label } from "antd";
import { supabase } from "../../../../lib/supabase";
import {sql} from '@supabase/supabase-js'

const { Title, Text } = Typography;

const FeedbackPage = () => {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState({});
  const [submittingGeneral, setSubmittingGeneral] = useState(false);

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
        .select("*")
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
    if (!user) {
      message.error("User not found. Please log in.");
      return;
    }
  
    setSubmittingGeneral(true);
    
    const { error } = await supabase.from("feedback").insert([
      {
        rating: values.rating,
        positive_comment: values.love,
        negative_comment: values.dislike,
        recommendation: values.change,
      },
    ]);
  
    if (error) {
      message.error("Error submitting feedback.");
      console.error(error);
    } else {
      message.success("Thank you for your feedback!");
    }
    
    setSubmittingGeneral(false);
  };
  

  // Submit request-specific feedback
  const handleRequestFeedback = async (requestId, values, technicianId, technicianName, requestTitle, clientName) => {
    if (!user) {
        message.error("User not found. Please log in.");
        return;
    }

    // Set loading state only for the clicked request
    setSubmitting((prev) => ({ ...prev, [requestId]: true }));

    // Insert into technician_feedback table
    const { error: feedbackError } = await supabase.from("technician_feedback").insert([
        {
            request_id: requestId,
            assigned_technician_id: technicianId,
            request_title: requestTitle,
            client_name: clientName,
            technician_name: technicianName,
            rating: values.rating,
            comment: values.comment,
        },
    ]);

    if (feedbackError) {
        message.error("Error submitting technician feedback.");
        console.error(feedbackError);
        setSubmitting((prev) => ({ ...prev, [requestId]: false })); // Reset only this request's loading state
        return;
    }

    // Update requests table to mark it as rated
    const { error: updateError } = await supabase
        .from("requests")
        .update({ rating: values.rating })
        .eq("id", requestId);

    if (updateError) {
        message.error("Error updating request status.");
        console.error(updateError);
    }

    // Fetch the current ratings
    const { data: technicianData, error: technicianError } = await supabase
    .from("technicians")
    .select("rating, number_of_ratings")
    .eq("technician_id", technicianId)
    .single();

    if (technicianError) throw technicianError;
    if (!technicianData) throw new Error("Technician not found.");

    const currentRating = technicianData.rating;
    const currentNumberOfRatings = technicianData.number_of_ratings;

    const newRating = currentRating + values.rating; 
    const newNumberOfRatings = currentNumberOfRatings + 1; 

    //Update technician ratings
    const { error: updateTechniciansError } = await supabase
    .from("technicians")
    .update({
      rating: newRating, 
      number_of_ratings: newNumberOfRatings 
    })
    .eq("technician_id", technicianId);
  
    if (updateTechniciansError) {
    message.error("Error updating technician rating.");
    console.error(updateTechniciansError);
    }

    else {
        message.success("Feedback submitted successfully!");
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
    }

    // Reset loading state only for this request
    setSubmitting((prev) => ({ ...prev, [requestId]: false }));
};

  

  return (
    <Row gutter={[16, 16]} style={{ padding: "20px" }}>
      {/* Left: General Feedback & Reviews */}
      <Col xs={24} md={16}>
        <Title level={3} style={{ color: "#02245B" }}>We Value Your Feedback</Title>
        <Text style={{fontWeight:"bold"}}>
            Your thoughts help us improve our services. Please take a moment to rate us and share your experience. 
            Your feedback is completely anonymous, so feel free to be honest!
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
              <Button type="primary" htmlType="submit" loading={submittingGeneral}>Submit Feedback</Button>
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
            <Card key={req.id} title={req.title} style={{ marginBottom: "15px", paddingBottom:"0px" }}>
              <Row gutter={16} style={{marginBottom:"5px"}}>
                <Col span={8}><p><strong>Request ID:</strong> </p></Col>
                <Col span={8}><p><strong>Category:</strong> </p></Col>
                <Col span={8}><p><strong>Technician:</strong> </p></Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>{req.id}</Col>
                <Col span={8}>{req.category}</Col>
                <Col span={8}>{req.assigned_technician_name}</Col>
              </Row>
              
              <Divider/>

              <p><strong>Submitted on:</strong> {req.created_at}</p>

              <Divider/>

              <Form onFinish={(values) => handleRequestFeedback(req.id, values, req.assigned_technician_id, req.assigned_technician_name, req.title, req.client)}>
                <Row gutter={[16, 16]}>
                    <Col span={10} flex="auto">
                        <label>Rate our Technician</label>
                        <Form.Item name="rating" rules={[{ required: true, message: "Please rate the service!" }]}>
                        <Rate />
                        </Form.Item>
                    </Col>

                    <Col span={16} flex="auto">
                        <label>Comments (optional)</label>
                        <Form.Item name="comment">
                        <Input.TextArea placeholder="Write your feedback (optional)" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item style={{float:"right"}}>
                  <Button type="primary" htmlType="submit" loading={submitting[req.id] || false}>Submit Feedback</Button>
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
