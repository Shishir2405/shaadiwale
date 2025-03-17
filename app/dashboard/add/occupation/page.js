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
import { Pencil, Plus, Loader2, Search, Building2 } from "lucide-react";
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

const OCCUPATIONS = [
  "Software Engineer",
  "Doctor",
  "Engineer",
  "Teacher",
  "Business Owner",
  "Manager",
  "Accountant",
  "Lawyer",
  "Architect",
  "Consultant",
  "Professor",
  "Government Employee",
  "Bank Employee",
  "Others",
];

const EMPLOYED_IN = [
  "private",
  "government",
  "business",
  "self-employed",
  "not-working",
];

const ANNUAL_INCOME_RANGES = [
  "0-2 LPA",
  "2-4 LPA",
  "4-7 LPA",
  "7-10 LPA",
  "10-15 LPA",
  "15-20 LPA",
  "20-25 LPA",
  "25-35 LPA",
  "35-50 LPA",
  "50+ LPA",
];

export default function OccupationManagement() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [editingUser, setEditingUser] = useState(null);
  const [editedData, setEditedData] = useState({
    occupation: "",
    employedIn: "",
    annualIncome: "",
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    firstName: "",
    occupation: "",
    employedIn: "",
    annualIncome: "",
    accountStatus: "pending",
  });
  const { toast } = useToast();


  useEffect(() => {


    const fetchUsers = () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy("occupation"), limit(recordsPerPage));

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
        where("occupation", ">=", value),
        where("occupation", "<=", value + "\uf8ff"),
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
    if (
      !newUserData.firstName ||
      !newUserData.occupation ||
      !newUserData.employedIn ||
      !newUserData.annualIncome
    ) {
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
        occupation: "",
        employedIn: "",
        annualIncome: "",
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
    if (
      !editedData.occupation ||
      !editedData.employedIn ||
      !editedData.annualIncome
    ) {
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
        occupation: editedData.occupation,
        employedIn: editedData.employedIn,
        annualIncome: editedData.annualIncome,
        updatedAt: new Date().toISOString(),
      });

      setUsers(
        users.map((user) =>
          user.id === userId
            ? {
                ...user,
                occupation: editedData.occupation,
                employedIn: editedData.employedIn,
                annualIncome: editedData.annualIncome,
              }
            : user
        )
      );

      setEditingUser(null);
      setEditedData({
        occupation: "",
        employedIn: "",
        annualIncome: "",
      });

      toast({
        title: "Success",
        description: "User occupation details updated successfully",
      });
    } catch (error) {
      console.error("Error updating occupation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user occupation details",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Occupation Management
          </h1>
          <p className="text-gray-500 mt-1">Manage user occupation details</p>
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
                value={newUserData.occupation}
                onValueChange={(value) =>
                  setNewUserData({
                    ...newUserData,
                    occupation: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select occupation" />
                </SelectTrigger>
                <SelectContent>
                  {OCCUPATIONS.map((occupation) => (
                    <SelectItem key={occupation} value={occupation}>
                      {occupation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={newUserData.employedIn}
                onValueChange={(value) =>
                  setNewUserData({
                    ...newUserData,
                    employedIn: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYED_IN.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={newUserData.annualIncome}
                onValueChange={(value) =>
                  setNewUserData({
                    ...newUserData,
                    annualIncome: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select annual income" />
                </SelectTrigger>
                <SelectContent>
                  {ANNUAL_INCOME_RANGES.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
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
            placeholder="Search by occupation..."
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
                Occupation
              </TableCell>
              <TableCell className="font-medium text-gray-700">
                Employed In
              </TableCell>
              <TableCell className="font-medium text-gray-700">
                Annual Income
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
                        value={editedData.occupation || user.occupation}
                        onValueChange={(value) =>
                          setEditedData({
                            ...editedData,
                            occupation: value,
                          })
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ANNUAL_INCOME_RANGES.map((range) => (
                            <SelectItem key={range} value={range}>
                              {range}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-gray-700">
                        {user.annualIncome || "N/A"}
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
                              occupation: "",
                              employedIn: "",
                              annualIncome: "",
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
                            occupation: user.occupation || "",
                            employedIn: user.employedIn || "",
                            annualIncome: user.annualIncome || "",
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
