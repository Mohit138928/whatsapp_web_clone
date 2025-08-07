"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatTime } from "@/lib/utils";
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck,
  ArrowLeft,
  Plus,
  Mic,
  Smile,
  Paperclip,
  Camera,
  Image,
  FileText,
  Contact,
  MapPin,
  X,
} from "lucide-react";

const MessageBubble = ({ message }) => {
  const isOutgoing = message.type === "outgoing";

  const getStatusIcon = (status) => {
    switch (status) {
      case "sent":
        return <Check className="w-3 h-3 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-400" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex ${isOutgoing ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOutgoing
            ? "bg-green-800 text-white rounded-br-none"
            : "bg-white dark:bg-[#242626] border-none rounded-bl-none"
        }`}
      >
        <p className="text-sm">{message.text}</p>
        <div className="flex items-center justify-end space-x-1 mt-1">
          <span
            className={`text-xs ${
              isOutgoing ? "text-green-100" : "text-gray-500"
            }`}
          >
            {formatTime(message.timestamp)}
          </span>
          {isOutgoing && getStatusIcon(message.status)}
        </div>
      </div>
    </div>
  );
};

export default function ChatWindow({
  chat,
  onSendMessage,
  onBack,
  connectionStatus,
}) {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const attachmentMenuRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  // Close attachments menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        attachmentMenuRef.current &&
        !attachmentMenuRef.current.contains(event.target)
      ) {
        setShowAttachments(false);
      }
    };

    if (showAttachments) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showAttachments]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isTyping || isSending) return;

    // Check connection status
    if (connectionStatus !== "connected") {
      console.warn("Cannot send message: not connected to server");
      return;
    }

    setIsTyping(true);
    setIsSending(true);

    const messageData = {
      wa_id: chat.wa_id,
      text: newMessage.trim(),
      type: "outgoing",
      timestamp: new Date().toISOString(),
      status: "sent",
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    try {
      await onSendMessage(messageData);
      setNewMessage("");
      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = "20px";
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Show error message to user
    } finally {
      setIsTyping(false);
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px";
  };

  const handleAttachmentClick = () => {
    setShowAttachments(!showAttachments);
  };

  const handleFileUpload = (type) => {
    // This would handle different file types
    console.log(`Upload ${type} file`);
    setShowAttachments(false);
    // You can implement actual file upload logic here
  };

  const attachmentOptions = [
    {
      icon: FileText,
      label: "Document",
      color: "bg-blue-500",
      action: () => handleFileUpload("document"),
    },
    {
      icon: Camera,
      label: "Camera",
      color: "bg-pink-500",
      action: () => handleFileUpload("camera"),
    },
    {
      icon: Image,
      label: "Gallery",
      color: "bg-purple-500",
      action: () => handleFileUpload("gallery"),
    },
    {
      icon: Mic,
      label: "Audio",
      color: "bg-orange-500",
      action: () => handleFileUpload("audio"),
    },
    {
      icon: MapPin,
      label: "Location",
      color: "bg-green-500",
      action: () => handleFileUpload("location"),
    },
    {
      icon: Contact,
      label: "Contact",
      color: "bg-blue-600",
      action: () => handleFileUpload("contact"),
    },
  ];

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[#0b141a]">
        <div className="text-center text-gray-500">
          <div className="w-64 h-64 mx-auto mb-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg
              className="w-24 h-24 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
            WhatsApp Web
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Send and receive messages without keeping your phone online.
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0b141a] border-none">
        <div className="flex items-center space-x-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="md:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <Avatar className="cursor-pointer">
            <AvatarImage src={chat.avatar} />
            <AvatarFallback className="bg-green-500 text-white">
              {chat.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="cursor-pointer">
            <h3 className="font-medium flex items-center">
              {chat.name}
              {connectionStatus === "connected" && chat.is_online && (
                <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
              )}
            </h3>
            <p className="text-sm text-gray-500">
              {connectionStatus !== "connected" ? (
                <span className="text-red-500">
                  {connectionStatus === "reconnecting"
                    ? "Connecting..."
                    : "Offline"}
                </span>
              ) : chat.is_online ? (
                "online"
              ) : (
                chat.phone || `+${chat.wa_id}`
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" title="Voice call">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" title="Video call">
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" title="Menu">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 relative">
        <div
          className="absolute inset-0 bg-gray-50 dark:bg-[#0b141a]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.3' fill-rule='evenodd'%3E%3Cpath d='m0 40l40-40h-40v40zm40 0v-40h-40l40 40z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          <ScrollArea className="h-full p-4">
            <div className="space-y-2">
              {chat.messages.length > 0 ? (
                <>
                  {chat.messages.map((message, index) => (
                    <MessageBubble
                      key={message.id || index}
                      message={message}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="text-center text-gray-500 mt-10">
                  <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-yellow-800 dark:text-yellow-200">
                      🔒 Messages are end-to-end encrypted. No one outside of
                      this chat, not even WhatsApp, can read or listen to them.
                    </p>
                  </div>
                  <p className="mt-4">
                    Start the conversation with {chat.name}!
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Message Input */}
      <div className="relative">
        {/* Attachment Menu */}
        {showAttachments && (
          <div
            ref={attachmentMenuRef}
            className="absolute bottom-20 left-4 bg-white dark:bg-[#233138] rounded-lg shadow-lg p-3 z-10 border border-gray-200 dark:border-gray-600"
          >
            <div className="grid grid-cols-3 gap-3 w-48">
              {attachmentOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={option.action}
                  className="flex flex-col items-center p-3 hover:bg-gray-100 dark:hover:bg-[#2a3942] rounded-lg transition-colors group"
                >
                  <div
                    className={`w-12 h-12 ${option.color} rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}
                  >
                    <option.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          onSubmit={handleSendMessage}
          className="p-4 bg-white dark:bg-[#0b141a] border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-end space-x-2">
            {/* Attachment Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleAttachmentClick}
              className="flex-shrink-0 w-10 h-10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showAttachments ? (
                <X className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </Button>

            {/* Message Input Container */}
            <div className="flex-1 relative bg-white dark:bg-[#2a3942] rounded-full border border-gray-200 dark:border-gray-600 flex items-center">
              {/* Emoji Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="flex-shrink-0 w-10 h-10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-1"
              >
                <Smile className="w-5 h-5" />
              </Button>

              {/* Text Input */}
              <div className="flex-1 px-1">
                <textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message"
                  className="w-full bg-transparent border-none outline-none resize-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 py-2 px-2 max-h-20 min-h-[20px] leading-5 content-center items-center flex"
                  rows="1"
                  disabled={isTyping}
                />
              </div>
            </div>

            {/* Send/Mic Button */}
            <Button
              type={newMessage.trim() ? "submit" : "button"}
              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                newMessage.trim()
                  ? connectionStatus === "connected"
                    ? "bg-green-500 hover:bg-green-600 text-white shadow-lg"
                    : "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
              disabled={
                isTyping ||
                isSending ||
                (newMessage.trim() && connectionStatus !== "connected")
              }
              onClick={
                !newMessage.trim()
                  ? () => console.log("Start voice recording")
                  : undefined
              }
              title={
                connectionStatus !== "connected"
                  ? "Not connected"
                  : newMessage.trim()
                  ? "Send message"
                  : "Record voice message"
              }
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : newMessage.trim() ? (
                <Send className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
