// src/components/chat/ChatRoom/index.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

export default function ChatRoom({ contact }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!contact || !user) return;

    // Create a unique chat ID by combining both user IDs
    const chatId = [user.uid, contact.id].sort().join('_');
    
    // Set up real-time listener for messages
    const q = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messageList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [contact, user]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || !contact || !user) return;

    const chatId = [user.uid, contact.id].sort().join('_');

    try {
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        text: messageText,
        senderId: user.uid,
        receiverId: contact.id,
        timestamp: serverTimestamp(),
        read: false
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // You could add toast notification here for error handling
    }
  };

  if (!contact) return null;

  return (
    <div className="flex flex-col h-full bg-white">
      <ChatHeader contact={contact} />
      <MessageList 
        messages={messages} 
        currentUserId={user?.uid}
        loading={loading}
      />
      <ChatInput onSend={sendMessage} />
    </div>
  );
}