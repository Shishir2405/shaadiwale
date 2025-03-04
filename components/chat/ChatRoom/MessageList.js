// src/components/chat/ChatRoom/MessageList.js
'use client';

export default function MessageList({ messages, currentUserId, loading }) {
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[70%] p-3 rounded-lg ${
              message.senderId === currentUserId
                ? 'bg-blue-500 text-white rounded-br-none'
                : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
            }`}
          >
            <p className="break-words">{message.text}</p>
            <div className="text-xs mt-1 opacity-70">
              {message.timestamp?.toDate().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}