"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";
import {
  Loader2,
  ArrowLeft,
  User,
  AlertTriangle,
  Calendar,
  Download,
  Printer,
  Eye,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";

// Function to format timestamp
const formatTime = (timestamp) => {
  if (!timestamp) return "";
  try {
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "";
  }
};

// Function to format date
const formatDate = (timestamp) => {
  if (!timestamp) return "";
  try {
    const date = timestamp.toDate();
    return format(date, "MMM dd, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

// Message Bubble Component
const ChatBubble = ({ message, sender, otherParticipant }) => {
  const isSentByUser1 = message.senderId === sender.id;

  return (
    <div
      className={`flex ${isSentByUser1 ? "justify-end" : "justify-start"} mb-4`}
    >
      {!isSentByUser1 && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white mr-2 mt-1">
          {otherParticipant?.firstName ? (
            otherParticipant.firstName[0]
          ) : (
            <User className="w-4 h-4" />
          )}
        </div>
      )}
      <div
        className={`max-w-[70%] p-3 rounded-lg ${
          isSentByUser1
            ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-none"
            : "bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-none"
        }`}
      >
        <p className="break-words">{message.text}</p>
        <div className="flex items-center justify-end gap-1 mt-1 text-xs">
          <span className={isSentByUser1 ? "text-pink-100" : "text-gray-500"}>
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
      {isSentByUser1 && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white ml-2 mt-1">
          {sender?.firstName ? (
            sender.firstName[0]
          ) : (
            <User className="w-4 h-4" />
          )}
        </div>
      )}
    </div>
  );
};

// Date Separator Component
const DateSeparator = ({ date }) => (
  <div className="flex items-center justify-center my-4">
    <div className="bg-gray-200 px-3 py-1 rounded-full text-xs text-gray-600">
      {date}
    </div>
  </div>
);

export default function ConversationPage() {
  const [user, authLoading] = useAuthState(auth);
  const params = useParams();
  const router = useRouter();
  const chatId = params.chatId;
  const messagesEndRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [participant1, setParticipant1] = useState(null);
  const [participant2, setParticipant2] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [messageGroups, setMessageGroups] = useState({});

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check if user is admin and load conversation
  useEffect(() => {
    const checkAdminStatusAndLoadChat = async () => {
      if (authLoading) return;
      if (!user) {
        setError("You must be logged in to access this page");
        setLoading(false);
        return;
      }

      try {
        // For demo purposes, just set isAdmin to true to bypass the check
        setIsAdmin(true);

        // In a real app, you would check the admin status from Firestore
        // const userDoc = await getDoc(doc(db, 'users', user.uid));
        // if (userDoc.exists() && userDoc.data().role === 'admin') {
        //   setIsAdmin(true);
        // } else {
        //   setError("You don't have admin privileges to access this page");
        //   setLoading(false);
        //   return;
        // }

        // Load chat data
        await loadChatData();
      } catch (err) {
        console.error("Error in initialization:", err);
        setError("An error occurred while loading the chat");
        setLoading(false);
      }
    };

    checkAdminStatusAndLoadChat();
  }, [user, authLoading, chatId]);

  // Load chat data and participants
  const loadChatData = async () => {
    try {
      // Validate chat ID
      if (!chatId || typeof chatId !== "string") {
        setError("Invalid conversation ID");
        setLoading(false);
        return;
      }

      // Get chat document
      const chatDoc = await getDoc(doc(db, "chats", chatId));

      if (!chatDoc.exists()) {
        setError("Conversation not found");
        setLoading(false);
        return;
      }

      const chatData = chatDoc.data();

      // Get participants details
      const participantIds = chatData.participants || [];
      if (participantIds.length < 2) {
        setError("Invalid conversation format");
        setLoading(false);
        return;
      }

      // Get first participant details
      if (participantIds[0]) {
        try {
          const participant1Doc = await getDoc(
            doc(db, "users", participantIds[0])
          );
          if (participant1Doc.exists()) {
            setParticipant1({
              id: participant1Doc.id,
              ...participant1Doc.data(),
            });
          }
        } catch (err) {
          console.error("Error fetching participant 1:", err);
        }
      }

      // Get second participant details
      if (participantIds[1]) {
        try {
          const participant2Doc = await getDoc(
            doc(db, "users", participantIds[1])
          );
          if (participant2Doc.exists()) {
            setParticipant2({
              id: participant2Doc.id,
              ...participant2Doc.data(),
            });
          }
        } catch (err) {
          console.error("Error fetching participant 2:", err);
        }
      }

      // Set up message listener
      try {
        const messagesCollection = collection(db, `chats/${chatId}/messages`);
        const messagesQuery = query(
          messagesCollection,
          orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(
          messagesQuery,
          (snapshot) => {
            const messageList = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            setMessages(messageList);

            // Group messages by date for separators
            const groups = {};
            messageList.forEach((message) => {
              if (message.timestamp) {
                const date = formatDate(message.timestamp);
                if (!groups[date]) {
                  groups[date] = [];
                }
                groups[date].push(message);
              }
            });

            setMessageGroups(groups);
            setLoading(false);
          },
          (error) => {
            console.error("Error in messages listener:", error);
            setError("Failed to load messages");
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (err) {
        console.error("Error setting up messages listener:", err);
        setError("Failed to load messages");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error loading chat data:", err);
      setError("Failed to load conversation");
      setLoading(false);
    }
  };

  // Handler for exporting chat as text
  const handleExport = () => {
    try {
      let exportText = `Chat between ${
        participant1?.firstName || "User 1"
      } and ${participant2?.firstName || "User 2"}\n\n`;

      Object.entries(messageGroups).forEach(([date, msgs]) => {
        exportText += `=== ${date} ===\n\n`;
        msgs.forEach((msg) => {
          const sender =
            msg.senderId === participant1?.id ? participant1 : participant2;
          const senderName = `${sender?.firstName || "Unknown"} ${
            sender?.lastName || ""
          }`;
          const time = formatTime(msg.timestamp);
          exportText += `[${time}] ${senderName}: ${msg.text}\n`;
        });
        exportText += "\n";
      });

      const blob = new Blob([exportText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chat_export_${chatId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting chat:", err);
      alert("Failed to export chat");
    }
  };

  if (authLoading || (loading && !error)) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
        <div className="mt-4">
          <Link
            href="/dashboard/user-activity/chat"
            className="text-pink-500 hover:text-pink-700 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <Link
          href={
            participant1
              ? `/dashboard/user-activity/chat/user/${participant1.id}`
              : "/dashboard/user-activity/chat"
          }
          className="text-pink-500 hover:text-pink-700 flex items-center mb-3"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to User Conversations
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          Conversation Monitor
        </h1>
        <p className="text-gray-600">
          Viewing chat between {participant1?.firstName || "User 1"} and{" "}
          {participant2?.firstName || "User 2"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Participants Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-pink-50 rounded-lg">
                  <User className="w-5 h-5 text-pink-500" />
                </div>
                <h2 className="font-semibold text-gray-900">Participants</h2>
              </div>
            </div>

            <div className="p-4">
              {/* First participant */}
              {participant1 && (
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white">
                      {participant1.firstName ? (
                        participant1.firstName[0]
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {participant1.firstName} {participant1.lastName}
                      </h3>
                      <p className="text-xs text-gray-500">User 1</p>
                    </div>
                  </div>
                  <div className="pl-13 ml-13">
                    {participant1.email && (
                      <p className="text-sm text-gray-600 mb-1">
                        {participant1.email}
                      </p>
                    )}
                    {participant1.phone && (
                      <p className="text-sm text-gray-600">
                        {participant1.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Second participant */}
              {participant2 && (
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                      {participant2.firstName ? (
                        participant2.firstName[0]
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {participant2.firstName} {participant2.lastName}
                      </h3>
                      <p className="text-xs text-gray-500">User 2</p>
                    </div>
                  </div>
                  <div className="pl-13 ml-13">
                    {participant2.email && (
                      <p className="text-sm text-gray-600 mb-1">
                        {participant2.email}
                      </p>
                    )}
                    {participant2.phone && (
                      <p className="text-sm text-gray-600">
                        {participant2.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Admin Actions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-pink-50 rounded-lg">
                  <Eye className="w-5 h-5 text-pink-500" />
                </div>
                <h2 className="font-semibold text-gray-900">Admin Actions</h2>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <button
                onClick={handleExport}
                className="w-full py-2 px-4 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Chat</span>
              </button>

              <button
                onClick={() => window.print()}
                className="w-full py-2 px-4 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Conversation</span>
              </button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-50 rounded-lg">
                <MessageSquare className="w-5 h-5 text-pink-500" />
              </div>
              <h2 className="font-semibold text-gray-900">
                Conversation History
              </h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-[500px] max-h-[calc(100vh-300px)]">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-50 text-pink-500 mb-4">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No messages
                  </h3>
                  <p className="text-gray-500">
                    This conversation has no messages yet.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {Object.entries(messageGroups).map(([date, msgs]) => (
                  <div key={date}>
                    <DateSeparator date={date} />
                    {msgs.map((message) => (
                      <ChatBubble
                        key={message.id}
                        message={message}
                        sender={
                          message.senderId === participant1?.id
                            ? participant1
                            : participant2
                        }
                        otherParticipant={
                          message.senderId === participant1?.id
                            ? participant2
                            : participant1
                        }
                      />
                    ))}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex items-center justify-center">
              <div className="px-4 py-2 bg-pink-50 text-pink-600 rounded-full text-sm">
                Admin monitoring mode - You are viewing this conversation as an
                administrator
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
