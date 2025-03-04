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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Plus, ThumbsUp, ThumbsDown, Trash2, Loader2, Search } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  updateDoc,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  where,
  limit,
  orderBy,
} from "firebase/firestore";

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Puducherry",
  "Chandigarh",
  "Ladakh",
  "Jammu & Kashmir",
];

export default function StateManagement() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [editingUser, setEditingUser] = useState(null);
  const [editedState, setEditedState] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStateData, setNewStateData] = useState({
    firstName: "",
    residingState: "",
    accountStatus: "pending",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchUsers = () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy("residingState"), limit(recordsPerPage));

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const userData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setUsers(userData);
            setDataLoading(false);
          },
          (error) => {
            console.error("Error fetching users:", error);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to fetch user data",
            });
            setDataLoading(false);
          }
        );

        return unsubscribe;
      } catch (error) {
        setDataLoading(false);
      }
    };

    fetchUsers();
  }, [recordsPerPage, toast, user]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.trim()) {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("residingState", ">=", value),
        where("residingState", "<=", value + "\uf8ff"),
        limit(recordsPerPage)
      );

      onSnapshot(q, (snapshot) => {
        const userData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userData);
      });
    }
  };

  const handleAdd = async () => {
    if (!newStateData.firstName || !newStateData.residingState) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    try {
      await addDoc(collection(db, "users"), {
        ...newStateData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setIsAddDialogOpen(false);
      setNewStateData({ firstName: "", residingState: "", accountStatus: "pending" });
      toast({
        title: "Success",
        description: "New state entry added successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add new entry",
      });
    }
  };

  const handleUpdateState = async (userId, newState) => {
    if (!newState) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a state",
      });
      return;
    }

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        residingState: newState,
        updatedAt: new Date().toISOString(),
      });

      setUsers(
        users.map((user) =>
          user.id === userId 
            ? { ...user, residingState: newState } 
            : user
        )
      );

      setEditingUser(null);
      setEditedState("");

      toast({
        title: "Success",
        description: "User state updated successfully",
      });
    } catch (error) {
      console.error("Error updating state:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user state",
      });
    }
  };

  const handleApprove = async () => {
    try {
      await Promise.all(
        selectedItems.map((id) =>
          updateDoc(doc(db, "users", id), {
            accountStatus: "approved",
            updatedAt: new Date().toISOString(),
          })
        )
      );
      setSelectedItems([]);
      toast({
        title: "Success",
        description: "Selected entries have been approved",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve entries",
      });
    }
  };

  const handleUnapprove = async () => {
    try {
      await Promise.all(
        selectedItems.map((id) =>
          updateDoc(doc(db, "users", id), {
            accountStatus: "pending",
            updatedAt: new Date().toISOString(),
          })
        )
      );
      setSelectedItems([]);
      toast({
        title: "Success",
        description: "Selected entries have been set to pending",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update entries",
      });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete the selected entries?")) {
      return;
    }

    try {
      await Promise.all(
        selectedItems.map((id) => deleteDoc(doc(db, "users", id)))
      );
      setSelectedItems([]);
      toast({
        title: "Success",
        description: "Selected entries have been deleted",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete entries",
      });
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">State Management</h1>
          <p className="text-gray-500 mt-1">Manage and approve user states</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Entry</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Enter name"
                  value={newStateData.firstName}
                  onChange={(e) =>
                    setNewStateData({
                      ...newStateData,
                      firstName: e.target.value,
                    })
                  }
                />
                <Select
                  value={newStateData.residingState}
                  onValueChange={(value) =>
                    setNewStateData({
                      ...newStateData,
                      residingState: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAdd}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                >
                  Add Entry
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
            disabled={selectedItems.length === 0}
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button
            variant="outline"
            className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            disabled={selectedItems.length === 0}
            onClick={handleApprove}
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            Approve
          </Button>
          <Button
            variant="outline"
            className="border-amber-200 text-amber-600 hover:bg-amber-50"
            disabled={selectedItems.length === 0}
            onClick={handleUnapprove}
          >
            <ThumbsDown className="h-4 w-4 mr-2" />
            Set Pending
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Records Per Page:</span>
            <Select
              value={recordsPerPage.toString()}
              onValueChange={(value) => setRecordsPerPage(Number(value))}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              className="pl-10 w-64"
              placeholder="Search by state..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableCell className="w-12">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(users.map((user) => user.id));
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                  checked={selectedItems.length === users.length && users.length > 0}
                />
              </TableCell>
              <TableCell className="font-medium text-gray-700">Name</TableCell>
              <TableCell className="font-medium text-gray-700">State</TableCell>
              <TableCell className="font-medium text-gray-700">Status</TableCell>
              <TableCell className="font-medium text-gray-700">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-pink-500" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No entries found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell>
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      checked={selectedItems.includes(user.id)}
                      onChange={() => {
                        if (selectedItems.includes(user.id)) {
                          setSelectedItems(
                            selectedItems.filter((id) => id !== user.id)
                          );
                        } else {
                          setSelectedItems([...selectedItems, user.id]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {user.firstName || "N/A"}
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <Select
                        value={editedState || user.residingState}
                        onValueChange={setEditedState}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-gray-700">
                        {user.residingState || "N/A"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.accountStatus === "approved" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ThumbsUp className="h-3 w-3 mr-1" /> 
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <ThumbsDown className="h-3 w-3 mr-1" /> 
                        Pending
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateState(user.id, editedState)}
                          className="bg-pink-600 hover:bg-pink-700 text-white"
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingUser(null);
                            setEditedState("");
                          }}
                          className="border-gray-200 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingUser(user.id);
                          setEditedState(user.residingState || "");
                        }}
                        className="text-gray-600 hover:text-pink-600 hover:bg-pink-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}