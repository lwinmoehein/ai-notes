"use client";

import React, { useState } from "react";
import { Form, Input, Button, Upload, message, Card } from "antd";
import { PictureOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { useRouter } from "next/navigation";

export const CreateNote: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const router = useRouter();

  const onFinish = async (values: { content: string }) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("content", values.content);
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("image", fileList[0].originFileObj as Blob);
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/note`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        message.success("Note created successfully!");
        form.resetFields();
        setFileList([]);
        router.refresh();
      } else {
        const errorData = await res.json().catch(() => ({}));
        message.error(`Failed to create note: ${errorData.message || "Server error"}`);
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      style={{ marginBottom: 24, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "none" }}
      bodyStyle={{ padding: 20 }}
    >
      <Form form={form} onFinish={onFinish} layout="vertical" style={{ margin: 0 }}>
        <Form.Item
          name="content"
          rules={[{ required: true, message: "Please input your note content!" }]}
          style={{ marginBottom: 16 }}
        >
          <Input.TextArea
            placeholder="What's on your mind? Add a text note here..."
            autoSize={{ minRows: 3, maxRows: 6 }}
            style={{ borderRadius: 8, fontSize: "16px", border: "1px solid #e8e8e8", padding: "12px" }}
            bordered={false}
          />
        </Form.Item>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f0f0f0", paddingTop: "12px" }}>
          <Upload
            beforeUpload={() => false} // Prevent automatic upload
            maxCount={1}
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            accept="image/*"
          >
            <Button type="text" icon={<PictureOutlined />} style={{ color: "#1890ff", fontWeight: 500 }}>
              Attach Image
            </Button>
          </Upload>
          <Button type="primary" htmlType="submit" loading={loading} style={{ borderRadius: 20, padding: "0 24px", fontWeight: 600 }}>
            Post Note
          </Button>
        </div>
      </Form>
    </Card>
  );
};
