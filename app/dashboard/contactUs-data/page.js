"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  ChevronDown,
  Search,
  Mail,
  AlertCircle,
  RefreshCw,
  Briefcase,
  Building,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-white p-6 rounded-2xl border-2 border-gray-100 flex items-center gap-4"
  >
    <div className={`p-4 rounded-xl ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  </motion.div>
);

// Error Message Component
const ErrorMessage = ({ message, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center"
  >
    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-red-700 mb-2">
      Error Loading Data
    </h3>
    <p className="text-red-600 mb-6">{message}</p>
    <button
      onClick={onRetry}
      className="inline-flex items-center gap-2 px-6 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors"
    >
      <RefreshCw className="w-4 h-4" />
      Try Again
    </button>
  </motion.div>
);

// Loading State Component
const LoadingState = () => (
  <div className="space-y-8">
    {/* Animated loading for stats */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-2xl border-2 border-gray-100 animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-200 rounded-xl" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-6 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Animated loading for table */}
    <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
      <div className="p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ContactDashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [businessEnquiries, setBusinessEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    let unsubscribeContacts;
    let unsubscribeEnquiries;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch general contacts
        const contactsRef = collection(db, "contacts");
        const contactsQuery = query(contactsRef, orderBy("createdAt", "desc"));

        unsubscribeContacts = onSnapshot(
          contactsQuery,
          (snapshot) => {
            const contactsData = snapshot.docs.map((doc) => ({
              id: doc.id,
              type: "general",
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
              updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            }));
            setContacts(contactsData);
          },
          (error) => {
            console.error("Error fetching contacts:", error);
            setError(error.message);
          }
        );

        // Fetch business enquiries
        const enquiriesRef = collection(db, "businessEnquiries");
        const enquiriesQuery = query(
          enquiriesRef,
          orderBy("createdAt", "desc")
        );

        unsubscribeEnquiries = onSnapshot(
          enquiriesQuery,
          (snapshot) => {
            const enquiriesData = snapshot.docs.map((doc) => ({
              id: doc.id,
              type: "business",
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
              updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            }));
            setBusinessEnquiries(enquiriesData);
          },
          (error) => {
            console.error("Error fetching business enquiries:", error);
            setError(error.message);
          }
        );

        setLoading(false);
      } catch (error) {
        console.error("Error setting up listeners:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (unsubscribeContacts) unsubscribeContacts();
      if (unsubscribeEnquiries) unsubscribeEnquiries();
    };
  }, []);

  const handleStatusToggle = async (id, currentStatus, type) => {
    try {
      const collectionName =
        type === "business" ? "businessEnquiries" : "contacts";
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        responded: !currentStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const allItems = [...contacts, ...businessEnquiries];

    return {
      total: allItems.length,
      unread: allItems.filter((c) => !c.read).length,
      today: allItems.filter((c) => {
        const contactDate = new Date(c.createdAt);
        return contactDate >= today;
      }).length,
      responded: allItems.filter((c) => c.responded).length,
      business: businessEnquiries.length,
    };
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const getCurrentData = () => {
    const data = activeTab === "business" ? businessEnquiries : contacts;

    // Sort data
    const sortedData = [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (sortConfig.direction === "asc") {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    // Filter data
    return sortedData.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.organization?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Contact Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage all contact form submissions and business enquiries
          </p>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorMessage
            message={error}
            onRetry={() => window.location.reload()}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <StatCard
                title="Total Messages"
                value={stats.total}
                icon={MessageSquare}
                color="bg-blue-500"
              />
              <StatCard
                title="Unread Messages"
                value={stats.unread}
                icon={Mail}
                color="bg-[#e71c5d]"
              />
              <StatCard
                title="Today's Messages"
                value={stats.today}
                icon={Clock}
                color="bg-amber-500"
              />
              <StatCard
                title="Responded"
                value={stats.responded}
                icon={CheckCircle}
                color="bg-green-500"
              />
              <StatCard
                title="Business Enquiries"
                value={stats.business}
                icon={Briefcase}
                color="bg-purple-500"
              />
            </div>

            <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="p-4 border-b border-gray-100">
                  <TabsList className="grid grid-cols-2 gap-4 bg-gray-100 p-1 rounded-lg">
                    <TabsTrigger
                      value="general"
                      className="data-[state=active]:bg-white"
                    >
                      General Contact
                    </TabsTrigger>
                    <TabsTrigger
                      value="business"
                      className="data-[state=active]:bg-white"
                    >
                      Business Enquiries
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-4">
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#e71c5d] outline-none transition-all duration-300"
                    />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-100">
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-[#e71c5d]"
                            onClick={() => handleSort("name")}
                          >
                            <div className="flex items-center gap-2">
                              Name
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-[#e71c5d]"
                            onClick={() => handleSort("email")}
                          >
                            <div className="flex items-center gap-2">
                              Email
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </th>
                          {activeTab === "business" && (
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                              Organization
                            </th>
                          )}
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-[#e71c5d]"
                            onClick={() => handleSort("subject")}
                          >
                            <div className="flex items-center gap-2">
                              {activeTab === "business"
                                ? "Business Type"
                                : "Subject"}
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-[#e71c5d]"
                            onClick={() => handleSort("createdAt")}
                          >
                            <div className="flex items-center gap-2">
                              Date
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {getCurrentData().length === 0 ? (
                          <tr>
                            <td
                              colSpan={activeTab === "business" ? 6 : 5}
                              className="px-6 py-8 text-center text-gray-500"
                            >
                              No messages found
                            </td>
                          </tr>
                        ) : (
                          getCurrentData().map((item, index) => (
                            <motion.tr
                              key={item.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    {activeTab === "business" ? (
                                      <Building className="w-4 h-4 text-gray-600" />
                                    ) : (
                                      <Users className="w-4 h-4 text-gray-600" />
                                    )}
                                  </div>
                                  <span className="font-medium text-gray-900">
                                    {item.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                {item.email}
                              </td>
                              {activeTab === "business" && (
                                <td className="px-6 py-4 text-gray-600">
                                  {item.organization}
                                </td>
                              )}
                              <td className="px-6 py-4 text-gray-600">
                                {activeTab === "business"
                                  ? item.business
                                  : item.subject}
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                {formatDate(item.createdAt)}
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() =>
                                    handleStatusToggle(
                                      item.id,
                                      item.responded,
                                      item.type
                                    )
                                  }
                                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
                                    item.responded
                                      ? "bg-green-100 text-green-600 hover:bg-green-200"
                                      : "bg-amber-100 text-amber-600 hover:bg-amber-200"
                                  } text-sm`}
                                >
                                  {item.responded ? (
                                    <>
                                      <CheckCircle className="w-4 h-4" />
                                      Responded
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-4 h-4" />
                                      Pending
                                    </>
                                  )}
                                </button>
                              </td>
                            </motion.tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Tabs>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactDashboard;
