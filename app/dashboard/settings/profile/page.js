"use client";

import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, limit, startAfter, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "react-hot-toast";
import {
  Settings,
  Users,
  RefreshCw,
  Save,
  AlertCircle,
  ChevronRight,
  Loader2,
  History,
  Key,
  ShieldCheck,
  ChevronLeft,
  UserPlus,
  Edit2,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Utility function to format numbers
const formatNumber = (num, length = 4) => {
  return String(num).padStart(length, '0');
};

// Settings section component
const SettingSection = ({ title, description, children, icon: Icon }) => (
  <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-pink-50 rounded-lg">
          <Icon className="w-5 h-5 text-pink-500" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

// Stats card component
const StatsCard = ({ title, value, icon: Icon, color = "text-gray-900" }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <div className={`p-2 ${color.replace('text-', 'bg-')}/10 rounded-lg`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
    <div className="text-2xl font-bold mb-1">{value}</div>
    <div className="text-sm text-gray-600">{title}</div>
  </div>
);

// Main Settings component
const ProfileSettings = () => {
  const [settings, setSettings] = useState({
    prefix: 'MAT',
    startNumber: 1000,
    format: '{prefix}{number}',
    currentNumber: 1000,
    autoAssign: true,
    lastUpdated: null
  });

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    assignedIds: 0,
    pendingIds: 0
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, "siteSettings", "profileId"));
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data());
        }
        await updateStats();
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load settings');
      }
    };

    fetchData();
  }, []);

  // Update statistics
  const updateStats = async () => {
    try {
      const usersRef = collection(db, "users");
      const [totalSnapshot, assignedSnapshot] = await Promise.all([
        getDocs(usersRef),
        getDocs(query(usersRef, where("matriId", "!=", null)))
      ]);

      setStats({
        totalUsers: totalSnapshot.size,
        assignedIds: assignedSnapshot.size,
        pendingIds: totalSnapshot.size - assignedSnapshot.size
      });
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  // Save settings
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedSettings = {
        ...settings,
        lastUpdated: new Date().toISOString()
      };
      await setDoc(doc(db, "siteSettings", "profileId"), updatedSettings);
      setSettings(updatedSettings);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update settings');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Profile ID Settings
        </h1>
        <p className="text-gray-600 mt-2">
          Configure and manage MatriID assignment for users
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="text-blue-500"
        />
        <StatsCard
          title="Assigned IDs"
          value={stats.assignedIds}
          icon={ShieldCheck}
          color="text-green-500"
        />
        <StatsCard
          title="Pending IDs"
          value={stats.pendingIds}
          icon={Key}
          color="text-pink-500"
        />
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ID Configuration */}
        <SettingSection
          title="ID Configuration"
          description="Set up the format for MatriIDs"
          icon={Settings}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prefix</Label>
                <Input
                  value={settings.prefix}
                  onChange={(e) => setSettings(prev => ({...prev, prefix: e.target.value}))}
                  placeholder="MAT"
                  required
                />
              </div>
              <div>
                <Label>Start Number</Label>
                <Input
                  type="number"
                  value={settings.startNumber}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    startNumber: parseInt(e.target.value),
                    currentNumber: parseInt(e.target.value)
                  }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Format Pattern</Label>
              <Input
                value={settings.format}
                onChange={(e) => setSettings(prev => ({...prev, format: e.target.value}))}
                placeholder="{prefix}{number}"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Available placeholders: {'{prefix}'} and {'{number}'}
              </p>
            </div>

            <div>
              <Label>Auto-Assignment</Label>
              <div className="flex items-center justify-between mt-2">
                <div className="text-sm text-gray-600">
                  Automatically assign MatriIDs to new users
                </div>
                <Switch
                  checked={settings.autoAssign}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, autoAssign: checked }))
                  }
                />
              </div>
            </div>

            <div className="mt-4">
              <Label>Next ID Preview</Label>
              <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg mt-1">
                <div className="text-lg font-medium text-gray-900">
                  {settings.format
                    .replace('{prefix}', settings.prefix)
                    .replace('{number}', formatNumber(settings.currentNumber))}
                </div>
                <div className="text-sm text-gray-600">
                  Next ID to be assigned
                </div>
              </div>
            </div>
          </div>
        </SettingSection>

        {/* User List */}
        <UserList settings={settings} updateStats={updateStats} />

        {/* Last Updated Info */}
        {settings.lastUpdated && (
          <div className="text-sm text-gray-500 flex items-center">
            <History className="w-4 h-4 mr-1" />
            Last updated: {new Date(settings.lastUpdated).toLocaleString()}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

// User List Component
const UserList = ({ settings, updateStats }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [assigning, setAssigning] = useState({});
  const USERS_PER_PAGE = 10;

  const fetchUsers = async (isNext = false) => {
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      let baseQuery = query(
        usersRef,
        orderBy("createdAt", "desc"),
        limit(USERS_PER_PAGE)
      );

      if (isNext && lastVisible) {
        baseQuery = query(
          usersRef,
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(USERS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(baseQuery);
      
      if (snapshot.empty) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === USERS_PER_PAGE);

      const userData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setUsers(isNext ? [...users, ...userData] : userData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const assignIdToUser = async (userId) => {
    setAssigning(prev => ({ ...prev, [userId]: true }));
    try {
      const matriId = settings.format
        .replace('{prefix}', settings.prefix)
        .replace('{number}', formatNumber(settings.currentNumber));

      await updateDoc(doc(db, "users", userId), {
        matriId: matriId,
        updatedAt: new Date().toISOString()
      });

      // Update settings
      const updatedSettings = {
        ...settings,
        currentNumber: settings.currentNumber + 1,
        lastUpdated: new Date().toISOString()
      };
      await setDoc(doc(db, "siteSettings", "profileId"), updatedSettings);

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, matriId } : user
      ));

      await updateStats();
      toast.success('MatriID assigned successfully');
    } catch (error) {
      console.error('Error assigning ID:', error);
      toast.error('Failed to assign MatriID');
    }
    setAssigning(prev => ({ ...prev, [userId]: false }));
  };

  const assignAllIds = async () => {
    const unassignedUsers = users.filter(user => !user.matriId);
    if (!unassignedUsers.length) {
      toast.info('All displayed users already have IDs');
      return;
    }

    setLoading(true);
    try {
      let currentNum = settings.currentNumber;
      const batch = [];

      unassignedUsers.forEach((user) => {
        const matriId = settings.format
          .replace('{prefix}', settings.prefix)
          .replace('{number}', formatNumber(currentNum));

        batch.push(updateDoc(doc(db, "users", user.id), {
          matriId: matriId,
          updatedAt: new Date().toISOString()
        }));

        currentNum++;
      });

      await Promise.all(batch);

      // Update settings
      const updatedSettings = {
        ...settings,
        currentNumber: currentNum,
        lastUpdated: new Date().toISOString()
      };
      await setDoc(doc(db, "siteSettings", "profileId"), updatedSettings);

      // Refresh users
      fetchUsers();
      await updateStats();
      toast.success(`Assigned ${batch.length} new MatriIDs`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to assign IDs');
    }
    setLoading(false);
  };

  return (
    <SettingSection
      title="User Management"
      description="View and manage user MatriIDs"
      icon={Users}
    >
      <div className="space-y-4">
        <div className="flex justify-end space-x-2">
          <Button
            onClick={assignAllIds}
            disabled={loading}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Assign All Displayed
              </>
            )}
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>MatriID</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.matriId ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 font-medium">{user.matriId}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400">Not assigned</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {!user.matriId && (
                      <Button
                        onClick={() => assignIdToUser(user.id)}
                        disabled={assigning[user.id]}
                        size="sm"
                        className="bg-pink-500 text-white hover:bg-pink-600"
                      >
                        {assigning[user.id] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Key className="w-4 h-4 mr-2" />
                            Assign ID
                          </>
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <Button
            onClick={() => fetchUsers(false)}
            disabled={loading || !lastVisible}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            onClick={() => fetchUsers(true)}
            disabled={loading || !hasMore}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </SettingSection>
  );
};

export default ProfileSettings;