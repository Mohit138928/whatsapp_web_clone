"use client";

import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import WhatsAppLoader from "./WhatsAppLoader";
import apiClient from "@/lib/api";

export default function WhatsAppClone() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
      {
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );
    setSocket(socketInstance);

    // Connection event handlers
    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance.id);
      setIsConnected(true);
      setConnectionStatus("connected");
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
      setConnectionStatus("disconnected");
    });

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
      setConnectionStatus("connected");
    });

    socketInstance.on("reconnect_attempt", (attemptNumber) => {
      console.log("🔄 Attempting to reconnect...", attemptNumber);
      setConnectionStatus("reconnecting");
    });

    socketInstance.on("reconnect_error", (error) => {
      console.log("❌ Reconnection failed:", error);
      setConnectionStatus("error");
    });

    // Listen for real-time message updates
    socketInstance.on("newMessage", (messageData) => {
      console.log("📨 New message received via Socket.IO:", messageData);

      setChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat.wa_id === messageData.wa_id) {
            // Check if message already exists to prevent duplicates
            const messageExists = chat.messages.some(
              (msg) =>
                msg.id === messageData.id ||
                (msg.meta_msg_id && msg.meta_msg_id === messageData.meta_msg_id)
            );

            if (!messageExists) {
              return {
                ...chat,
                messages: [...chat.messages, messageData],
                lastMessage: messageData,
                unreadCount:
                  messageData.type === "incoming"
                    ? (chat.unreadCount || 0) + 1
                    : chat.unreadCount,
              };
            }
          }
          return chat;
        });
      });

      // Update active chat if it's the same conversation
      if (activeChat && activeChat.wa_id === messageData.wa_id) {
        setActiveChat((prev) => ({
          ...prev,
          messages: [...prev.messages, messageData],
          lastMessage: messageData,
        }));
      }
    });

    socketInstance.on("messageStatusUpdate", (updateData) => {
      console.log("📋 Message status update received:", updateData);

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

      // Update active chat status
      if (activeChat && activeChat.wa_id === updateData.wa_id) {
        setActiveChat((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) => {
            if (
              msg.id === updateData.id ||
              msg.meta_msg_id === updateData.meta_msg_id
            ) {
              return { ...msg, status: updateData.status };
            }
            return msg;
          }),
        }));
      }
    });

    // Listen for typing indicators (if implemented)
    socketInstance.on("userTyping", (data) => {
      console.log("⌨️ User typing:", data);
      // You can implement typing indicators here
    });

    // Listen for online status updates
    socketInstance.on("userOnlineStatus", (data) => {
      console.log("🟢 User online status:", data);
      setChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat.wa_id === data.wa_id) {
            return {
              ...chat,
              is_online: data.is_online,
              last_seen: data.last_seen
                ? new Date(data.last_seen)
                : chat.last_seen,
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
      // On error, still show the loading screen for a bit
      setTimeout(() => setLoading(false), 2000);
    }
    // Don't set loading to false here - let the loader component handle it
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
    return <WhatsAppLoader onLoadingComplete={() => setLoading(false)} />;
  }

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-[#0b141a]">
      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 text-sm z-50">
          {connectionStatus === "reconnecting" ? (
            <span>🔄 Reconnecting...</span>
          ) : connectionStatus === "error" ? (
            <span>❌ Connection failed. Retrying...</span>
          ) : (
            <span>❌ Disconnected from server</span>
          )}
        </div>
      )}

      {/* Sidebar */}
      <div className="w-full md:w-96 border-none flex flex-col">
        <ChatList
          chats={chats}
          activeChat={activeChat}
          onChatSelect={handleChatSelect}
          connectionStatus={connectionStatus}
        />
      </div>

      {/* Main Chat Window */}
      <div className="hidden md:flex flex-1">
        <ChatWindow
          chat={activeChat}
          onSendMessage={handleSendMessage}
          connectionStatus={connectionStatus}
        />
      </div>

      {/* Mobile Chat Window */}
      {activeChat && (
        <div className="md:hidden fixed inset-0 bg-white dark:bg-gray-900 z-50">
          <ChatWindow
            chat={activeChat}
            onSendMessage={handleSendMessage}
            onBack={() => setActiveChat(null)}
            connectionStatus={connectionStatus}
          />
        </div>
      )}
    </div>
  );
}
