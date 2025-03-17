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
import { Pencil, Plus, Loader2, Search, Star } from "lucide-react";
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

const STARS = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
];

const RAASIS = [
  "Mesha (Aries)",
  "Vrishabha (Taurus)",
  "Mithuna (Gemini)",
  "Karka (Cancer)",
  "Simha (Leo)",
  "Kanya (Virgo)",
  "Tula (Libra)",
  "Vrishchika (Scorpio)",
  "Dhanus (Sagittarius)",
  "Makara (Capricorn)",
  "Kumbha (Aquarius)",
  "Meena (Pisces)",
];

export default function StarManagement() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [editingUser, setEditingUser] = useState(null);
  const [editedData, setEditedData] = useState({
    star: "",
    raasiMoonsign: "",
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    firstName: "",
    star: "",
    raasiMoonsign: "",
    accountStatus: "pending",
  });
  const { toast } = useToast();


  useEffect(() => {

    const fetchUsers = () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy("star"), limit(recordsPerPage));

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
        where("star", ">=", value),
        where("star", "<=", value + "\uf8ff"),
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
      !newUserData.star ||
      !newUserData.raasiMoonsign
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
        star: "",
        raasiMoonsign: "",
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
    if (!editedData.star || !editedData.raasiMoonsign) {
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
        star: editedData.star,
        raasiMoonsign: editedData.raasiMoonsign,
        updatedAt: new Date().toISOString(),
      });

      setUsers(
        users.map((user) =>
          user.id === userId
            ? {
                ...user,
                star: editedData.star,
                raasiMoonsign: editedData.raasiMoonsign,
              }
            : user
        )
      );

      setEditingUser(null);
      setEditedData({
        star: "",
        raasiMoonsign: "",
      });

      toast({
        title: "Success",
        description: "User astrological details updated successfully",
      });
    } catch (error) {
      console.error("Error updating star details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user astrological details",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Star Management</h1>
          <p className="text-gray-500 mt-1">Manage user astrological details</p>
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
                value={newUserData.star}
                onValueChange={(value) =>
                  setNewUserData({
                    ...newUserData,
                    star: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select star" />
                </SelectTrigger>
                <SelectContent>
                  {STARS.map((star) => (
                    <SelectItem key={star} value={star.toLowerCase()}>
                      {star}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={newUserData.raasiMoonsign}
                onValueChange={(value) =>
                  setNewUserData({
                    ...newUserData,
                    raasiMoonsign: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select raasi/moonsign" />
                </SelectTrigger>
                <SelectContent>
                  {RAASIS.map((raasi) => (
                    <SelectItem
                      key={raasi}
                      value={raasi.split(" ")[0].toLowerCase()}
                    >
                      {raasi}
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
            placeholder="Search by star..."
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
                Star (Nakshatra)
              </TableCell>
              <TableCell className="font-medium text-gray-700">
                Raasi/Moonsign
              </TableCell>
              <TableCell className="font-medium text-gray-700">
                Actions
              </TableCell>
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
                <TableCell
                  colSpan={4}
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
                        value={editedData.star || user.star}
                        onValueChange={(value) =>
                          setEditedData({
                            ...editedData,
                            star: value,
                          })
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STARS.map((star) => (
                            <SelectItem key={star} value={star.toLowerCase()}>
                              {star}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-gray-700">
                        {user.star
                          ? user.star.charAt(0).toUpperCase() +
                            user.star.slice(1)
                          : "N/A"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <Select
                        value={editedData.raasiMoonsign || user.raasiMoonsign}
                        onValueChange={(value) =>
                          setEditedData({
                            ...editedData,
                            raasiMoonsign: value,
                          })
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RAASIS.map((raasi) => (
                            <SelectItem
                              key={raasi}
                              value={raasi.split(" ")[0].toLowerCase()}
                            >
                              {raasi}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-gray-700">
                        {user.raasiMoonsign
                          ? RAASIS.find((r) =>
                              r
                                .toLowerCase()
                                .startsWith(user.raasiMoonsign.toLowerCase())
                            )
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
                              star: "",
                              raasiMoonsign: "",
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
                            star: user.star || "",
                            raasiMoonsign: user.raasiMoonsign || "",
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
