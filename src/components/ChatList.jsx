"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/lib/utils";
import {
  Search,
  MoreVertical,
  MessageCircle,
  Check,
  CheckCheck,
  Archive,
  SquarePen,
  Camera,
  Lock,
} from "lucide-react";

const ChatItem = ({ chat, isActive, onClick }) => {
  const lastMessage = chat.messages[chat.messages.length - 1];

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

  const formatMessagePreview = (message) => {
    if (!message) return "No messages yet";

    // Handle different message types
    if (message.message_type === "image") return "Photo";
    if (message.message_type === "document") return "Document";
    if (message.message_type === "video") return "Video";
    if (message.message_type === "audio") return "Audio";

    return message.text || "No messages yet";
  };

  const isMessageDeleted = lastMessage?.text?.includes(
    "This message was deleted"
  );

  return (
    <div
      className={`px-3 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 transition-colors ${
        isActive ? "bg-gray-100 dark:bg-gray-800/50" : ""
      }`}
      onClick={() => onClick(chat)}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src={chat.avatar} />
            <AvatarFallback className="bg-green-500 text-white text-lg font-medium">
              {chat.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {chat.is_online && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate pr-2">
              {chat.name}
            </h3>
            <div className="flex flex-col items-end space-y-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {formatDate(lastMessage?.timestamp)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1 mt-1">
            {lastMessage?.type === "outgoing" && !isMessageDeleted && (
              <div className="flex-shrink-0">
                {getStatusIcon(lastMessage.status)}
              </div>
            )}
            <p
              className={`text-sm truncate flex-1 ${
                chat.unreadCount > 0
                  ? "text-gray-900 dark:text-white font-medium"
                  : "text-gray-600 dark:text-gray-400"
              } ${isMessageDeleted ? "italic" : ""}`}
            >
              {isMessageDeleted && <Lock className="w-3 h-3 inline mr-1" />}
              {formatMessagePreview(lastMessage)}
            </p>
            {chat.unreadCount > 0 && (
                <div className="bg-green-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                  {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ChatList({ chats, activeChat, onChatSelect }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Unread", "Favorites", "Groups"];

  const filteredChats = chats.filter((chat) => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (!chat.name.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Category filter
    switch (activeFilter) {
      case "Unread":
        return chat.unreadCount > 0;
      case "Favorites":
        return chat.is_favorite; // Assuming you have this field
      case "Groups":
        return chat.is_group; // Assuming you have this field
      default:
        return true;
    }
  });

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0b141a]">
      {/* Header */}
      <div className="px-4 py-3 bg-white dark:bg-[#0b141a] border-none">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium text-gray-900 dark:text-white">
            WhatsApp
          </h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Camera className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <SquarePen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2 bg-white dark:bg-[#0b141a]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search or start a new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-100 dark:bg-[#2a3942] border-none focus:ring-1 focus:ring-green-500 text-sm"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 py-2 bg-white dark:bg-[#0b141a] border-none">
        <div className="flex space-x-1">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className={`text-xs px-3 py-1 h-8 ${
                activeFilter === filter
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Archived Section */}
      <div className="px-3 py-3 bg-white dark:bg-[#0b141a] border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-2 py-2 transition-colors">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
            <Archive className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Archived
          </span>
        </div>
      </div>

      {/* Chat List */}

      <div className="bg-white dark:bg-[#0b141a]">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <ChatItem
              key={chat.wa_id}
              chat={chat}
              isActive={activeChat?.wa_id === chat.wa_id}
              onClick={onChatSelect}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            {searchQuery ? (
              <>
                <Search className="w-12 h-12 mb-4 text-gray-300" />
                <p>No chats found for "{searchQuery}"</p>
              </>
            ) : (
              <>
                <MessageCircle className="w-12 h-12 mb-4 text-gray-300" />
                <p>No chats available</p>
                <p className="text-sm mt-2">Start a new conversation</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
