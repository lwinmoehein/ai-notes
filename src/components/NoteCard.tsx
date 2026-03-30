"use client";

import React from "react";
import { Card, Typography, Modal, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const { Paragraph } = Typography;

export interface Note {
  id: number;
  content: string;
  image: string | null;
}

interface NoteCardProps {
  note: Note;
  onDelete?: (id: number) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete }) => {
  const showDeleteConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;
    
    Modal.confirm({
      title: 'Are you sure you want to delete this note?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      centered: true,
      onOk() {
        onDelete(note.id);
      },
    });
  };

  return (
    <Card
      hoverable
      style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}
      cover={
        note.image ? (
          <img
            alt="Note content"
            src={`data:image/png;base64,${note.image}`}
            style={{
              objectFit: "cover",
              maxHeight: "200px",
              width: "100%",
              borderBottom: "1px solid #f0f0f0",
            }}
          />
        ) : null
      }
    >
      {onDelete && (
        <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10 }}>
          <Button
            type="primary"
            danger
            shape="circle"
            icon={<DeleteOutlined />}
            aria-label="Delete note"
            onClick={showDeleteConfirm}
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
          />
        </div>
      )}
      <Paragraph
        ellipsis={{ rows: 4, expandable: true, symbol: "more" }}
        style={{ flexGrow: 1, margin: 0, whiteSpace: "pre-wrap" }}
      >
        {note.content}
      </Paragraph>
    </Card>
  );
};
