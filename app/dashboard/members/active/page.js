"use client";

import React, { useState, useEffect } from 'react';
import { doc, collection, getDocs, updateDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Search,
  Eye,
  Edit,
  Clock,
  UserCheck,
  BadgeCheck,
  Calendar,
  Users
} from 'lucide-react';

const MemberCard = ({ member, onAdminApprove }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    transition={{ duration: 0.2 }}
  >
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="p-6">
        <div className="flex gap-4">
          {/* Profile Image */}
          <div className="relative">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
              <img
                src={member.photoURL || "/placeholder-avatar.png"}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>
            {member.lastLoginAt && (
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
                Active
              </div>
            )}
          </div>

          {/* Member Info */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {member.name}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  ID: {member.matriId}
                  {member.adminApproved && (
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <BadgeCheck className="w-4 h-4" />
                      Admin Approved
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Age:</span> {member.age} Years
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Religion:</span> {member.religion}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Education:</span> {member.education}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Marital Status:</span> {member.maritalStatus}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Location:</span> {member.country}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Last Active:</span> {
                    member.lastLoginAt 
                      ? new Date(member.lastLoginAt).toLocaleDateString()
                      : 'Never'
                  }
                </p>
              </div>
            </div>

            {/* Status Tags */}
            <div className="mt-3 flex gap-2">
              {member.status === "approved" && (
                <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full">
                  Profile Approved
                </span>
              )}
              {member.adminApproved && (
                <span className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded-full">
                  Admin Approved
                </span>
              )}
              {member.lastLoginAt && new Date(member.lastLoginAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
                <span className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded-full">
                  Active Today
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = `/dashboard/members/${member.id}`}
              className="text-gray-600 hover:text-pink-600"
            >
              <Eye className="w-4 h-4 mr-1" />
              View Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = `/dashboard/members/edit/${member.id}`}
              className="text-gray-600 hover:text-pink-600"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit Profile
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {/* Admin Approval Button */}
            {!member.adminApproved && member.status === "approved" && (
              <Button
                size="sm"
                onClick={() => onAdminApprove(member.id)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90"
              >
                <BadgeCheck className="w-4 h-4 mr-1" />
                Admin Approve
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const StatsCard = ({ title, value, icon: Icon, color = "text-pink-600" }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
    <div className={`${color} bg-opacity-10 w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
      <Icon className="w-6 h-6" />
    </div>
    <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
    <p className="text-sm text-gray-600">{title}</p>
  </div>
);

const RecentMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const membersRef = collection(db, "users");
      const q = query(
        membersRef,
        where("lastLoginAt", ">=", sevenDaysAgo.toISOString())
      );
      
      const snapshot = await getDocs(q);
      const membersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setMembers(membersList);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminApprove = async (memberId) => {
    try {
      const memberRef = doc(db, "users", memberId);
      await updateDoc(memberRef, {
        adminApproved: true,
        adminApprovedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      setMembers(prev => prev.map(member => 
        member.id === memberId 
          ? { 
              ...member, 
              adminApproved: true, 
              adminApprovedAt: new Date().toISOString() 
            }
          : member
      ));
      
      toast.success('Admin approval successful');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to admin approve member');
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.matriId?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'approved') return matchesSearch && member.adminApproved;
    if (filter === 'pending') return matchesSearch && !member.adminApproved;
    return matchesSearch;
  });

  const stats = {
    total: members.length,
    active24h: members.filter(m => {
      const lastLogin = new Date(m.lastLoginAt);
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return lastLogin > yesterday;
    }).length,
    pending: members.filter(m => !m.adminApproved).length
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Recent Members
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage members active in the last 7 days
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Total Recent Members"
          value={stats.total}
          icon={Users}
          color="text-blue-600"
        />
        <StatsCard
          title="Active in 24h"
          value={stats.active24h}
          icon={Clock}
          color="text-green-600"
        />
        <StatsCard
          title="Pending Approval"
          value={stats.pending}
          icon={Calendar}
          color="text-pink-600"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : ''}
            >
              All
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
              className={filter === 'pending' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : ''}
            >
              Pending
            </Button>
            <Button
              variant={filter === 'approved' ? 'default' : 'outline'}
              onClick={() => setFilter('approved')}
              className={filter === 'approved' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : ''}
            >
              Approved
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center h-64"
          >
            <div className="w-16 h-16 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-6"
          >
            {filteredMembers.map(member => (
              <MemberCard
                key={member.id}
                member={member}
                onAdminApprove={handleAdminApprove}
              />
            ))}
            {filteredMembers.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                No members found matching your criteria
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecentMembers;