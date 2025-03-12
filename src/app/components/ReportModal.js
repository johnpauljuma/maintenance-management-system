import { useState, useEffect } from "react";
import { Modal, Button, Form, Input, DatePicker, message, Upload, Radio, Row, Col } from "antd";
import { UploadOutlined, InboxOutlined } from "@ant-design/icons";
import { supabase } from "../../../lib/supabase";
import dayjs from "dayjs";

const { TextArea } = Input;

const ReportModal = ({ visible, onClose, task }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [calculatedTime, setCalculatedTime] = useState("");
  const [fileList, setFileList] = useState([]);

   // Handle file upload change
   const handleChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      const reportData = {
        request_id: task.id,
        client_name: task.client,
        client_phone: task.client,
        location: task.location,
        assigned_technician_id: task.assigned_technician_id,
        assigned_technician_name: task.assigned_technician_name,
        service_completed_successful: values.service_completed_successful,
        tools_used: values.tools_used,
        spare_parts_used: values.spare_parts_used,
        challenges_faced: values.challenges_faced,
        recommendations: values.recommendations,
        additional_info: values.additional_info,
        date: values.date ? values.date.format("YYYY-MM-DD") : null,
        time_taken: values.time_taken,
      };

      const { error: reportError } = await supabase.from("reports").insert([reportData]);
      if (reportError) throw reportError;

      await supabase.from("requests").update({ status: "completed" }).eq("id", task.id);
      //await supabase.from("technicians").update({ workload: supabase.raw("workload - 1") }).eq("technician_id", task.assigned_technician_id);
      
      // Step 3: Reduce the technician's workload by 1 (but not below 0)
      // Fetch the current workload
      const { data: technicianData, error: technicianError } = await supabase
        .from("technicians")
        .select("workload")
        .eq("technician_id", task.assigned_technician_id)
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
        .eq("technician_id", task.assigned_technician_id);

      if (workloadUpdateError) throw workloadUpdateError;

      // Notify the assigned technician
      await supabase.from("notifications").insert([
        {
          user_id: task.assigned_technician_id, 
          message: `You have successfully completed ${task.client}'s request and your report have been received.`, 
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
          message: `Your request, (Request ID: ${task.id}), has been completed successfully. The assigned technician on site was **${task.assigned_technician_name} (ID: ${task.assigned_technician_id})**. Please take a few minutes to rate our service.`, 
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
          message: `Request by ${task.client}, (Request ID: ${task.id}) have been completed successfully and report submitted. Assigned technician: ${task.assigned_technician_id} - ${task.assigned_technician_name}.`,
          admin: "yes",
          date: new Date(),
          status: "unread",
        },
      ]);

      message.success("Report submitted successfully!");
      form.resetFields();
      setFileList([]); // Clear uploaded files
      onClose();
    } catch (error) {
      console.error(error);
      message.error("Failed to submit the report.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (task?.created_at) {
      const taskCreationTime = dayjs(task.created_at);
      const now = dayjs();

      if (taskCreationTime.isValid()) {
        const diffInHours = now.diff(taskCreationTime, "hour", true);
        setCalculatedTime(diffInHours.toFixed(2));
        form.setFieldsValue({ time_taken: diffInHours.toFixed(2) });
      }
    }
  }, [task, form]);

  return (
    <Modal title="Submit Repair/Service Report" open={visible} onCancel={onClose}  footer={null} width="90%" style={{ maxWidth: 800 }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ service_completed_successful: "no" }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Request ID">
              <Input value={task ? task.id: ""} disabled />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Request Title">
              <Input value={task ? task.title: ""} disabled />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Request Category">
              <Input value={task ? task.category: ""} disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Client Name">
              <Input value={task ? task.client: ""} disabled />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Client Phone">
              <Input value={task ? task.phone: ""} disabled />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Location">
              <Input value={task ? task.location: ""} disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Technician ID">
              <Input value={`${task ? task.assigned_technician_id: ""}`} disabled />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Technician Name">
              <Input value={`${task ? task.assigned_technician_name: ""}`} disabled />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="date" label="Date" initialValue={dayjs()} rules={[{ required: true }]}>
              <DatePicker style={{ width: "100%" }} disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="service_completed_successful" label="Service Completed Successfully?">
              <Radio.Group>
                <Radio value="yes">Yes</Radio>
                <Radio value="no">No</Radio>
                <Radio value="maybe">Maybe</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="time_taken" label="Time Taken (hours)">
              <Input value={calculatedTime} disabled />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="tools_used" label="Tools Used">
              <TextArea rows={2} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="spare_parts_used" label="Spare Parts Used">
              <TextArea rows={2} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="challenges_faced" label="Challenges Faced">
              <TextArea rows={2} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="recommendations" label="Recommendations">
              <TextArea rows={2} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="additional_info" label="Additional Information">
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item>
          <Button size="large" type="primary" htmlType="submit" loading={loading} block>
            Submit Report
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReportModal;
