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
import { Pencil, Plus, Loader2, Search, Shield } from "lucide-react";
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

const DOSH_OPTIONS = [
  { label: "No Dosh", value: "no" },
  { label: "Mangal Dosh", value: "mangal" },
  { label: "Kaal Sarp Dosh", value: "kaalsarp" },
  { label: "Rahu Dosh", value: "rahu" },
  { label: "Ketu Dosh", value: "ketu" },
  { label: "Shani Dosh", value: "shani" },
  { label: "Nadi Dosh", value: "nadi" },
];

const DOSH_LEVELS = [
  { label: "None", value: "none" },
  { label: "Mild", value: "mild" },
  { label: "Moderate", value: "moderate" },
  { label: "Severe", value: "severe" },
];

export default function DoshManagement() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [editingUser, setEditingUser] = useState(null);
  const [editedData, setEditedData] = useState({
    haveDosh: "",
    doshType: "",
    doshLevel: "",
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    firstName: "",
    haveDosh: "no",
    doshType: "",
    doshLevel: "",
    accountStatus: "pending",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchUsers = () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy("firstName"), limit(recordsPerPage));

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
        where("firstName", ">=", value),
        where("firstName", "<=", value + "\uf8ff"),
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
    if (!newUserData.firstName || !newUserData.haveDosh) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    // Validate dosh type and level if haveDosh is "yes"
    if (
      newUserData.haveDosh === "yes" &&
      (!newUserData.doshType || !newUserData.doshLevel)
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select dosh type and level",
      });
      return;
    }

    try {
      await addDoc(collection(db, "users"), {
        ...newUserData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setIsAddDialogOpen(false);
      setNewUserData({
        firstName: "",
        haveDosh: "no",
        doshType: "",
        doshLevel: "",
        accountStatus: "pending",
      });
      toast({
        title: "Success",
        description: "New user added successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add new user",
      });
    }
  };

  const handleUpdate = async (userId) => {
    if (!editedData.haveDosh) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please specify if user has dosh",
      });
      return;
    }

    // Validate dosh type and level if haveDosh is "yes"
    if (
      editedData.haveDosh === "yes" &&
      (!editedData.doshType || !editedData.doshLevel)
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select dosh type and level",
      });
      return;
    }

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        haveDosh: editedData.haveDosh,
        doshType: editedData.doshType,
        doshLevel: editedData.doshLevel,
        updatedAt: new Date().toISOString(),
      });

      setUsers(
        users.map((user) =>
          user.id === userId
            ? {
                ...user,
                haveDosh: editedData.haveDosh,
                doshType: editedData.doshType,
                doshLevel: editedData.doshLevel,
              }
            : user
        )
      );

      setEditingUser(null);
      setEditedData({
        haveDosh: "",
        doshType: "",
        doshLevel: "",
      });

      toast({
        title: "Success",
        description: "User dosh details updated successfully",
      });
    } catch (error) {
      console.error("Error updating dosh:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user dosh details",
      });
    }
  };

  const getDoshLabel = (type) => {
    const dosh = DOSH_OPTIONS.find((d) => d.value === type);
    return dosh ? dosh.label : "N/A";
  };

  const getDoshLevelLabel = (level) => {
    const doshLevel = DOSH_LEVELS.find((l) => l.value === level);
    return doshLevel ? doshLevel.label : "N/A";
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dosh Management</h1>
          <p className="text-gray-500 mt-1">Manage user dosh details</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-pink-600 hover:bg-pink-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Enter name"
                value={newUserData.firstName}
                onChange={(e) =>
                  setNewUserData({
                    ...newUserData,
                    firstName: e.target.value,
                  })
                }
              />
              <Select
                value={newUserData.haveDosh}
                onValueChange={(value) =>
                  setNewUserData({
                    ...newUserData,
                    haveDosh: value,
                    doshType: value === "no" ? "" : newUserData.doshType,
                    doshLevel: value === "no" ? "" : newUserData.doshLevel,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Has Dosh?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {newUserData.haveDosh === "yes" && (
                <>
                  <Select
                    value={newUserData.doshType}
                    onValueChange={(value) =>
                      setNewUserData({
                        ...newUserData,
                        doshType: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select dosh type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOSH_OPTIONS.map((dosh) => (
                        <SelectItem key={dosh.value} value={dosh.value}>
                          {dosh.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={newUserData.doshLevel}
                    onValueChange={(value) =>
                      setNewUserData({
                        ...newUserData,
                        doshLevel: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select dosh level" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOSH_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
              <Button
                onClick={handleAdd}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white"
              >
                Add User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10 w-64"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableCell className="font-medium text-gray-700">Name</TableCell>
              <TableCell className="font-medium text-gray-700">
                Has Dosh
              </TableCell>
              <TableCell className="font-medium text-gray-700">
                Dosh Type
              </TableCell>
              <TableCell className="font-medium text-gray-700">
                Dosh Level
              </TableCell>
              <TableCell className="font-medium text-gray-700">
                Actions
              </TableCell>
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
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  No entries found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">
                    {user.firstName || "N/A"}
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <Select
                        value={editedData.haveDosh || user.haveDosh}
                        onValueChange={(value) =>
                          setEditedData({
                            ...editedData,
                            haveDosh: value,
                            doshType: value === "no" ? "" : editedData.doshType,
                            doshLevel:
                              value === "no" ? "" : editedData.doshLevel,
                          })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-gray-700">
                        {user.haveDosh === "yes" ? "Yes" : "No"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id &&
                    editedData.haveDosh === "yes" ? (
                      <Select
                        value={editedData.doshType || user.doshType}
                        onValueChange={(value) =>
                          setEditedData({
                            ...editedData,
                            doshType: value,
                          })
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DOSH_OPTIONS.map((dosh) => (
                            <SelectItem key={dosh.value} value={dosh.value}>
                              {dosh.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-gray-700">
                        {user.haveDosh === "yes"
                          ? getDoshLabel(user.doshType)
                          : "N/A"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id &&
                    editedData.haveDosh === "yes" ? (
                      <Select
                        value={editedData.doshLevel || user.doshLevel}
                        onValueChange={(value) =>
                          setEditedData({
                            ...editedData,
                            doshLevel: value,
                          })
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DOSH_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-gray-700">
                        {user.haveDosh === "yes"
                          ? getDoshLevelLabel(user.doshLevel)
                          : "N/A"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdate(user.id)}
                          className="bg-pink-600 hover:bg-pink-700 text-white"
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingUser(null);
                            setEditedData({
                              haveDosh: "",
                              doshType: "",
                              doshLevel: "",
                            });
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
                          setEditedData({
                            haveDosh: user.haveDosh || "no",
                            doshType: user.doshType || "",
                            doshLevel: user.doshLevel || "",
                          });
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
