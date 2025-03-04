// src/components/Layout/MainLayout.js
'use client';

import { useState } from 'react';
import ContactList from '@/components/chat/Sidebar/ContactList';
import ChatRoom from '@/components/chat/ChatRoom/index'

export default function MainLayout() {
  const [selectedContact, setSelectedContact] = useState(null);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 min-w-[300px] bg-white shadow-lg">
        <ContactList onSelectContact={setSelectedContact} />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <ChatRoom contact={selectedContact} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a contact to start chatting
          </div>
        )}
      </div>
    </div>
  );
}