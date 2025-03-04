// src/components/chat/ChatRoom/ChatHeader.js
'use client';

export default function ChatHeader({ contact }) {
  return (
    <div className="p-4 border-b flex items-center">
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
          {contact.name.charAt(0)}
        </div>
        {contact.status === 'online' && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>
      <div className="ml-4 flex-1">
        <h2 className="font-semibold">{contact.name}</h2>
        <p className="text-sm text-gray-500">
          {contact.status === 'online' ? 'Online' : 'Offline'}
        </p>
      </div>
    </div>
  );
}