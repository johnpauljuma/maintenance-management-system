"use client";

import "@ant-design/v5-patch-for-react-19";
import { useState } from "react";
import { Modal, Button, Tag, Image } from "antd";
import AssignTechnicianModal from "./AssignTechnicianModal";

const FaultDetailsModal = ({ visible, onClose, fault }) => {
  if (!fault) return null;

  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // 📌 Open Assign Technician Modal
  const handleOpenAssignModal = (requestId) => {
    setSelectedRequestId(requestId);
    setAssignModalVisible(true);
  };

  // 📌 Close Assign Technician Modal
  const handleCloseAssignModal = () => {
    setAssignModalVisible(false);
    setSelectedRequestId(null);
  };

  return (
    <>
      <Modal
        title="Fault Details"
        open={visible}
        onCancel={onClose}
        footer={[
          !fault.assigned_technician ? (
            <Button type="primary" size="small" onClick={() => handleOpenAssignModal(fault.id)}>
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
              scaleStep: 0.1, 
              width: 500, 
              height: 500 
            }}
          />
        </div>

        {/* Fault Details */}
        <p><strong>Title:</strong> {fault.title}</p>
        <p><strong>Category:</strong> {fault.category}</p>
        <p><strong>Location:</strong> {fault.location}</p>
        <p><strong>Description:</strong> {fault.description}</p>
        <p>
          <strong>Status:</strong> 
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

      {/* ✅ Assign Technician Modal (Now Properly Placed) */}
      <AssignTechnicianModal 
        visible={assignModalVisible} 
        onClose={handleCloseAssignModal} 
        requestId={selectedRequestId} 
      />
    </>
  );
};

export default FaultDetailsModal;
