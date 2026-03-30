"use client";

import React, { useState, useEffect } from "react";
import { Row, Col, Empty, Layout, Typography, Input, Button, Upload, message } from "antd";
import { PictureOutlined, CloseOutlined } from "@ant-design/icons";
import { NoteCard, Note } from "./NoteCard";
import { CreateNote } from "./CreateNote";
import { AIIcon } from "./AIIcon";

const { Content, Header } = Layout;
const { Title } = Typography;

interface NotesListProps {
  notes: Note[];
}

export const NotesList: React.FC<NotesListProps> = ({ notes }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedNotes, setDisplayedNotes] = useState<Note[]>(notes);
  const [isSearching, setIsSearching] = useState(false);
  const [searchImagePreview, setSearchImagePreview] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize(); // Initial check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const clearImageSearch = () => {
    if (searchImagePreview) {
      URL.revokeObjectURL(searchImagePreview);
    }
    setSearchImagePreview(null);
    setSearchQuery("");
    setDisplayedNotes(notes);
  };

  const handleDeleteNote = async (id: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/note?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDisplayedNotes((prev) => prev.filter(note => note.id !== id));
        message.success("Note deleted successfully!");
      } else {
        const errorData = await res.json().catch(() => ({}));
        message.error(`Failed to delete note: ${errorData.message || "Server error"}`);
      }
    } catch (error) {
      console.error("Delete note error:", error);
      message.error("Failed to connect to the server.");
    }
  };

  const handleImageSearch = async (file: File) => {
    setIsSearching(true);
    setSearchImagePreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("image", file);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/note/search`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setDisplayedNotes(data.data || []);
      } else {
        const errorData = await res.json().catch(() => ({}));
        message.error(`Image search failed: ${errorData.message || "Server error"}`);
      }
    } catch (error) {
      console.error("Image search error:", error);
      message.error("Failed to connect to the server.");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    setDisplayedNotes(notes);
  }, [notes]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setDisplayedNotes(notes);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const res = await fetch(`${apiUrl}/note/search?q=${encodeURIComponent(searchQuery)}`);
        
        if (res.ok) {
          const data = await res.json();
          setDisplayedNotes(data.data || []);
        }
      } catch (error) {
        console.error("Failed to search notes", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, notes]);

  const renderSearchBar = () => (
    <Input
      size="large"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search with AI..."
      prefix={
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ marginRight: "8px", display: "flex", alignItems: "center" }} title="Powered by AI">
            <AIIcon size={16} />
          </div>
          {searchImagePreview && (
            <div style={{ position: "relative", marginRight: "6px", display: "flex", alignItems: "center" }}>
              <img 
                src={searchImagePreview} 
                alt="Search query" 
                style={{ height: "24px", width: "24px", borderRadius: "4px", objectFit: "cover" }} 
              />
              <Button
                type="primary"
                danger
                shape="circle"
                size="small"
                icon={<CloseOutlined style={{ fontSize: "8px" }} />}
                style={{ position: "absolute", top: -8, right: -8, width: "16px", height: "16px", minWidth: "16px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  clearImageSearch();
                }}
              />
            </div>
          )}
        </div>
      }
      suffix={
        <span onClick={(e) => e.stopPropagation()}>
          <Upload 
            accept="image/*" 
            showUploadList={false}
            beforeUpload={(file) => {
              handleImageSearch(file as File);
              return false;
            }}
          >
            <Button 
              type="text" 
              icon={<PictureOutlined />} 
              style={{ padding: 0, color: "#1890ff", display: "flex", alignItems: "center" }}
              title="Search by image"
            />
          </Upload>
        </span>
      }
      style={{ maxWidth: "600px", borderRadius: "8px", width: "100%" }}
    />
  );

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <Header
        style={{
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          padding: "0 24px",
          zIndex: 1,
        }}
      >
        <Title level={3} style={{ margin: 0, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "8px" }}>
          <AIIcon />
          AI Notes
        </Title>
        {!isMobile && (
          <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "0 24px" }}>
            {renderSearchBar()}
          </div>
        )}
        {!isMobile && <div style={{ width: "80px" }}></div>}
      </Header>
      <Content style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        {isMobile && (
          <div style={{ marginBottom: "24px", display: "flex", justifyContent: "center" }}>
            {renderSearchBar()}
          </div>
        )}
        <CreateNote />
        {(!displayedNotes || displayedNotes.length === 0) ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
            <Empty description={isSearching ? "Searching..." : "No notes found."} />
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {displayedNotes.map((note) => (
              <Col xs={24} sm={12} md={8} lg={6} key={note.id}>
                <NoteCard note={note} onDelete={handleDeleteNote} />
              </Col>
            ))}
          </Row>
        )}
      </Content>
    </Layout>
  );
};
