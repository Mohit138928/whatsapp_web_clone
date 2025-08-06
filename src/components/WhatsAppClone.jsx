"use client";

import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import apiClient from "@/lib/api";

export default function WhatsAppClone() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    );
    setSocket(socketInstance);

    // Listen for real-time message updates
    socketInstance.on("newMessage", (messageData) => {
      setChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat.wa_id === messageData.wa_id) {
            return {
              ...chat,
              messages: [...chat.messages, messageData],
            };
          }
          return chat;
        });
      });
    });

    socketInstance.on("messageStatusUpdate", (updateData) => {
      setChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat.wa_id === updateData.wa_id) {
            return {
              ...chat,
              messages: chat.messages.map((msg) => {
                if (
                  msg.id === updateData.id ||
                  msg.meta_msg_id === updateData.meta_msg_id
                ) {
                  return { ...msg, status: updateData.status };
                }
                return msg;
              }),
            };
          }
          return chat;
        });
      });
    });

    // Load initial chats
    loadChats();

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const loadChats = async () => {
    try {
      const chatsData = await apiClient.fetchChats();
      setChats(chatsData);
    } catch (error) {
      console.error("Failed to load chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSelect = (chat) => {
    setActiveChat(chat);
  };

  const handleSendMessage = async (messageData) => {
    try {
      // Optimistically add message to UI
      setChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat.wa_id === messageData.wa_id) {
            return {
              ...chat,
              messages: [...chat.messages, messageData],
            };
          }
          return chat;
        });
      });

      // Update active chat if it's the same chat
      if (activeChat && activeChat.wa_id === messageData.wa_id) {
        setActiveChat((prev) => ({
          ...prev,
          messages: [...prev.messages, messageData],
        }));
      }

      // Send to backend
      await apiClient.sendMessage(messageData);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove optimistic message on error
      setChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat.wa_id === messageData.wa_id) {
            return {
              ...chat,
              messages: chat.messages.filter((msg) => msg !== messageData),
            };
          }
          return chat;
        });
      });
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading WhatsApp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-full md:w-96 border-r border-gray-200 dark:border-gray-700">
        <ChatList
          chats={chats}
          activeChat={activeChat}
          onChatSelect={handleChatSelect}
        />
      </div>

      {/* Main Chat Window */}
      <div className="hidden md:flex flex-1">
        <ChatWindow chat={activeChat} onSendMessage={handleSendMessage} />
      </div>

      {/* Mobile Chat Window */}
      {activeChat && (
        <div className="md:hidden fixed inset-0 bg-white dark:bg-gray-900 z-50">
          <ChatWindow
            chat={activeChat}
            onSendMessage={handleSendMessage}
            onBack={() => setActiveChat(null)}
          />
        </div>
      )}
    </div>
  );
}
