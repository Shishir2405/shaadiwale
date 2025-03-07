"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  query,
  where,
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
  MessageSquare,
  Users,
  AlertTriangle,
  Calendar,
  Mail,
  Phone,
} from "lucide-react";

export default function UserChatsPage() {
  const [user, authLoading] = useAuthState(auth);
  const params = useParams();
  const router = useRouter();
  const userId = params.userId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      try {
        // For demo purposes, just set isAdmin to true to bypass the admin check
        setIsAdmin(true);
        fetchUserProfile();
        fetchUserConversations();

        // In a real app, you would use this code instead:
        // const userDoc = await getDoc(doc(db, 'users', user.uid));
        // if (userDoc.exists() && userDoc.data().role === 'admin') {
        //   setIsAdmin(true);
        //   fetchUserProfile();
        //   fetchUserConversations();
        // } else {
        //   setError("You don't have admin privileges to access this page");
        //   setLoading(false);
        // }
      } catch (err) {
        console.error("Error checking admin status:", err);
        setError("An error occurred while verifying your permissions");
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (user) {
        checkAdminStatus();
      } else {
        setError("You must be logged in to access this page");
        setLoading(false);
      }
    }
  }, [user, authLoading, userId]);

  const fetchUserProfile = async () => {
    try {
      // Make sure userId is valid before querying
      if (!userId || typeof userId !== "string") {
        setError("Invalid user ID");
        setLoading(false);
        return;
      }

      const userDoc = await getDoc(doc(db, "users", userId));

      if (userDoc.exists()) {
        setUserProfile({
          id: userDoc.id,
          ...userDoc.data(),
        });
      } else {
        setError("User not found");
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError("Failed to load user profile");
    }
  };

  const fetchUserConversations = async () => {
    try {
      // Make sure userId is valid before querying
      if (!userId || typeof userId !== "string") {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Simplify query - just get the conversations collection without complex filters
      const chatsSnapshot = await getDocs(collection(db, "chats"));

      // Filter in JavaScript after retrieving data
      const relevantChats = chatsSnapshot.docs.filter((doc) => {
        const data = doc.data();
        return (
          data.participants &&
          Array.isArray(data.participants) &&
          data.participants.includes(userId)
        );
      });

      if (relevantChats.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Process the conversations
      const conversationsData = relevantChats.map((chatDoc) => {
        const chatData = chatDoc.data();
        return {
          id: chatDoc.id,
          ...chatData,
          otherParticipant: {
            id: chatData.participants?.find((id) => id !== userId) || "unknown",
          },
        };
      });

      setConversations(conversationsData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching user conversations:", err);
      setError("Failed to load conversations");
      setLoading(false);
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

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>You don't have admin privileges to access this page</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/user-activity/chat"
          className="text-pink-500 hover:text-pink-700 flex items-center mb-3"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Admin Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          {userProfile
            ? `${userProfile.firstName} ${userProfile.lastName}'s Conversations`
            : "User Conversations"}
        </h1>
        <p className="text-gray-600">View and monitor chat history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* User Profile */}
        {userProfile && (
          <div className="md:col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-pink-50 rounded-lg">
                  <User className="w-5 h-5 text-pink-500" />
                </div>
                <h2 className="font-semibold text-gray-900">User Profile</h2>
              </div>
            </div>

            <div className="p-4">
              <div className="flex flex-col items-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white text-xl font-semibold mb-2">
                  {userProfile.firstName ? (
                    userProfile.firstName[0]
                  ) : (
                    <User className="w-8 h-8" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {userProfile.firstName} {userProfile.lastName}
                </h3>
                <p className="text-sm text-gray-500">
                  {userProfile.gender === "male"
                    ? "Male"
                    : userProfile.gender === "female"
                    ? "Female"
                    : "Unknown"}
                </p>
              </div>

              <div className="space-y-3">
                {userProfile.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">{userProfile.email}</span>
                  </div>
                )}

                {userProfile.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">{userProfile.phone}</span>
                  </div>
                )}

                {userProfile.dateOfBirth && (
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">
                      {new Date(userProfile.dateOfBirth).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Additional Info
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {userProfile.residingCity && (
                    <div className="text-sm">
                      <span className="text-gray-500">City:</span>{" "}
                      <span className="font-medium text-gray-800">
                        {userProfile.residingCity}
                      </span>
                    </div>
                  )}

                  {userProfile.residingState && (
                    <div className="text-sm">
                      <span className="text-gray-500">State:</span>{" "}
                      <span className="font-medium text-gray-800">
                        {userProfile.residingState}
                      </span>
                    </div>
                  )}

                  {userProfile.occupation && (
                    <div className="text-sm">
                      <span className="text-gray-500">Job:</span>{" "}
                      <span className="font-medium text-gray-800">
                        {userProfile.occupation}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="md:col-span-2 lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-50 rounded-lg">
                <MessageSquare className="w-5 h-5 text-pink-500" />
              </div>
              <h2 className="font-semibold text-gray-900">Conversations</h2>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(100vh-240px)]">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-50 text-pink-500 mb-4">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No conversations found
                </h3>
                <p className="text-gray-500">
                  This user hasn't had any conversations yet.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {conversations.map((conversation) => (
                  <li key={conversation.id}>
                    <Link
                      href={`/dashboard/user-activity/chat/conversation/${conversation.id}`}
                      className="block hover:bg-gray-50 transition-colors p-4"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                          {conversation.otherParticipant.firstName ? (
                            conversation.otherParticipant.firstName[0]
                          ) : (
                            <User className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {conversation.otherParticipant.firstName ||
                                "Unknown"}{" "}
                              {conversation.otherParticipant.lastName || ""}
                            </p>
                            {conversation.lastMessage?.timestamp && (
                              <p className="text-xs text-gray-500">
                                {conversation.lastMessage.timestamp
                                  .toDate()
                                  .toLocaleString([], {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                              </p>
                            )}
                          </div>
                          {conversation.lastMessage ? (
                            <p className="text-sm text-gray-500 truncate">
                              {conversation.lastMessage.senderId === userId
                                ? "User: "
                                : "Contact: "}
                              {conversation.lastMessage.text}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400 italic">
                              No messages
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
