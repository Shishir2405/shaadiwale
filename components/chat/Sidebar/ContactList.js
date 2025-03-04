// src/components/Sidebar/ContactList.js
'use client';

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ContactItem = ({ contact, isSelected, onClick }) => {
  const displayName = contact.name || contact.email || 'Anonymous User';
  
  return (
    <div
      onClick={onClick}
      className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 transition-colors ${
        isSelected ? 'bg-blue-50' : ''
      }`}
    >
      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
        {displayName.charAt(0).toUpperCase()}
      </div>
      <div className="ml-4">
        <h3 className="font-medium">{displayName}</h3>
        <p className="text-sm text-gray-500">{contact.status || 'Offline'}</p>
      </div>
    </div>
  );
};

export default function ContactList({ onSelectContact }) {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.email) return;

    try {
      // Query to get all users except the current user
      const q = query(
        collection(db, 'users'),
        where('email', '!=', user.email)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const contactsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || data.email || 'Anonymous User',
            email: data.email,
            status: data.status || 'Offline',
            lastSeen: data.lastSeen,
            ...data
          };
        });
        setContacts(contactsData);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching contacts:', error);
        setError('Failed to load contacts');
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up contacts listener:', err);
      setError('Failed to initialize contacts');
      setLoading(false);
    }
  }, [user]);

  const filteredContacts = contacts.filter(contact => {
    const searchString = searchQuery.toLowerCase();
    const contactName = (contact.name || '').toLowerCase();
    const contactEmail = (contact.email || '').toLowerCase();
    
    return contactName.includes(searchString) || 
           contactEmail.includes(searchString);
  });

  const handleContactSelect = (contact) => {
    setSelectedContactId(contact.id);
    onSelectContact(contact);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-blue-500 hover:text-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length > 0 ? (
          filteredContacts.map(contact => (
            <ContactItem
              key={contact.id}
              contact={contact}
              isSelected={contact.id === selectedContactId}
              onClick={() => handleContactSelect(contact)}
            />
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? 'No contacts found' : 'No contacts available'}
          </div>
        )}
      </div>
    </div>
  );
}