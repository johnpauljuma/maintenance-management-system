"use client";

import { Modal, Descriptions, Avatar } from "antd";
import { UserOutlined, MailOutlined, EnvironmentOutlined, ToolOutlined, StarOutlined, IdcardOutlined, CalendarOutlined, ProfileOutlined } from "@ant-design/icons";

const ViewTechnicianModal = ({ technician, isOpen, onClose }) => {
  if (!technician) return null;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      title="Technician Details"
      centered
    >
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Avatar size={80} icon={<UserOutlined />} />
        <h2 style={{ marginTop: 10 }}>{technician.name}</h2>
      </div>
      
      <Descriptions bordered column={1}>
        <Descriptions.Item label={<><IdcardOutlined /> Technician ID</>}>
            {technician.technician_id}
        </Descriptions.Item>

        <Descriptions.Item label={<><ProfileOutlined /> Name</>}>
            {technician.name}
        </Descriptions.Item>

        <Descriptions.Item label={<><MailOutlined /> Email</>}>
            {technician.email}
        </Descriptions.Item>

        <Descriptions.Item label={<><ToolOutlined /> Specialization</>}>
            {technician.specialization}
        </Descriptions.Item>

        <Descriptions.Item label={<><EnvironmentOutlined /> Location</>}>
            {technician.location}
        </Descriptions.Item>

        <Descriptions.Item label={<><CalendarOutlined /> Date Joined</>}>
            {technician.date_joined}
        </Descriptions.Item>

        <Descriptions.Item label={<><StarOutlined /> Rating</>}>
            {technician.rating || 0} ⭐
        </Descriptions.Item>

        <Descriptions.Item label="Status">
            <span style={{ color: technician.status === "Available" ? "green" : "red" }}>
            {technician.status}
            </span>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ViewTechnicianModal;
