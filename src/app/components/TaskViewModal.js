"use client";

import "@ant-design/v5-patch-for-react-19";
import { useState } from "react";
import { Modal, Button, Tag, Image, message, Row, Col } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { supabase } from "../../../lib/supabase";

const TaskViewModal = ({ visible, onClose, task, fetchTasks }) => {
  const [loading, setLoading] = useState(false);

  if (!task) return null;

  // Handle Reject Button
  const handleReject = async (taskId, technicianId) => {
    try {
      setLoading(true);

      const { error: requestUpdateError } = await supabase
        .from("requests")
        .update({
          rejected: "Yes",
          assigned: null,
          assigned_technician_id: null,
          assigned_technician_name: null,
        })
        .eq("id", taskId);

      if (requestUpdateError) throw requestUpdateError;

      const { data: technicianData, error: technicianError } = await supabase
        .from("technicians")
        .select("workload")
        .eq("technician_id", technicianId)
        .single();

      if (technicianError) throw technicianError;
      if (!technicianData) throw new Error("Technician not found.");

      const newWorkload = Math.max(0, technicianData.workload - 1);

      const { error: workloadUpdateError } = await supabase
        .from("technicians")
        .update({ workload: newWorkload })
        .eq("technician_id", technicianId);

      if (workloadUpdateError) throw workloadUpdateError;

      message.success("Task rejected successfully!");
      fetchTasks();
    } catch (error) {
      console.error("Error rejecting task:", error.message);
      message.error("Failed to reject the task.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Accept Button
  const handleAccept = async (taskId) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("requests")
        .update({ status: "In Progress" })
        .eq("id", taskId);

      if (error) throw error;

      message.success("Task has been marked as In Progress!");
      fetchTasks();
    } catch (err) {
      console.error("Error updating task status:", err.message);
      message.error("Failed to update task status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", marginTop: "20px" }}>
          <h3 style={{ marginBottom: "5px" }}>Fault Details</h3>
          <h3 style={{ marginBottom: "5px" }}>{task.title}</h3>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginTop: "10px", }}>
          <Button type="primary" size="middle"
            icon={<CheckCircleOutlined />}
            onClick={() => handleAccept(task.id)}
            loading={loading}
          >
            Accept
          </Button>

          <Button danger size="middle"
            icon={<CloseCircleOutlined />}
            onClick={() => handleReject(task.id, task.assigned_technician_id)}
            loading={loading}
          >
            Reject
          </Button>
        </div>
      }
    >
      {/* Image Section */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <Image
          width="100%"
          height="auto"
          style={{ maxWidth: "460px", borderRadius: "7px" }}
          src={task.image_url || "https://via.placeholder.com/200"}
          alt="Fault"
          preview={{ scaleStep: 0.1, width: 500, height: 500 }}
        />
      </div>

      {/* Fault Details */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <p>
            <strong>Title:</strong> {task.title}
          </p>
          <p>
            <strong>Category:</strong> {task.category}
          </p>
        </Col>
        <Col xs={24} sm={12}>
          <p>
            <strong>Location:</strong> {task.location}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <Tag
              color={
                task.status === "Completed"
                  ? "green"
                  : task.status === "In Progress"
                  ? "orange"
                  : task.status === "Unresolved"
                  ? "red"
                  : "blue"
              }
            >
              {task.status}
            </Tag>
          </p>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <p>
            <strong>Description:</strong> {task.description}
          </p>
        </Col>
      </Row>
    </Modal>
  );
};

export default TaskViewModal;
