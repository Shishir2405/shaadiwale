"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    deleteDoc,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp
  } from "firebase/firestore";  
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("receiverId", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notificationsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(notificationsList);
        setLoading(false);
      },
      (error) => {
        console.error("Error in notifications listener:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read and delete
      await deleteDoc(doc(db, "notifications", notification.id));

      // Remove from local state
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));

      // Redirect to chat if it's a message notification
      if (notification.type === "message") {
        router.push(`/chat/${notification.senderId}`);
      }
    } catch (error) {
      console.error("Error handling notification:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h1 className="text-xl font-semibold">Notifications</h1>
          </div>

          <div className="divide-y">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="text-gray-900">{notification.message}</p>
                    <p className="text-sm text-gray-500">
                      {notification.timestamp?.toDate().toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationClick(notification)}
                    className="flex items-center gap-2 px-4 py-2 text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                  >
                    View
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
