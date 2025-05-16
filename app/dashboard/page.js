"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Users,
  UserCheck,
  CreditCard,
  Star,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DashboardPage = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    premium: 0,
    featured: 0,
  });
  const [recentMembers, setRecentMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("week");
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersRef = collection(db, "users");

        // Get total members
        const totalSnapshot = await getDocs(usersRef);
        const totalCount = totalSnapshot.size;

        // Get active members (active in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activeQuery = query(
          usersRef,
          where("lastActiveAt", ">=", Timestamp.fromDate(thirtyDaysAgo))
        );
        const activeSnapshot = await getDocs(activeQuery);
        const activeCount = activeSnapshot.size;

        // Get premium members
        const premiumQuery = query(usersRef, where("isPremium", "==", true));
        const premiumSnapshot = await getDocs(premiumQuery);
        const premiumCount = premiumSnapshot.size;

        // Get featured members
        const featuredQuery = query(usersRef, where("isFeatured", "==", true));
        const featuredSnapshot = await getDocs(featuredQuery);
        const featuredCount = featuredSnapshot.size;

        setStats({
          total: totalCount,
          active: activeCount,
          premium: premiumCount,
          featured: featuredCount,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const fetchMembers = async () => {
      try {
        const membersRef = collection(db, "users");
        const q = query(membersRef, orderBy("createdAt", "desc"), limit(12));

        const querySnapshot = await getDocs(q);
        const membersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Ensure all required fields have fallback values
          firstName: doc.data().firstName || "Anonymous",
          maritalStatus: doc.data().maritalStatus || "Not Specified",
          religion: doc.data().religion || "Not Specified",
          caste: doc.data().caste || "Not Specified",
          location: doc.data().location || "Location Unknown",
        }));

        setMembers(membersData);
        setRecentMembers(membersData);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch both stats and members data
    Promise.all([fetchStats(), fetchMembers()]);
  }, [timeframe]); // Re-fetch when timeframe changes

  // Update the fetchStats function when timeframe changes
  useEffect(() => {
    const updateStatsForTimeframe = async () => {
      try {
        const usersRef = collection(db, "users");

        // Calculate date based on selected timeframe
        const startDate = new Date();
        if (timeframe === "week") {
          startDate.setDate(startDate.getDate() - 7);
        } else if (timeframe === "month") {
          startDate.setDate(startDate.getDate() - 30);
        } else if (timeframe === "year") {
          startDate.setFullYear(startDate.getFullYear() - 1);
        }

        // Get new users in the selected timeframe
        const newUsersQuery = query(
          usersRef,
          where("createdAt", ">=", Timestamp.fromDate(startDate))
        );
        const newUsersSnapshot = await getDocs(newUsersQuery);

        // You could update trends here based on previous periods
        // This is a simplified example
        const trendsData = {
          total: Math.floor(Math.random() * 20) + 1, // Replace with actual calculation
          active: Math.floor(Math.random() * 15) + 1,
          premium: Math.floor(Math.random() * 10) + 1,
          featured: Math.floor(Math.random() * 8) + 1,
        };

        // You could set this to state if you want to display period-specific trends
      } catch (error) {
        console.error("Error updating stats for timeframe:", error);
      }
    };

    updateStatsForTimeframe();
  }, [timeframe]);

  // Enhanced Stats Card with better styling
  const StatsCard = ({ title, value, description, icon: Icon, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden group">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Card content */}
        <div className="relative p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
                {trend && (
                  <div
                    className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      trend.isPositive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {trend.isPositive ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {trend.value}%
                  </div>
                )}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 group-hover:from-pink-200 group-hover:to-purple-200 transition-colors duration-300">
              <Icon className="w-6 h-6 text-pink-600" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Bottom border gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </Card>
    </motion.div>
  );

  // Enhanced Recent Members List
  const MembersList = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence>
        {members.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative group hover:shadow-lg transition-all duration-300">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-50/0 to-purple-50/0 group-hover:from-pink-50/50 group-hover:to-purple-50/50 transition-all duration-300 rounded-lg" />

              {/* Card content */}
              <div className="relative p-4">
                <div className="flex items-center gap-4">
                  {/* Profile initial circle */}
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                      <span className="text-lg font-semibold text-white">
                        {member.firstName?.charAt(0) || "A"}
                      </span>
                    </div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  </div>

                  {/* Member details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {member.firstName}
                      </h3>
                      <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-pink-100 text-pink-700">
                        {member.maritalStatus}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 truncate">
                        {member.religion} • {member.caste}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {member.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover border effect */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-pink-100 rounded-lg transition-colors duration-300" />
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  // Display a loading state for the stats cards
  const LoadingStatsCard = ({ icon: Icon }) => (
    <Card className="relative overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-16 bg-gray-300 rounded animate-pulse"></div>
          </div>
          <div className="p-3 rounded-xl bg-gray-200">
            <Icon className="w-6 h-6 text-gray-400" />
          </div>
        </div>
        <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </Card>
  );

  return (
    <div className="p-6 space-y-8">
      {/* Header with gradient text */}
      <div className="flex items-center justify-between">
        <motion.h1
          className="text-3xl font-bold tracking-tight"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard Overview
          </span>
        </motion.h1>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <LoadingStatsCard icon={Users} />
            <LoadingStatsCard icon={UserCheck} />
            <LoadingStatsCard icon={CreditCard} />
            <LoadingStatsCard icon={Star} />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Members"
              value={stats.total}
              description="Total registered users"
              icon={Users}
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Active Members"
              value={stats.active}
              description="Active in last 30 days"
              icon={UserCheck}
              trend={{ value: 8, isPositive: true }}
            />
            <StatsCard
              title="Premium Members"
              value={stats.premium}
              description="Subscribed users"
              icon={CreditCard}
              trend={{ value: 5, isPositive: true }}
            />
            <StatsCard
              title="Featured Members"
              value={stats.featured}
              description="Highlighted profiles"
              icon={Star}
              trend={{ value: 3, isPositive: true }}
            />
          </>
        )}
      </div>

      {/* Recent Members Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Recent Members
            </span>
          </h2>
          <span className="text-sm text-muted-foreground">
            Last {recentMembers.length} registrations
          </span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 rounded-full border-4 border-pink-200 border-t-pink-600 animate-spin" />
          </div>
        ) : (
          <MembersList />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
