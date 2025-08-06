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
            ? "bg-green-500 text-white rounded-br-none"
            : "bg-white dark:bg-gray-700 border rounded-bl-none"
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

export default function ChatWindow({ chat, onSendMessage, onBack }) {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isTyping) return;

    setIsTyping(true);
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
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
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
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 dark:bg-gray-800">
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
            <h3 className="font-medium">{chat.name}</h3>
            <p className="text-sm text-gray-500">
              {chat.phone || `+${chat.wa_id}`}
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
          className="absolute inset-0 bg-gray-50 dark:bg-gray-900"
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
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t bg-white dark:bg-gray-800"
      >
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-12"
              disabled={isTyping}
            />
          </div>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
            disabled={!newMessage.trim() || isTyping}
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
