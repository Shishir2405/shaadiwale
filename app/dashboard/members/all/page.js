"use client";

import React, { useState, useEffect } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  
  Heart,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Crown,
  Check,
  ChevronRight,
  Star,
} from "lucide-react";

const MemberCard = ({
  member,
  onAction,
  actionLabel,
  actionIcon: ActionIcon,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
  >
    <div className="p-4 flex items-start gap-4">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex-shrink-0">
        <img
          src={member.profileImageUrl || "/placeholder-avatar.png"}
          alt={member.name}
          className="w-full h-full rounded-full object-cover"
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">{member.name}</h3>
          <div className="flex items-center gap-2">
            {member.isPaid && (
              <span className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full">
                Paid
              </span>
            )}
            {member.isFeatured && <Crown className="w-4 h-4 text-yellow-500" />}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {member.age} years
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {member.location}
          </div>
          <div className="flex items-center gap-1">
            <Mail className="w-4 h-4" />
            {member.email}
          </div>
          <div className="flex items-center gap-1">
            <Phone className="w-4 h-4" />
            {member.phone}
          </div>
        </div>
      </div>
    </div>
    <div className="px-4 pb-4">
      <Button
        onClick={() => onAction(member.id)}
        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90"
      >
        <ActionIcon className="w-4 h-4 mr-2" />
        {actionLabel}
      </Button>
    </div>
  </motion.div>
);

const FilterBar = ({ filters, setFilters }) => (
  <Card className="mb-6 bg-white/50 backdrop-blur-sm">
    <CardContent className="p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div>
          <Label className="text-sm text-gray-600">Search</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="pl-9 bg-white/50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
              placeholder="Search by name, ID, location..."
            />
          </div>
        </div>

        <div>
          <Label className="text-sm text-gray-600">Age Range</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              type="number"
              value={filters.ageFrom}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, ageFrom: e.target.value }))
              }
              className="bg-white/50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
              placeholder="From"
            />
            <span className="text-gray-400">-</span>
            <Input
              type="number"
              value={filters.ageTo}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, ageTo: e.target.value }))
              }
              className="bg-white/50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
              placeholder="To"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm text-gray-600">Location</Label>
          <Input
            value={filters.location}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, location: e.target.value }))
            }
            className="mt-1 bg-white/50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
            placeholder="Enter location..."
          />
        </div>

        <div>
          <Label className="text-sm text-gray-600">Sort By</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, sortBy: value }))
            }
          >
            <SelectTrigger className="mt-1 bg-white/50 border-gray-200 hover:bg-white/80">
              <SelectValue placeholder="Choose sorting" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="nameAsc">Name (A-Z)</SelectItem>
              <SelectItem value="nameDesc">Name (Z-A)</SelectItem>
              <SelectItem value="ageAsc">Age (Youngest)</SelectItem>
              <SelectItem value="ageDesc">Age (Oldest)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>
    </CardContent>
  </Card>
);

const StatsCard = ({
  title,
  value,
  icon: Icon,
  bgColor = "bg-pink-50",
  textColor = "text-pink-600",
}) => (
  <Card className={`${bgColor} border-0`}>
    <CardContent className="p-4">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg ${bgColor} ${textColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const AllMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    ageFrom: "",
    ageTo: "",
    location: "",
    sortBy: "newest",
  });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersRef = collection(db, "users");
        const q = query(membersRef);
        const snapshot = await getDocs(q);
        const membersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMembers(membersList);
      } catch (error) {
        console.error("Error fetching members:", error);
        toast.error("Failed to load members");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Filter and sort function
  const getFilteredAndSortedMembers = () => {
    let filtered = [...members];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (member) =>
          member.name?.toLowerCase().includes(searchTerm) ||
          member.email?.toLowerCase().includes(searchTerm) ||
          member.location?.toLowerCase().includes(searchTerm) ||
          member.matriId?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply age filter
    if (filters.ageFrom) {
      filtered = filtered.filter(
        (member) => Number(member.age) >= Number(filters.ageFrom)
      );
    }
    if (filters.ageTo) {
      filtered = filtered.filter(
        (member) => Number(member.age) <= Number(filters.ageTo)
      );
    }

    // Apply location filter
    if (filters.location) {
      const locationTerm = filters.location.toLowerCase();
      filtered = filtered.filter((member) =>
        member.location?.toLowerCase().includes(locationTerm)
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "newest":
        filtered.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        );
        break;
      case "nameAsc":
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "nameDesc":
        filtered.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "ageAsc":
        filtered.sort((a, b) => Number(a.age || 0) - Number(b.age || 0));
        break;
      case "ageDesc":
        filtered.sort((a, b) => Number(b.age || 0) - Number(a.age || 0));
        break;
      default:
        break;
    }

    return filtered;
  };

  const handleAction = async (action, memberId) => {
    switch (action) {
      case "message":
        toast.success("Opening message dialog...");
        // Implement message functionality
        break;
      case "interest":
        toast.success("Showing interest...");
        // Implement interest functionality
        break;
      case "view":
        // Implement view profile functionality
        window.location.href = `/dashboard/members/${memberId}`;
        break;
      default:
        break;
    }
  };

  const filteredMembers = getFilteredAndSortedMembers();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-2xl font-semibold text-gray-900">All Members</h1>
          <p className="text-gray-600 mt-1">
            Browse and manage member profiles
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Total Members"
          value={members.length}
          icon={Users}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        <StatsCard
          title="Premium Members"
          value={members.filter((m) => m.isPaid).length}
          icon={Crown}
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
        <StatsCard
          title="Featured Profiles"
          value={members.filter((m) => m.isFeatured).length}
          icon={Star}
          bgColor="bg-yellow-50"
          textColor="text-yellow-600"
        />
      </div>

      <FilterBar filters={filters} setFilters={setFilters} />

      <AnimatePresence>
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center h-64"
          >
            <div className="w-16 h-16 border-4 border-gray-200 border-t-pink-500 rounded-full animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            {getFilteredAndSortedMembers().map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onAction={handleAction}
                actionIcon={Users}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllMembers;
