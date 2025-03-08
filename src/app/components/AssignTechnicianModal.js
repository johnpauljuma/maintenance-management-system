"use client";

import { useState, useEffect } from "react";
import { Modal, Table, Button, Input, Select, Radio, message } from "antd";
import { supabase } from "../../../lib/supabase";

const { Search } = Input;
const { Option } = Select;

const AssignTechnicianModal = ({ visible, onClose, requestId }) => {
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [filteredTechnicians, setFilteredTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [workloadFilter, setWorkloadFilter] = useState(null);

  useEffect(() => {
    if (visible) {
      fetchTechnicians();
    }
  }, [visible]);

  // 🔹 Fetch all technicians
  const fetchTechnicians = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("technicians").select("*");

    if (error) {
      console.error("Error fetching technicians:", error.message);
      message.error("Failed to fetch technicians.");
    } else {
      setTechnicians(data);
      setFilteredTechnicians(data);
    }

    setLoading(false);
  };

  // 🔍 Filter technicians based on search input
  const handleSearch = (value) => {
    setSearchText(value.toLowerCase());
    filterTechnicians(value.toLowerCase(), workloadFilter);
  };

  // 📌 Filter technicians based on workload dropdown
  const handleWorkloadFilter = (value) => {
    setWorkloadFilter(value);
    filterTechnicians(searchText, value);
  };

  // 🔥 Apply filters (search + workload)
  const filterTechnicians = (search, workload) => {
    let filtered = technicians;

    if (search) {
      filtered = filtered.filter(
        (tech) =>
          tech.id.toString().includes(search) ||
          tech.name.toLowerCase().includes(search) ||
          tech.specialization.toLowerCase().includes(search) ||
          tech.location.toLowerCase().includes(search) ||
          tech.workload.toString().includes(search)
      );
    }

    if (workload !== null) {
      filtered = filtered.filter((tech) => tech.workload < workload);
    }

    setFilteredTechnicians(filtered);
  };

  // 🔹 Handle technician selection
  const handleSelectTechnician = (technician) => {
    setSelectedTechnician(technician);
  };

  // 🔥 Assign selected technician to the request
  const handleAssign = async () => {
    if (!selectedTechnician) {
      message.warning("Please select a technician.");
      return;
    }

    try {
      setLoading(true);

      // ✅ Step 1: Update request table
      const { error: requestError } = await supabase
        .from("requests")
        .update({
          assigned: "Yes",
          assigned_technician_id: selectedTechnician.technician_id,
          assigned_technician_name: selectedTechnician.name,
          status: "Pending",
          manually_assigned: "Yes",
          rejected: " "
        })
        .eq("id", requestId);

      if (requestError) throw requestError;

      // ✅ Step 2: Update technician workload
      const { error: workloadError } = await supabase
        .from("technicians")
        .update({ workload: selectedTechnician.workload + 1 })
        .eq("id", selectedTechnician.id);

      if (workloadError) throw workloadError;

      message.success("Technician assigned successfully!");
      onClose(); // Close modal after assignment
    } catch (error) {
      console.error("Error assigning technician:", error.message);
      message.error("Failed to assign technician.");
    } finally {
      setLoading(false);
    }
  };

  // 📌 Table columns
  const columns = [
    {
      title: "ID",
      dataIndex: "technician_id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Specialization",
      dataIndex: "specialization",
      key: "specialization",
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Workload",
      dataIndex: "workload",
      key: "workload",
    },
    {
      title: "Select",
      key: "select",
      render: (_, record) => (
        <Radio
          checked={selectedTechnician?.id === record.id}
          onChange={() => handleSelectTechnician(record)}
        />
      ),
    },
    {
      title: "Assign",
      key: "assign",
      render: (_, record) =>
        selectedTechnician?.id === record.id ? (
          <Button type="primary" onClick={handleAssign} loading={loading}>
            Assign
          </Button>
        ) : null,
    },
  ];

  return (
    <Modal
      title="Assign Technician"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1200}
    >
      {/* 🔍 Search Bar */}
      <Search
        placeholder="Search by ID, Name, Specialization, Location, Workload"
        onSearch={handleSearch}
        enterButton
        style={{ marginBottom: 16, width: "40%", marginRight: 16 }}
      />

      {/* 📌 Workload Filter */}
      <Select
        placeholder="Filter by Workload"
        onChange={handleWorkloadFilter}
        allowClear
        style={{ width: "40%", marginBottom: 16, float: "right" }}
      >
        <Option value={5}>{"<5"}</Option>
        <Option value={10}>{"<10"}</Option>
        <Option value={15}>{"<15"}</Option>
        <Option value={20}>{"<20"}</Option>
      </Select>

      {/* 📋 Technician Table */}
      <Table
        dataSource={filteredTechnicians}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        loading={loading}
      />
    </Modal>
  );
};

export default AssignTechnicianModal;
