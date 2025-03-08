"use client";

import { useState, useEffect } from "react";
import { Card, Button, Tag, Row, Col, Typography, message, Pagination, Table, Tooltip, Popover } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { supabase } from "../../../../lib/supabase";
import ReportModal from "../../components/ReportModal";

const { Title, Text } = Typography;

const TechnicianTasks = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [technicianId, setTechnicianId] = useState(null);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    getTechnicianSession();
  }, []);

  useEffect(() => {
    if (technicianId) {
      fetchTasks();
      fetchAllTasks();
      autoAssignTechnicians(); // Assign immediately on load
      subscribeToTaskChanges(); // 🔥 Listen for real-time updates
    }
  }, [technicianId]);

  // 🔹 Get the logged-in technician's ID from sessionStorage
  const getTechnicianSession = () => {
    try {
      const storedTechnicianId = sessionStorage.getItem("technicianId");

      if (!storedTechnicianId) {
        message.error("Technician ID not found in session.");
        return;
      }

      setTechnicianId(storedTechnicianId);
    } catch (error) {
      console.error("Error retrieving session:", error.message);
      message.error("Failed to retrieve session.");
    }
  };

  // 🔹 Fetch newly assigned tasks to the logged-in technician with status pending
  const fetchTasks = async () => {
    try {
      setLoading(true);
      if (!technicianId) return;

      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("assigned_technician_id", technicianId)
        .eq("status", "Pending");

      if (error) throw error;

      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error.message);
      message.error("Failed to fetch tasks.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch All tasks assigned to the logged-in technician
  const fetchAllTasks = async () => {
    try {
      setLoading(true);
      if (!technicianId) return;

      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("assigned_technician_id", technicianId)
        .eq("status", "In Progress");

      if (error) throw error;

      setAllTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error.message);
      message.error("Failed to fetch tasks.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Auto-assign requests to available technicians
  const autoAssignTechnicians = async () => {
    try {
      setLoading(true);

      // 1️⃣ Get unassigned requests
      let { data: requests, error: requestError } = await supabase
        .from("requests")
        .select("*")
        .or("assigned.is.null,assigned.eq.No")
        .is("rejected", null); // 🔥 Ensure rejected is NULL

      if (requestError) throw requestError;
      if (!requests || requests.length === 0) return;

      // 2️⃣ Get available technicians sorted by workload
      let { data: technicians, error: techError } = await supabase
        .from("technicians")
        .select("*")
        .eq("availability", "Yes")
        .order("workload", { ascending: true });

      if (techError) throw techError;
      if (!technicians || technicians.length === 0) return;

      // 3️⃣ Assign requests to technicians
      for (const request of requests) {
        if (technicians.length === 0) break;

        const assignedTechnician = technicians.shift(); // Pick the first available technician

        // 4️⃣ Update the request table
        const { error: requestUpdateError } = await supabase
          .from("requests")
          .update({
            assigned: "Yes",
            assigned_technician_id: assignedTechnician.technician_id,
            assigned_technician_name: assignedTechnician.name,
            status: "Pending",
          })
          .eq("id", request.id);

        if (requestUpdateError) throw requestUpdateError;

        // 5️⃣ Update technician workload count
        await supabase
          .from("technicians")
          .update({ workload: assignedTechnician.workload + 1 })
          .eq("technician_id", assignedTechnician.technician_id);
      }

      message.success("Auto-assignment completed.");
    } catch (error) {
      console.error("Auto-assignment error:", error.message);
      message.error("Failed to auto-assign tasks.");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Subscribe to real-time updates from the requests table
  const subscribeToTaskChanges = () => {
    const subscription = supabase
      .channel("tasks-updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "requests" },
        (payload) => {
          console.log("Task updated:", payload);
          fetchTasks(); // Refresh tasks when a task is updated
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "requests" },
        (payload) => {
          console.log("New task assigned:", payload);
          fetchTasks(); // Refresh tasks when a new task is added
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "requests" },
        (payload) => {
          console.log("Task deleted:", payload);
          fetchTasks(); // Refresh tasks when a task is deleted
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  //Hndle reject button
  const handleReject = async (taskId, technicianId) => {
    try {
      setLoading(true);
  
      // 🔥 Step 1: Fetch the current task to get the assigned technician ID
      const { data: task, error: taskError } = await supabase
        .from("requests")
        .select("assigned_technician_id")
        .eq("id", taskId)
        .single();
  
      if (taskError) throw taskError;
      if (!task) throw new Error("Task not found.");
  
      const assignedTechnicianId = task.assigned_technician_id;
  
      // 🔥 Step 2: Update the request to mark as rejected and unassign
      const { error: requestUpdateError } = await supabase
        .from("requests")
        .update({
          rejected: "Yes", // Mark as rejected
          assigned: null, // Unassign task
          assigned_technician_id: null, // Remove technician ID
          assigned_technician_name: null, // Remove technician name
        })
        .eq("id", taskId);
  
      if (requestUpdateError) throw requestUpdateError;
  
      // 🔥 Step 3: Reduce the technician's workload by 1 (but not below 0)
      // Fetch the current workload
      const { data: technicianData, error: technicianError } = await supabase
        .from("technicians")
        .select("workload")
        .eq("technician_id", assignedTechnicianId)
        .single();

      if (technicianError) throw technicianError;
      if (!technicianData) throw new Error("Technician not found.");

      const currentWorkload = technicianData.workload;
      const newWorkload = Math.max(0, currentWorkload - 1); // Calculate new workload

      // Update the technician's workload
      const { error: workloadUpdateError } = await supabase
        .from("technicians")
        .update({
          workload: newWorkload,
        })
        .eq("technician_id", assignedTechnicianId);

      if (workloadUpdateError) throw workloadUpdateError;
  
      message.success("Task rejected successfully!");
  
      // 🔄 Step 4: Refresh the task list
      fetchTasks();
    } catch (error) {
      console.error("Error rejecting task:", error.message);
      message.error("Failed to reject the task.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (taskId) => {
    try {
      // ✅ Update request status in Supabase
      const { error } = await supabase
        .from("requests")
        .update({ status: "In Progress" }) // ✅ Change status to "In Progress"
        .eq("id", taskId); // ✅ Update only the clicked task
  
      if (error) {
        throw error;
      }
  
      message.success("Task has been marked as In Progress!"); // ✅ Show success message
    } catch (err) {
      console.error("Error updating task status:", err.message);
      message.error("Failed to update task status."); // ✅ Show error message
    }
  };
  
  
  // Define Table Columns
  const columns = [
    {
      title: "Task ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Task Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Client",
      dataIndex: "client",
      key: "client",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color="blue">{status}</Tag>,
    },
    {
      title: "Deadline",
      dataIndex: "preferred_date",
      key: "preferred_date",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <>
          <Button type="primary" size="small" onClick={() => setModalVisible(true)}>
            Submit Report
          </Button>
    
          <ReportModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            task={record} // ✅ Pass the correct task (record)
          />
        </>
      ),
    },    
    
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>Technician Tasks</Title>

      {/* 📌 Assigned Tasks Section */}
      <Title level={4}>Newly Assigned Tasks</Title>
      {tasks.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
          {(showAllTasks ? tasks : tasks.slice((currentPage - 1) * pageSize, currentPage * pageSize)).map((task) => (
            <Col xs={24} sm={12} md={6} key={task.id}>
              <Card 
                title={
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <span>{task.title}</span>
          
                    {task.manually_assigned === "Yes" ? (
                      <Popover
                        content="This task has been carefully assigned by one of our administrators."
                        title="Admin Assigned"
                        trigger={["hover", "click"]} 
                      >
                        <Text italic type="secondary">
                          Admin assigned <InfoCircleOutlined style={{ fontSize: "10px", color: "gray" }} />
                        </Text>
                      </Popover>
                    ) : (
                      <Popover
                        content="This task was assigned by the system. If there's a mismatch, feel free to reject for careful manual assignment."
                        title="Auto Assigned"
                        trigger={["hover", "click"]}
                      >
                        <Text italic type="secondary">
                          Auto assigned <InfoCircleOutlined style={{ fontSize: "10px", color: "gray" }} />
                        </Text>
                      </Popover>
                    )}
                  </div>
                } bordered={false} style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>

                <Text><strong>Client:</strong> {task.client}</Text>
                <br />
                <Text><strong>Location:</strong> {task.location}</Text>
                <br />
                <Text><strong>Deadline:</strong> {task.preferred_date}</Text>
                <br />
                <Text><strong>Phone:</strong> {task.phone}</Text>
                <br />
                <Text><strong>Description:</strong> {task.description}</Text>
                <br />
                <div style={{ marginTop: "10px", justifyContent:"space-between", display:"flex"}}>
                <Button type="primary" size="small" icon={<CheckCircleOutlined />} style={{ marginRight: "10px", marginBottom: "10px" }}
                  onClick={() => handleAccept(task.id)}
                >
                  Accept
                </Button>
                  <Button danger size="small" icon={<CloseCircleOutlined />} onClick={() => handleReject(task.id, technicianId)}>
                    Reject
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
        <div style={{ marginTop: "10px", marginBottom: "20px", justifyContent: "end",  }}>
          <Button onClick={() => setShowAllTasks(!showAllTasks)} style={{backgroundColor: "#A61b22", color: "#fff"}}>
            {showAllTasks ? "Show Less" : "Show All"}
          </Button>
          {!showAllTasks && (
            <Pagination
              current={currentPage}
              total={tasks.length}
              pageSize={pageSize}
              onChange={(page) => setCurrentPage(page)}
              style={{float: "right"}}
            />
          )}
        </div>
      </>
      ) : (
        <Text type="secondary">No assigned tasks at the moment.</Text>
      )}

        <Table
          columns={columns}
          dataSource={allTasks}
          rowKey="id"
          pagination={{ pageSize }}
        />
    </div>
  );
};

export default TechnicianTasks;
