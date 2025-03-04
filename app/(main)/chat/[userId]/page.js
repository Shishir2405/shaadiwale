"use client";

import React, { Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { ArrowLeft } from "lucide-react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import MessageList from "@/components/chat/ChatRoom/MessageList";
import ChatInput from "@/components/chat/ChatRoom/ChatInput";
import { useRouter } from "next/navigation";

function ChatRoom({ params }) {
  const unwrappedParams = React.use(params);
  const contactId = unwrappedParams.userId;

  const [messages, setMessages] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [contact, setContact] = React.useState(null);
  const [error, setError] = React.useState(null);
  const { user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    async function fetchContact() {
      if (!contactId) {
        setError("No contact ID provided");
        setLoading(false);
        return;
      }

      if (!user) {
        setError("Please sign in to view messages");
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "users", contactId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setContact({
            id: docSnap.id,
            ...docSnap.data(),
          });
        } else {
          setError("Contact not found");
        }
      } catch (error) {
        console.error("Error fetching contact:", error);
        setError("Failed to load contact");
      } finally {
        setLoading(false);
      }
    }

    fetchContact();
  }, [contactId, user]);

  React.useEffect(() => {
    if (!contact || !user) return;

    try {
      const chatId = [user.uid, contact.id].sort().join("_");

      const q = query(
        collection(db, `chats/${chatId}/messages`),
        orderBy("timestamp", "asc")
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const messageList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMessages(messageList);
          setLoading(false);
        },
        (error) => {
          console.error("Error in messages listener:", error);
          setError("Failed to load messages");
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up messages listener:", error);
      setError("Failed to initialize chat");
      setLoading(false);
    }
  }, [contact, user]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || !contact || !user) return;

    const chatId = [user.uid, contact.id].sort().join("_");

    try {
      // Add message to chat
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        text: messageText,
        senderId: user.uid,
        receiverId: contact.id,
        timestamp: serverTimestamp(),
        read: false,
      });

      // Create notification for receiver
      await addDoc(collection(db, "notifications"), {
        type: "message",
        message: "New message",
        senderId: user.uid,
        receiverId: contact.id,
        timestamp: serverTimestamp(),
        read: false,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading || !contact) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white min-h-screen flex flex-col">
        <div className="flex items-center gap-4 p-4 border-b">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
              <span className="text-pink-500 font-semibold">
                {contact.firstName?.[0]}
              </span>
            </div>
            <div>
              <h3 className="font-semibold">
                {contact.firstName} {contact.lastName}
              </h3>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>
        </div>

        <MessageList
          messages={messages}
          currentUserId={user?.uid}
          loading={loading}
        />
        <ChatInput onSend={sendMessage} />
      </div>
    </div>
  );
}

export default function ChatPage({ params }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        </div>
      }
    >
      <ChatRoom params={params} />
    </Suspense>
  );
}
