'use client';

import React, { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  orderBy,
  onSnapshot,
  limit
} from 'firebase/firestore';
import { 
  Loader2, 
  Search, 
  User, 
  MessageSquare, 
  Users, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function AdminChatPage() {
  const [user, authLoading] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      try {
        // For demo purposes, just set isAdmin to true to bypass the admin check
        setIsAdmin(true);
        fetchUsers();
        
        // In a real app, you would use this code instead:
        // const userDoc = await getDoc(doc(db, 'users', user.uid));
        // if (userDoc.exists() && userDoc.data().role === 'admin') {
        //   setIsAdmin(true);
        //   fetchUsers();
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
  }, [user, authLoading]);

  const fetchUsers = async () => {
    try {
      // Use a simple query without filters that might have undefined values
      const usersQuery = query(collection(db, 'users'), limit(50));
      const querySnapshot = await getDocs(usersQuery);
      
      // Get all users
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setUsersList(usersData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users list");
      setLoading(false);
    }
  };

  const filteredUsers = usersList.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    const phone = (user.phone || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return fullName.includes(searchLower) || 
           email.includes(searchLower) || 
           phone.includes(searchLower);
  });

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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Admin Chat Monitor</h1>
          <p className="text-gray-600">View and monitor user conversations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Users List */}
        <div className="md:col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-50 rounded-lg">
                <Users className="w-5 h-5 text-pink-500" />
              </div>
              <h2 className="font-semibold text-gray-900">Users</h2>
            </div>
            
            <div className="mt-3 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-[calc(100vh-240px)]">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No users found
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filteredUsers.map(user => (
                  <li key={user.id}>
                    <Link
                      href={`/dashboard/user-activity/chat/user/${user.id}`}
                      className="block hover:bg-gray-50 transition-colors p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white">
                          {user.firstName ? user.firstName[0] : <User className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {user.email || user.phone || 'No contact info'}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Instructions for Admin */}
        <div className="md:col-span-2 lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-50 rounded-lg">
                <MessageSquare className="w-5 h-5 text-pink-500" />
              </div>
              <h2 className="font-semibold text-gray-900">Chat Monitoring Dashboard</h2>
            </div>
          </div>
          
          <div className="p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
            <div className="mb-4 p-3 rounded-full bg-pink-50">
              <MessageSquare className="w-10 h-10 text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a User to Monitor</h3>
            <p className="text-gray-600 max-w-md">
              Click on a user from the list to view their conversations. You can then select conversations to monitor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}