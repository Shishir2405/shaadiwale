"use client";

import React, { useState, useEffect } from 'react';
import { doc, collection, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Search,
  Star,
  Users,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Filter
} from 'lucide-react';

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color = "text-pink-600" }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
    <div className={`${color} bg-opacity-10 w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
      <Icon className="w-6 h-6" />
    </div>
    <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
    <p className="text-sm text-gray-600">{title}</p>
  </div>
);

const FeaturedProfiles = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const membersRef = collection(db, "users");
      const snapshot = await getDocs(membersRef);
      const membersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isFeatured: doc.data().isFeatured || false
      }));
      setMembers(membersList);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (memberId, currentStatus) => {
    setProcessingId(memberId);
    try {
      const memberRef = doc(db, "users", memberId);
      const newStatus = !currentStatus;
      
      await updateDoc(memberRef, {
        isFeatured: newStatus,
        featuredAt: newStatus ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString()
      });

      setMembers(prev => prev.map(member => 
        member.id === memberId 
          ? { 
              ...member, 
              isFeatured: newStatus,
              featuredAt: newStatus ? new Date().toISOString() : null 
            }
          : member
      ));

      toast.success(newStatus ? 'Profile marked as featured' : 'Profile removed from featured');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update featured status');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.matriId?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'featured') return matchesSearch && member.isFeatured;
    if (filter === 'regular') return matchesSearch && !member.isFeatured;
    return matchesSearch;
  });

  const stats = {
    total: members.length,
    featured: members.filter(m => m.isFeatured).length,
    regular: members.filter(m => !m.isFeatured).length
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Featured Profiles
          </h1>
          <p className="text-gray-600 mt-1">
            Manage featured profiles and spotlight members
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Total Members"
          value={stats.total}
          icon={Users}
          color="text-blue-600"
        />
        <StatsCard
          title="Featured Profiles"
          value={stats.featured}
          icon={Star}
          color="text-yellow-600"
        />
        <StatsCard
          title="Regular Profiles"
          value={stats.regular}
          icon={Users}
          color="text-gray-600"
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
              variant={filter === 'featured' ? 'default' : 'outline'}
              onClick={() => setFilter('featured')}
              className={filter === 'featured' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : ''}
            >
              Featured
            </Button>
            <Button
              variant={filter === 'regular' ? 'default' : 'outline'}
              onClick={() => setFilter('regular')}
              className={filter === 'regular' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : ''}
            >
              Regular
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
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured Since</TableHead>
                    <TableHead>Profile Info</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
                            <img
                              src={member.photoURL || "/placeholder-avatar.png"}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.matriId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.isFeatured ? (
                          <span className="inline-flex items-center gap-1 text-yellow-600">
                            <Star className="w-4 h-4 fill-current" />
                            Featured
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-400">
                            <Users className="w-4 h-4" />
                            Regular
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.featuredAt ? (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              {new Date(member.featuredAt).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{member.age} Years • {member.religion}</div>
                          <div className="text-gray-500">{member.city}, {member.country}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => toggleFeatured(member.id, member.isFeatured)}
                          disabled={processingId === member.id}
                          className={
                            member.isFeatured
                              ? "bg-yellow-500 text-white hover:bg-yellow-600"
                              : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90"
                          }
                        >
                          {processingId === member.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : member.isFeatured ? (
                            <>
                              <XCircle className="w-4 h-4 mr-1" />
                              Remove Featured
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-1" />
                              Mark Featured
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredMembers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No members found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeaturedProfiles;