// src/components/Sidebar/ContactItem.js
'use client';

export default function ContactItem({ contact, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 transition-colors ${
        isSelected ? 'bg-blue-50' : ''
      }`}
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
          {contact.name.charAt(0)}
        </div>
        {contact.status === 'online' && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>
      <div className="ml-4 flex-1">
        <h3 className="font-medium">{contact.name}</h3>
        <p className="text-sm text-gray-500">{contact.lastMessage || 'No messages yet'}</p>
      </div>
      {contact.unreadCount > 0 && (
        <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {contact.unreadCount}
        </div>
      )}
    </div>
  );
}