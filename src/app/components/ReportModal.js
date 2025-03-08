import { useState } from "react"; 
import { Modal, Button, Form, Input, DatePicker, message, Upload, Radio, Row, Col } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { supabase } from "../../../lib/supabase";
 
const { TextArea } = Input;

// ✅ Modal Component for Submitting a Report
const ReportModal = ({ visible, onClose, task }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm(); 

  // ✅ Handle form submission
  const handleSubmit = async (values) => {
    setLoading(true);

    const reportData = {
      request_id: task.id,
      client_name: task.client_name,
      client_phone: task.client_phone,
      location: task.location,
      assigned_technician_id: task.assigned_technician_id,
      assigned_technician_name: task.assigned_technician_name,
      service_completed_successful: values.service_completed_successful, // ✅ Yes, No, Maybe options
      tools_used: values.tools_used,
      spare_parts_used: values.spare_parts_used,
      challenges_faced: values.challenges_faced,
      recommendations: values.recommendations,
      additional_info: values.additional_info,
      date: values.date ? values.date.format("YYYY-MM-DD") : null, //  */✅ Prevent error if no date is selected
      time_taken: values.time_taken,
      images: fileList.images?.fileList || [], // ✅ Store uploaded images
    };

    // ✅ Save report in Supabase
    const { error } = await supabase.from("reports").insert([reportData]);

    if (error) {
      message.error("Failed to submit the report.");
    } else {
      message.success("Report submitted successfully!");
      form.resetFields();
      onClose(); // Close the modal after submission
    }
    setLoading(false);
  };

  return (
    <Modal
      title="Submit Repair/Service Report"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800} // ✅ Larger modal width
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ service_completed_successful: "no" }} // ✅ Default selection
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Client Name">
              <Input value={task.client_name} disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Client Phone">
              <Input value={task.client_phone} disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Location">
              <Input value={task.location} disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Technician">
              <Input value={`${task.assigned_technician_name} (ID: ${task.assigned_technician_id})`} disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="date" label="Date" rules={[{ required: true, message: "Please select a date!" }]}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="service_completed_successful" label="Service Completed?">
              <Radio.Group>
                <Radio value="yes">Yes</Radio>
                <Radio value="no">No</Radio>
                <Radio value="maybe">Maybe</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="time_taken" label="Time Taken (hours)">
              <Input type="number" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="images" label="Upload Images">
              <Upload listType="picture" beforeUpload={() => false} multiple>
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="tools_used" label="Tools Used">
              <TextArea rows={2} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="spare_parts_used" label="Spare Parts Used">
              <TextArea rows={2} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="challenges_faced" label="Challenges Faced">
              <TextArea rows={2} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="recommendations" label="Recommendations">
              <TextArea rows={2} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="additional_info" label="Additional Information">
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Submit Report
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReportModal;
