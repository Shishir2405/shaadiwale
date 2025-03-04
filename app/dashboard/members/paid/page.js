"use client";

import React, { useState, useEffect } from 'react';
import { doc, collection, getDocs, updateDoc, query, where, Timestamp, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
  Wallet,
  Calendar,
  Users,
  BadgeIndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Loader2,
  CircleDollarSign,
  CalendarDays
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

// Payment Dialog Component
const PaymentDialog = ({ isOpen, onClose, onConfirm, member }) => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('3'); // Default 3 months
  const [paymentMode, setPaymentMode] = useState('online');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirm({
        amount: parseFloat(amount),
        duration: parseInt(duration),
        paymentMode,
        memberId: member.id
      });
      onClose();
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Payment Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Duration (months)</label>
            <select
              className="w-full rounded-md border border-gray-300 p-2"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Payment Mode</label>
            <select
              className="w-full rounded-md border border-gray-300 p-2"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
            >
              <option value="online">Online</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CircleDollarSign className="w-4 h-4 mr-2" />
                  Confirm Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const PaidMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  useEffect(() => {
    fetchMembers();
    ensureDefaultPaidStatus();
  }, []);

  // Function to ensure all users have default isPaid status
  const ensureDefaultPaidStatus = async () => {
    try {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      const batch = writeBatch(db);
      let updateCount = 0;

      snapshot.docs.forEach(doc => {
        const userData = doc.data();
        if (userData.isPaid === undefined) {
          batch.update(doc.ref, {
            isPaid: false,
            updatedAt: new Date().toISOString()
          });
          updateCount++;
        }
      });

      if (updateCount > 0) {
        await batch.commit();
        console.log(`Updated ${updateCount} users with default paid status`);
      }
    } catch (error) {
      console.error('Error ensuring default paid status:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const membersRef = collection(db, "users");
      const snapshot = await getDocs(membersRef);
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

  const handlePayment = async (paymentDetails) => {
    try {
      const { memberId, amount, duration, paymentMode } = paymentDetails;
      const memberRef = doc(db, "users", memberId);
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + duration);

      await updateDoc(memberRef, {
        isPaid: true,
        paidAt: new Date().toISOString(),
        paymentDetails: {
          amount,
          duration,
          paymentMode,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          transactionDate: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      });

      setMembers(prev => prev.map(member => 
        member.id === memberId
          ? {
              ...member,
              isPaid: true,
              paidAt: new Date().toISOString(),
              paymentDetails: {
                amount,
                duration,
                paymentMode,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                transactionDate: new Date().toISOString()
              }
            }
          : member
      ));

      toast.success('Payment processed successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to process payment');
      throw error;
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.matriId?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'paid') return matchesSearch && member.isPaid;
    if (filter === 'unpaid') return matchesSearch && !member.isPaid;
    return matchesSearch;
  });

  const stats = {
    total: members.length,
    paid: members.filter(m => m.isPaid).length,
    unpaid: members.filter(m => !m.isPaid).length
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Payment Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage member payments and subscriptions
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
          title="Paid Members"
          value={stats.paid}
          icon={BadgeIndianRupee}
          color="text-green-600"
        />
        <StatsCard
          title="Unpaid Members"
          value={stats.unpaid}
          icon={Wallet}
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
              variant={filter === 'paid' ? 'default' : 'outline'}
              onClick={() => setFilter('paid')}
              className={filter === 'paid' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : ''}
            >
              Paid
            </Button>
            <Button
              variant={filter === 'unpaid' ? 'default' : 'outline'}
              onClick={() => setFilter('unpaid')}
              className={filter === 'unpaid' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : ''}
            >
              Unpaid
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
                    <TableHead>Payment Details</TableHead>
                    <TableHead>Expiry Date</TableHead>
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
                        {member.isPaid ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-400">
                            <XCircle className="w-4 h-4" />
                            Unpaid
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.paymentDetails ? (
                          <div>
                            <div className="text-sm font-medium">
                              ₹{member.paymentDetails.amount}
                            </div>
                            <div className="text-xs text-gray-500">
                              {member.paymentDetails.duration} months
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No payment</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.paymentDetails?.endDate ? (
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              {new Date(member.paymentDetails.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedMember(member);
                            setShowPaymentDialog(true);
                          }}
                          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90"
                        >
                          {member.isPaid ? (
                            <>
                              <Plus className="w-4 h-4 mr-1" />
                              Extend
                            </>
                          ) : (
                            <>
                              <CircleDollarSign className="w-4 h-4 mr-1" />
                              Add Payment
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

      {/* Payment Dialog */}
      <PaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => {
          setShowPaymentDialog(false);
          setSelectedMember(null);
        }}
        onConfirm={handlePayment}
        member={selectedMember}
      />
    </div>
  );
};

export default PaidMembers;