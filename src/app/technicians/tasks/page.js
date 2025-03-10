"use client";

import { useState, useEffect } from "react";
import { Card, Button, Tag, Row, Col, Typography, message, Pagination, Table, Tooltip, Popover, Image } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined, EyeOutlined } from "@ant-design/icons";
import { supabase } from "../../../../lib/supabase";
import ReportModal from "../../components/ReportModal";
import TaskViewModal from "@/app/components/TaskViewModal";

const { Title, Text } = Typography;

const TechnicianTasks = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [technicianId, setTechnicianId] = useState(null);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [TaskViewModalVisible, setTaskViewModalVisible] = useState(false);

  useEffect(() => {
    getTechnicianSession();
  }, []);

  useEffect(() => {
    if (technicianId) {
      fetchTasks();
      fetchAllTasks();
      fetchCompletedTasks();
      autoAssignTechnicians(); 
      subscribeToTaskChanges();
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

  // Fetch newly assigned tasks to the logged-in technician with status pending
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

  // Fetch All tasks in progress for the logged-in technician
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

  // Fetch All completed tasks for the logged-in technician
  const fetchCompletedTasks = async () => {
    try {
      setLoading(true);
      if (!technicianId) return;

      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("assigned_technician_id", technicianId)
        .eq("status", "completed");

      if (error) throw error;

      setCompletedTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error.message);
      message.error("Failed to fetch tasks.");
    } finally {
      setLoading(false);
    }
  };

  const autoAssignTechnicians = async () => {
    try {
      setLoading(true);
  
      // Get unassigned requests
      let { data: requests, error: requestError } = await supabase
        .from("requests")
        .select("*")
        .or("assigned.is.null,assigned.eq.No")
        .is("rejected", null);
  
      if (requestError) throw requestError;
      if (!requests || requests.length === 0) return;
  
      // Get available technicians sorted by workload
      let { data: technicians, error: techError } = await supabase
        .from("technicians")
        .select("*")
        .eq("availability", "Yes")
        .order("workload", { ascending: true });
  
      if (techError) throw techError;
      if (!technicians || technicians.length === 0) return;
  
      // Assign requests to technicians
      for (const request of requests) {
        if (technicians.length === 0) break;
  
        const assignedTechnician = technicians.shift();
  
        // Update the request table
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
  
        // Update technician workload count
        await supabase
          .from("technicians")
          .update({ workload: assignedTechnician.workload + 1 })
          .eq("technician_id", assignedTechnician.technician_id);
  
        // Notify the assigned technician
        await supabase.from("notifications").insert([
          {
            user_id: assignedTechnician.technician_id, 
            message: `You have been assigned a new task from ${request.client}.`, 
            technician: "yes", 
            technician_recipient_id: assignedTechnician.technician_id, 
            date: new Date(), 
            status: "unread",
          },
        ]);
  
        // Notify the admin
        await supabase.from("notifications").insert([
          {
            user_id: assignedTechnician.technician_id, 
            message: `Request by ${request.client} has been assigned to ${assignedTechnician.name}.`,
            admin: "yes",
            date: new Date(),
            status: "unread",
          },
        ]);
      }
  
      message.success("Auto-assignment completed. Notifications sent.");
    } catch (error) {
      console.error("Auto-assignment error:", error.message);
      message.error("Failed to auto-assign tasks.");
    } finally {
      setLoading(false);
    }
  };
  

  // Subscribe to real-time updates from the requests table
  const subscribeToTaskChanges = () => {
    const subscription = supabase
      .channel("tasks-updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "requests" },
        (payload) => {
          console.log("Task updated:", payload);
          fetchTasks(); 
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "requests" },
        (payload) => {
          console.log("New task assigned:", payload);
          fetchTasks(); 
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "requests" },
        (payload) => {
          console.log("Task deleted:", payload);
          fetchTasks(); 
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
  
      // Step 1: Fetch the current task to get the assigned technician ID
      const { data: task, error: taskError } = await supabase
        .from("requests")
        .select("assigned_technician_id, assigned_technician_name, client")
        .eq("id", taskId)
        .single();
  
      if (taskError) throw taskError;
      if (!task) throw new Error("Task not found.");
  
      const assignedTechnicianId = task.assigned_technician_id;
  
      // Step 2: Update the request to mark as rejected and unassign
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
  
      // Step 3: Reduce the technician's workload by 1 (but not below 0)
      // Fetch the current workload
      const { data: technicianData, error: technicianError } = await supabase
        .from("technicians")
        .select("workload")
        .eq("technician_id", assignedTechnicianId)
        .single();

      if (technicianError) throw technicianError;
      if (!technicianData) throw new Error("Technician not found.");

      const currentWorkload = technicianData.workload;
      const newWorkload = Math.max(0, currentWorkload - 1); 

      // Update the technician's workload
      const { error: workloadUpdateError } = await supabase
        .from("technicians")
        .update({
          workload: newWorkload,
        })
        .eq("technician_id", assignedTechnicianId);

      if (workloadUpdateError) throw workloadUpdateError;

      // Notify the assigned technician
      await supabase.from("notifications").insert([
        {
          user_id: assignedTechnicianId, 
          message: `You have successfully opted out of auto-assignment. Our admin is now reviewing your request for a manual assignment. We appreciate your patience.`, 
          technician: "yes", 
          technician_recipient_id: assignedTechnicianId, 
          date: new Date(), 
          status: "unread",
        },
      ]);

      // Notify the admin
      await supabase.from("notifications").insert([
        {
          user_id: assignedTechnicianId, 
          message: `The system's automatic assignment of ${task.client}'s request to ${task.assigned_technician_name} has been rejected. Please review and proceed with a manual assignment.`,
          admin: "yes",
          date: new Date(),
          status: "unread",
        },
      ]);
  
      message.success("Task rejected successfully!");
  
      // Step 4: Refresh the task list
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
       // Step 1: Fetch the current task to get the assigned technician ID
       const { data: task, error: taskError } = await supabase
       .from("requests")
       .select("*")
       .eq("id", taskId)
       .single();
 
     if (taskError) throw taskError;
     if (!task) throw new Error("Task not found.");

      // Update request status in Supabase
      const { error } = await supabase
        .from("requests")
        .update({ status: "In Progress" }) 
        .eq("id", taskId);
  
      if (error) {
        throw error;
      }
  
       // Notify the assigned technician
       await supabase.from("notifications").insert([
        {
          user_id: task.assigned_technician_id, 
          message: `You have started working on ${task.client}'s request. Remember to submit a report once done with the task.`, 
          technician: "yes", 
          technician_recipient_id: task.assigned_technician_id, 
          date: new Date(), 
          status: "unread",
        },
      ]);

      // Notify the client
      await supabase.from("notifications").insert([
        {
          user_id: task.assigned_technician_id, 
          message: `Your request (Request ID: ${task.id}) have been assigned to ${task.assigned_technician_name}.`, 
          client: "yes", 
          client_recipient_id: task.user_id, 
          date: new Date(), 
          status: "unread",
        },
      ]);

      // Notify the admin
      await supabase.from("notifications").insert([
        {
          user_id: task.assigned_technician_id, 
          message: `The request from ${task.client} is currently in progress. The assigned technician on site is **${task.assigned_technician_name} (ID: ${task.assigned_technician_id})**.`,
          admin: "yes",
          date: new Date(),
          status: "unread",
        },
      ]);
  
      message.success("Task has been marked as In Progress!"); 
    } catch (err) {
      console.error("Error updating task status:", err.message);
      message.error("Failed to update task status.");
    }
  };
  
  // Open Modal with Fault Details
  const handleViewTask = (task) => {
    setSelectedTask(task);
    setTaskViewModalVisible(true);
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
          <Button
            type="primary"
            size="small"
            onClick={() => {
              setSelectedTask(record); // Set the correct task
              setModalVisible(true); // Open modal
            }}
          >
            Mark as Complete
          </Button>
        </>
      ),
    },    
  ];

  // Define Table Columns
  const completedColumns = [
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
      render: (status) => (
        <Tag color="green">
          {status.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())}
        </Tag>
      ),
    },
    {
      title: "Deadline",
      dataIndex: "preferred_date",
      key: "preferred_date",
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "action",
    },    
  ];

  return (
    <div style={{ padding: "10px" }}>
      {/* Assigned Tasks Section */}
      <Title level={4}>Newly Assigned Tasks</Title>
      {tasks.length > 0 ? (
        <>
          <Row gutter={[16, 16]} justify="center">
          {(showAllTasks ? tasks : tasks.slice((currentPage - 1) * pageSize, currentPage * pageSize)).map((task) => (
            <Col xs={24} sm={12} md={8} lg={6} xl={6} key={task.id}>
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
                <Row gutter={16} align="middle">
                  <Col span={18} md={18}>
                    <Text><strong>Client:</strong> {task.client}</Text>
                    <br />
                    <Text><strong>Location:</strong> {task.location}</Text>
                    <br />
                    <Text><strong>Deadline:</strong> {task.preferred_date}</Text>
                    <br />
                    <Text><strong>Phone:</strong> {task.phone}</Text>
                    <br />
                    <Text style={{ display: "inline-block", width: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",}}>
                      <strong>Description:</strong> {task.description}
                    </Text>

                  </Col>

                  <Col xs={24} sm={8} md={6} style={{ justifyContent: "center", display: "flex", marginTop: "10px" }}>
                    <Image
                      width="100%"
                      height={100}
                      style={{ objectFit: "cover", borderRadius: "5px", max:"100px" }}
                      src={task.image_url || "https://via.placeholder.com/80"}
                      alt="Fault Image"
                    />
                  </Col>
                </Row>
                <Row justify="space-between" style={{ marginTop: "10px", flexWrap: "wrap" }}>
                  <Col span={24}>
                    <div style={{ marginTop: "10px", justifyContent:"space-between", display:"flex", flexWrap:"wrap"}}>
                      <Button type="primary" size="small" icon={<CheckCircleOutlined />} style={{ marginRight: "10px", marginBottom: "10px" }}
                        onClick={() => handleAccept(task.id)}
                      >
                        Accept
                      </Button>
                      
                      <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewTask(task)} style={{color:"gray"}}>View</Button>
                
                      <Button danger size="small" icon={<CloseCircleOutlined />} onClick={() => handleReject(task.id, technicianId)}>
                        Reject
                      </Button>
                    </div>
                  </Col>
                </Row>
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

      <h3>Tasks In Progress</h3>

        <Table
          columns={columns}
          dataSource={allTasks}
          rowKey="id"
          pagination={{ pageSize }}
        />
      <h3>Tasks Completed</h3>
        <Table
          columns={completedColumns}
          dataSource={completedTasks}
          rowKey="id"
          pagination={{ pageSize }}
        />


      <TaskViewModal
        visible={TaskViewModalVisible}
        onClose={() => setTaskViewModalVisible(false)}
        task={selectedTask}
      />

      <ReportModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        task={selectedTask}
      />
    </div>
  );
};

export default TechnicianTasks;
