"use client"

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
import { Pencil, Plus, Loader2, Search, GraduationCap } from "lucide-react";
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

const HIGHEST_EDUCATION = [
  "10th",
  "12th",
  "Diploma",
  "B.Tech",
  "B.E.",
  "B.Sc",
  "B.Com",
  "BBA",
  "BCA",
  "M.Tech",
  "M.E.",
  "M.Sc",
  "M.Com",
  "MBA",
  "MCA",
  "Ph.D",
  "Other"
];

const ADDITIONAL_DEGREES = [
  "None",
  "Post Graduate Diploma",
  "Additional Bachelor's",
  "Additional Master's",
  "Professional Certification",
  "Technical Certification",
  "Other"
];

export default function EducationManagement() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [editingUser, setEditingUser] = useState(null);
  const [editedData, setEditedData] = useState({
    highestEducation: "",
    additionalDegree: "",
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    firstName: "",
    highestEducation: "",
    additionalDegree: "",
    accountStatus: "pending"
  });
  const { toast } = useToast();



  useEffect(() => {


    const fetchUsers = () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy("highestEducation"), limit(recordsPerPage));

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
        where("highestEducation", ">=", value),
        where("highestEducation", "<=", value + "\uf8ff"),
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
    if (!newUserData.firstName || !newUserData.highestEducation) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
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
        highestEducation: "",
        additionalDegree: "",
        accountStatus: "pending"
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
    if (!editedData.highestEducation) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        highestEducation: editedData.highestEducation,
        additionalDegree: editedData.additionalDegree,
        updatedAt: new Date().toISOString(),
      });

      setUsers(
        users.map((user) =>
          user.id === userId 
            ? { 
                ...user, 
                highestEducation: editedData.highestEducation,
                additionalDegree: editedData.additionalDegree
              } 
            : user
        )
      );

      setEditingUser(null);
      setEditedData({
        highestEducation: "",
        additionalDegree: ""
      });

      toast({
        title: "Success",
        description: "User education details updated successfully",
      });
    } catch (error) {
      console.error("Error updating education:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user education details",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Education Management</h1>
          <p className="text-gray-500 mt-1">Manage user education details</p>
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
                value={newUserData.highestEducation}
                onValueChange={(value) =>
                  setNewUserData({
                    ...newUserData,
                    highestEducation: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select highest education" />
                </SelectTrigger>
                <SelectContent>
                  {HIGHEST_EDUCATION.map((education) => (
                    <SelectItem key={education} value={education}>
                      {education}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={newUserData.additionalDegree}
                onValueChange={(value) =>
                  setNewUserData({
                    ...newUserData,
                    additionalDegree: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select additional degree" />
                </SelectTrigger>
                <SelectContent>
                  {ADDITIONAL_DEGREES.map((degree) => (
                    <SelectItem key={degree} value={degree}>
                      {degree}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            placeholder="Search by education..."
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
              <TableCell className="font-medium text-gray-700">Highest Education</TableCell>
              <TableCell className="font-medium text-gray-700">Additional Degree</TableCell>
              <TableCell className="font-medium text-gray-700">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-pink-500" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
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
                        value={editedData.highestEducation || user.highestEducation}
                        onValueChange={(value) =>
                          setEditedData({
                            ...editedData,
                            highestEducation: value,
                          })
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HIGHEST_EDUCATION.map((education) => (
                            <SelectItem key={education} value={education}>
                              {education}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-gray-700">
                        {user.highestEducation || "N/A"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <Select
                        value={editedData.additionalDegree || user.additionalDegree}
                        onValueChange={(value) =>
                          setEditedData({
                            ...editedData,
                            additionalDegree: value,
                          })
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ADDITIONAL_DEGREES.map((degree) => (
                            <SelectItem key={degree} value={degree}>
                              {degree}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-gray-700">
                        {user.additionalDegree || "N/A"}
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
                              highestEducation: "",
                              additionalDegree: ""
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
                            highestEducation: user.highestEducation || "",
                            additionalDegree: user.additionalDegree || ""
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