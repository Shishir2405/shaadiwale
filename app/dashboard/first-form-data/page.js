"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Search, RefreshCcw,UserPlus } from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";

export default function FirstFormData() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState("10");
  const [hoveredRow, setHoveredRow] = useState(null); 
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = () => {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        orderBy("createdAt", "desc"),
        limit(parseInt(recordsPerPage))
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const usersData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUsers(usersData);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching users:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch users data",
          });
          setLoading(false);
        }
      );

      return unsubscribe;
    };

    fetchUsers();
  }, [recordsPerPage, toast]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(users.map((user) => user.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleDelete = async () => {
    try {
      await Promise.all(
        selectedItems.map((id) => deleteDoc(doc(db, "users", id)))
      );
      setSelectedItems([]);
      toast({
        title: "Success",
        description: "Selected users have been deleted",
      });
    } catch (error) {
      console.error("Error deleting users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete selected users",
      });
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    // Filter users locally for instant feedback
    const filtered = users.filter((user) =>
      Object.values(user).some((val) =>
        val.toString().toLowerCase().includes(value.toLowerCase())
      )
    );
    setUsers(filtered);
  };

  const handleCompleteRegistration = async (userId) => {
    try {
      await fetch("/api/complete-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      toast({
        title: "Success",
        description: "Registration completed successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete registration",
      });
    }
  };

  const filteredUsers = searchTerm
    ? users.filter((user) =>
        Object.values(user).some((val) =>
          val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : users;

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            First Form Data
          </h1>
          <p className="text-sm text-muted-foreground">
            Managing {users.length} user registrations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="destructive"
            disabled={selectedItems.length === 0}
            onClick={handleDelete}
            className="group"
          >
            <Trash2 className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
            Delete Selected
          </Button>
        </div>
      </motion.div>

      {/* Controls Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid gap-4 md:flex md:items-center md:justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Show:</span>
            <Select value={recordsPerPage} onValueChange={setRecordsPerPage}>
              <SelectTrigger className="w-[100px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="20">20 rows</SelectItem>
                <SelectItem value="50">50 rows</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            className="w-full md:w-[300px] pl-9 pr-4 h-9 focus-visible:ring-pink-500"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </motion.div>

      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableCell className="w-12">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedItems.length === filteredUsers.length}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
              </TableCell>
              <TableCell className="font-medium">ID</TableCell>
              <TableCell className="font-medium">First Name</TableCell>
              <TableCell className="font-medium">Last Name</TableCell>
              <TableCell className="font-medium">Email</TableCell>
              <TableCell className="font-medium">Mobile</TableCell>
              <TableCell className="font-medium">Gender</TableCell>
              <TableCell className="font-medium">Date of Birth</TableCell>
              <TableCell className="font-medium">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32">
                  <div className="flex items-center justify-center">
                    <RefreshCcw className="w-6 h-6 animate-spin text-pink-600" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Search className="w-8 h-8 mb-2 stroke-1" />
                    <p>No users found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user, index) => (
                <TableRow
                  key={user.id}
                  className={
                    hoveredRow === user.id
                      ? "bg-gray-50 transition-colors duration-200"
                      : "bg-white transition-colors duration-200"
                  }
                  onMouseEnter={() => setHoveredRow(user.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <TableCell className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(user.id)}
                      onChange={() => handleSelectOne(user.id)}
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {user.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>{user.firstName}</TableCell>
                  <TableCell>{user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.mobile}</TableCell>
                  <TableCell>
                    <span
                      className={
                        user.gender === "Male"
                          ? "bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                          : "bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs font-medium"
                      }
                    >
                      {user.gender}
                    </span>
                  </TableCell>
                  <TableCell>{user.dateOfBirth}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCompleteRegistration(user.id)}
                      className="hover:text-pink-600 hover:bg-pink-50"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Complete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer Section */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Showing {filteredUsers.length} of {users.length} entries
        </span>
        <div className="flex items-center gap-2">
          {selectedItems.length > 0 && (
            <span className="text-pink-600 font-medium">
              {selectedItems.length} items selected
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
