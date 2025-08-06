"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/lib/utils";
import { MessageCircle, Check, CheckCheck } from "lucide-react";

const ChatItem = ({ chat, isActive, onClick }) => {
  const lastMessage = chat.messages[chat.messages.length - 1];

  const getStatusIcon = (status) => {
    switch (status) {
      case "sent":
        return <Check className="w-4 h-4 text-gray-500" />;
      case "delivered":
        return <CheckCheck className="w-4 h-4 text-gray-500" />;
      case "read":
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <Card
      className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-none shadow-none ${
        isActive ? "bg-gray-100 dark:bg-gray-800" : ""
      }`}
      onClick={() => onClick(chat)}
    >
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={chat.avatar} />
          <AvatarFallback className="bg-green-500 text-white">
            {chat.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-sm truncate">{chat.name}</h3>
            <span className="text-xs text-gray-500">
              {formatDate(lastMessage?.timestamp)}
            </span>
          </div>
          <div className="flex items-center space-x-1 mt-1">
            {lastMessage?.type === "outgoing" &&
              getStatusIcon(lastMessage.status)}
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {lastMessage?.text || "No messages yet"}
            </p>
          </div>
        </div>
        {chat.unreadCount > 0 && (
          <div className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {chat.unreadCount}
          </div>
        )}
      </div>
    </Card>
  );
};

export default function ChatList({ chats, activeChat, onChatSelect }) {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-green-600" />
          Chats
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {chats.length > 0 ? (
            chats.map((chat) => (
              <ChatItem
                key={chat.wa_id}
                chat={chat}
                isActive={activeChat?.wa_id === chat.wa_id}
                onClick={onChatSelect}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <MessageCircle className="w-12 h-12 mb-4" />
              <p>No chats available</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
