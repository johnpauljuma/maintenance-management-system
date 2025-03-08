"use client"

import "@ant-design/v5-patch-for-react-19";
import React from "react";
import { Modal, Button, Tag, Image } from "antd";
import { ExclamationCircleOutlined, EyeOutlined } from "@ant-design/icons";

const FaultDetailsModal = ({ visible, onClose, fault, onAssign }) => {
  if (!fault) return null;

  return (
    <Modal
      title="Fault Details"
      open={visible}
      onCancel={onClose}
      footer={[
        !fault.assigned_technician ? (
          <Button type="primary" key="assign" onClick={() => onAssign(fault.id)}>
            Assign Technician
          </Button>
        ) : (
          <Tag color="green" key="assigned">Assigned</Tag>
        ),
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
      ]}
    >
      {/* Image Section */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <Image
          width={460}
          height={300}
          src={fault.image_url || "https://via.placeholder.com/200"}
          alt="Fault"
          style={{ borderRadius: "7px", width: "100%" }}
          preview={{ 
            scaleStep: 0.1,         // Controls zooming speed
            width: 500,             // Set the preview width
            height: 500             // Set the preview height
          }}
        />
      </div>

      {/* Fault Details */}
      <p><strong>Title:</strong> {fault.title}</p>
      <p><strong>Category:</strong> {fault.category}</p>
      <p><strong>Location:</strong> {fault.location}</p>
      <p><strong>Description:</strong> {fault.description}</p>
      <p><strong>Status:</strong> 
        <Tag color={
          fault.status === "Completed" ? "green" :
          fault.status === "In Progress" ? "orange" :
          fault.status === "Unresolved" ? "red" : "blue"
        }>
          {fault.status}
        </Tag>
      </p>
      <p>
        <strong>Assigned Technician:</strong> 
        {fault.assigned_technician ? (
          <Tag color="blue">{fault.assigned_technician}</Tag>
        ) : (
          <Tag color="red">Unassigned</Tag>
        )}
      </p>
    </Modal>
  );
};

export default FaultDetailsModal;
