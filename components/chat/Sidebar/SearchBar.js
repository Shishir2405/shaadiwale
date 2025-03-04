// src/components/Sidebar/SearchBar.js
'use client';

import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="p-4 border-b">
      <div className="relative">
        <input
          type="text"
          placeholder="Search contacts..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
      </div>
    </div>
  );
}