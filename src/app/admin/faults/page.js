"use client";

import "@ant-design/v5-patch-for-react-19";
import { useEffect, useState, useMemo } from "react";
import { Card, Row, Col, Table, Tag, Button, Select, message, Input, Image, Pagination, } from "antd";
import { ExclamationCircleOutlined, SyncOutlined, CheckCircleOutlined, UserOutlined, SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { supabase } from "../../../../lib/supabase";
import FaultDetailsModal from "@/app/components/FaultDetailsModal";
import AssignTechnicianModal from "@/app/components/AssignTechnicianModal";

const { Option } = Select;

const AdminManageFaults = () => {
  const [loading, setLoading] = useState(false);
  const [faults, setFaults] = useState([]);
  const [allFaults, setAllFaults] = useState([]);
  const [originalFaults, setOriginalFaults] = useState([]);
  const [rejectedFaults, setRejectedFaults] = useState([]);
  const [unassignedFaults, setUnassignedFaults] = useState([]);
  const [availableTechnicians, setAvailableTechnicians] = useState(0);
  const [selectedFault, setSelectedFault] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [technicianFilter, setTechnicianFilter] = useState("All");
  const [showAllUnassigned, setShowAllUnassigned] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [tablePageSize, setTablePageSize] = useState(5);

  useEffect(() => {
    const fetchTechnicianCount = async () => {
      const { count, error } = await supabase
        .from("technicians")
        .select("*", { count: "exact", head: true });
  
      if (error) {
        console.error("Error fetching technician count:", error.message);
      } else {
        setAvailableTechnicians(count);
      }
    };
  
    fetchTechnicianCount();
  }, []);

  useEffect(() => {
    const fetchFaults = async () => {
      setLoading(true);
  
      const { data: faultsData, error } = await supabase
        .from("requests")
        .select("*")
        .eq("rejected", "Yes") // ✅ Only fetch rejected faults
        .eq("status", "Pending") // ✅ Ensure the request is still pending
        .order("created_at", { ascending: false });
  
      if (error) {
        console.error("Error fetching rejected faults:", error.message);
      } else {
        setFaults(faultsData);
        setRejectedFaults(faultsData);
        setUnassignedFaults(faultsData); // ✅ All fetched faults are unassigned
      }
  
      setLoading(false);
    };
  
    fetchFaults();
  }, []);  

  useEffect(() => {
    const fetchAllFaults = async () => {
      setLoading(true);
  
      const { data: allFaults, error } = await supabase
        .from("requests")
        .select("*")
        .order("created_at", { ascending: false });
  
      if (error) {
        console.error("Error fetching all faults:", error.message);
      } else {
        setAllFaults(allFaults); 
        setOriginalFaults(allFaults);
      }
  
      setLoading(false);
    };
  
    fetchAllFaults();
  }, []);
  

  // 📌 Open modal and set requestId
  const handleOpenAssignModal = (requestId) => {
    setSelectedRequestId(requestId);
    setAssignModalVisible(true);
  };

  // 📌 Close modal
  const handleCloseAssignModal = () => {
    setAssignModalVisible(false);
    setSelectedRequestId(null);
  };
  // Open Modal with Fault Details
  const handleViewFault = (fault) => {
    setSelectedFault(fault);
    setModalVisible(true);
  };

  const filteredFaults = useMemo(() => {
    return allFaults.filter((fault) => {
      // Search filter (by title or category)
      if (
        searchTerm &&
        !fault.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !fault.category.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !fault.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !fault.location.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !fault.id.toString().includes(searchTerm) // ✅ Convert id to string
      ) {
        return false;
      }      
  
      // Status filter
      if (statusFilter !== "All" && fault.status !== statusFilter) {
        return false;
      }
  
      // Category filter
      if (categoryFilter !== "All" && fault.category !== categoryFilter) {
        return false;
      }
  
      // Technician filter
      if (technicianFilter === "Unassigned" && fault.assigned_technician_id) {
        return false;
      }
      if (technicianFilter === "Assigned" && !fault.assigned_technician_id) {
        return false;
      }
  
      return true;
    });
  }, [searchTerm, statusFilter, categoryFilter, technicianFilter, allFaults]);
  

  const columns = [
    {
      title: "Image",
      dataIndex: "image_url",
      key: "image",
      render: (image_url) =>
        image_url ? <Image width={50} src={image_url} alt="Fault" /> : "N/A",
    },
    { title: "Fault ID", dataIndex: "id", key: "id" },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Category", dataIndex: "category", key: "category" },
    { title: "Location", dataIndex: "location", key: "location" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === "Completed" ? "green" :
          status === "In Progress" ? "orange" :
          status === "Unresolved" ? "red" :
          "blue";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Assigned Technician",
      dataIndex: "assigned_technician_id",
      key: "assigned_technician",
      render: (id, record) => `${id}: ${record.assigned_technician_name}`
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <>
          {!record.assigned_technician_id ? (
            <Button type="primary" size="small" onClick={() => handleOpenAssignModal(record.id)}>
              Assign
            </Button>
          ) : (
            <Tag color="green">Assigned</Tag>
          )}
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewFault(record)} style={{color:"gray"}}>
            View
          </Button>
        </>
      ),
    },
  ];  
  

  return (
    <div style={{ padding: "10px", paddingTop:"2px" }}>
      <h4 style={{ textAlign: "left", marginBottom: "10px" }}>Admin/ Faults</h4>

      {/* Overview Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" bordered={false} style={{ textAlign: "center", boxShadow:"0 0 5px", borderTop:"5px #A61b22 solid " }}>
            <ExclamationCircleOutlined style={{ fontSize: "35px", color: "#ff4d4f" }} />
            <h3>New Faults</h3>
            <p>{originalFaults.filter((fault) => fault.status === "Pending").length}</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
        <Card size="small" bordered={false} style={{ textAlign: "center", boxShadow:"0 0 5px", borderTop:"5px #A61b22 solid " }}>
            <SyncOutlined style={{ fontSize: "40px", color: "#faad14" }} />
            <h3>In Progress</h3>
            <p>{originalFaults.filter((fault) => fault.status === "In Progress").length}</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
        <Card size="small" bordered={false} style={{ textAlign: "center", boxShadow:"0 0 5px", borderTop:"5px #A61b22 solid " }}>
            <CheckCircleOutlined style={{ fontSize: "40px", color: "#52c41a" }} />
            <h3>Completed</h3>
            <p>{originalFaults.filter((fault) => fault.status === "completed").length}</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
        <Card size="small" bordered={false} style={{ textAlign: "center", boxShadow:"0 0 5px", borderTop:"5px #A61b22 solid " }}>
            <UserOutlined style={{ fontSize: "40px", color: "#1890ff" }} />
            <h3>Available Technicians</h3>
            <p>{availableTechnicians}</p>
          </Card>
        </Col>
      </Row>

      {/* Unassigned Faults */}
      <h3 style={{ margin: "20px 0" }}>Unassigned Faults</h3>
      {unassignedFaults.length === 0 ? (
        <div>
          <p>
            All your faults are assigned!
          </p>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
        {unassignedFaults 
          .slice(showAllUnassigned ? 0 : (currentPage - 1) * pageSize, showAllUnassigned ? unassignedFaults.length : currentPage * pageSize)
          .map((fault) => (
            <Col xs={24} sm={12} md={8} key={fault.id}>
              <Card bordered={false}>
                {/* Card Header */}
                <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "10px", textAlign: "center" }}>
                  {fault.title}
                </div>

                <Row gutter={16}>
                  {/* Details Section */}
                  <Col span={16}>
                    <p><b>Category:</b> {fault.category}</p>
                    <p><b>Location:</b> {fault.location}</p>
                    <p><b>Urgency:</b> <Tag color={fault.urgency === "High" ? "red" : "orange"}>{fault.urgency}</Tag></p>
                    <p style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%"
                    }}>
                      <b>Description:</b> {fault.description}
                    </p>
                  </Col>

                  {/* Image Section */}
                  <Col span={8}>
                    <Image
                      width={100}
                      height={100}
                      style={{ objectFit: "cover", borderRadius: "5px" }}
                      src={fault.image_url || "https://via.placeholder.com/80"}
                      alt="Fault Image"
                    />
                  </Col>
                </Row>

                {/* Buttons */}
                <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
                <div key={fault.id} style={{ marginBottom: "10px" }}>
                  {!fault.assigned_technician ? (
                    <Button type="primary" size="small" onClick={() => handleOpenAssignModal(fault.id)}>
                      Assign
                    </Button>
                  ) : (
                    <Tag color="green">Assigned</Tag>
                  )}
                </div>
                  <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewFault(fault)} style={{color:"gray"}}>View</Button>
                </div>
              </Card>
            </Col>
          ))}
      </Row>
      )}
      


      <div style={{ marginTop: "10px", marginBottom: "20px", justifyContent: "end",  }}>
        <Button onClick={() => setShowAllUnassigned(!showAllUnassigned)} style={{backgroundColor: "#A61b22", color: "#fff"}}>
          {showAllUnassigned ? "Show Less" : "Show All"}
        </Button>
        {!showAllUnassigned && (
          <Pagination
            current={currentPage}
            total={unassignedFaults.length}
            pageSize={pageSize}
            onChange={(page) => setCurrentPage(page)}
            style={{float: "right"}}
          />
        )}
      </div>

      <h3 style={{ margin: "20px 0", marginTop: "10px", }}>Faults</h3>
      {/* Search & Filters */}
      <Row gutter={[16, 16]} style={{ marginBottom: "10px", marginTop: "20px"}}>
        <Col xs={24} sm={12} md={8}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search Faults..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
        </Col>
        <div style={{float:"right", display:"flex", width:"65%", justifyContent:"end"}}>
          <Col xs={24} sm={6} md={5}>
            <Select defaultValue="All" onChange={setStatusFilter} style={{ width: "100%", }}>
              <Option value="All">All Status</Option>
              <Option value="New">Pending</Option>
              <Option value="In Progress">In Progress</Option>
              <Option value="Completed">Completed</Option>
              <Option value="Unresolved">Cancelled</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6} md={5}>
            <Select defaultValue="All" onChange={setTechnicianFilter} style={{ width: "100%",  }}>
              <Option value="All">All Technicians</Option>
              <Option value="Unassigned">Unassigned</Option>
              <Option value="Assigned">Assigned</Option>
            </Select>
          </Col>
        </div>
      </Row>

      <Table 
        columns={columns} dataSource={filteredFaults} loading={loading} rowKey="id" 
        pagination={{
          pageSize: tablePageSize, // Use the state value
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "30", "50", "100"], // Allows users to select different sizes
          onShowSizeChange: (_, size) => setTablePageSize(size), // Updates the page size
          onChange: (page, size) => setTablePageSize(size), // Ensures table updates correctly
        }}
      />

      <FaultDetailsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        fault={selectedFault}
        //onAssign={handleAssign}
      />

      {/* Assign Technician Modal */}
      <AssignTechnicianModal 
        visible={assignModalVisible} 
        onClose={handleCloseAssignModal} 
        requestId={selectedRequestId} 
      />
    </div>
  );
};

export default AdminManageFaults;
