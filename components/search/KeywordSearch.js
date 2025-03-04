"use client";

import { useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Heart,
  MapPin,
  UserCircle2,
  Mail,
  User,
  Image,
  Fingerprint,
} from "lucide-react";

// SearchType component to provide a clear interface for search type selection
const SearchType = ({ selected, onChange }) => {
  // Define search types with their icons and descriptions
  const types = [
    {
      id: "name",
      icon: User,
      label: "Name",
      description: "Search by profile name",
    },
    {
      id: "email",
      icon: Mail,
      label: "Email",
      description: "Search by email address",
    },
    {
      id: "id",
      icon: Fingerprint,
      label: "Profile ID",
      description: "Search by unique profile ID",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {types.map((type) => {
        const Icon = type.icon;
        const isSelected = selected === type.id;

        return (
          <motion.button
            key={type.id}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(type.id)}
            className={`p-3 rounded-lg border ${
              isSelected
                ? "border-pink-500 bg-pink-50 text-pink-700"
                : "border-gray-200 hover:border-pink-200 text-gray-600"
            } flex flex-col items-center justify-center space-y-1 transition-colors`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-sm font-medium">{type.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

// ProfileCard component to display search results consistently
const ProfileCard = ({ profile }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
  >
    <div className="relative">
      {profile.photoUrl ? (
        <img
          src={profile.photoUrl}
          alt={profile.name}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
          <UserCircle2 className="w-20 h-20 text-gray-300" />
        </div>
      )}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center text-pink-500 hover:text-pink-600 transition-colors"
      >
        <Heart className="w-4 h-4" />
      </motion.button>
    </div>
    <div className="p-4 space-y-2">
      <h3 className="font-medium text-gray-900">
        {profile.name || "Profile " + profile.id.slice(0, 4)}
      </h3>
      <div className="space-y-1 text-sm">
        {profile.age && profile.religion && (
          <p className="text-gray-600">
            {profile.age} years • {profile.religion}
          </p>
        )}
        {profile.email && (
          <p className="text-gray-600 truncate">{profile.email}</p>
        )}
        {profile.location && (
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            <span>
              {profile.location.city}, {profile.location.state}
            </span>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

export default function KeywordSearch() {
  // Initialize state with default values
  const [searchParams, setSearchParams] = useState({
    keyword: "",
    searchType: "name",
    withPhoto: false,
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  // Handle input changes with proper validation
  const handleInputChange = useCallback((field, value) => {
    setSearchParams((prev) => ({ ...prev, [field]: value }));
    setError(""); // Clear errors when user makes changes
  }, []);

  // Main search function with comprehensive error handling
  const handleSearch = async (e) => {
    e.preventDefault();

    // Validate input before proceeding
    if (!searchParams.keyword.trim()) {
      setError("Please enter a search keyword");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const usersRef = collection(db, "users");
      const searchValue = searchParams.keyword.toLowerCase().trim();
      let queryConstraints = [];

      // Build query based on search type
      switch (searchParams.searchType) {
        case "name":
          // Use range query for partial name matches
          queryConstraints.push(where("name", ">=", searchValue));
          queryConstraints.push(where("name", "<=", searchValue + "\uf8ff"));
          break;
        case "email":
          // Exact match for email
          queryConstraints.push(where("email", "==", searchValue));
          break;
        case "id":
          // Exact match for profile ID
          queryConstraints.push(where("profileId", "==", searchValue));
          break;
      }

      const q = query(usersRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);
      const profiles = [];

      // Process query results with photo filter if needed
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!searchParams.withPhoto || (searchParams.withPhoto && data.photoUrl)) {
          profiles.push({
            id: doc.id,
            ...data,
          });
        }
      });

      setResults(profiles);
      
      // Provide helpful feedback for empty results
      if (profiles.length === 0) {
        setError(
          `No matching profiles found. Try ${
            searchParams.searchType === "name"
              ? "a different name or partial name"
              : "checking your input"
          }.`
        );
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="bg-white shadow-sm rounded-lg mb-6">
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-2">Keyword Search</h1>
          <p className="text-gray-600">
            Search for profiles using name, email, or profile ID. Our smart search
            helps you find exactly who you're looking for.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 mb-6 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form
        onSubmit={handleSearch}
        className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="p-6 space-y-6">
          {/* Search Type Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Search By
            </label>
            <SearchType
              selected={searchParams.searchType}
              onChange={(value) => handleInputChange("searchType", value)}
            />
          </div>

          {/* Keyword Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Enter Keyword
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchParams.keyword}
                onChange={(e) => handleInputChange("keyword", e.target.value)}
                placeholder={`Enter ${searchParams.searchType}...`}
                className="h-10 block w-full rounded-lg border-gray-200 pl-10 pr-4 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Photo Filter */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm">
              <Image className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">Photo Settings</span>
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="withPhoto"
                checked={searchParams.withPhoto}
                onChange={(e) => handleInputChange("withPhoto", e.target.checked)}
                className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
              />
              <label
                htmlFor="withPhoto"
                className="ml-2 text-sm text-gray-600"
              >
                Show profiles with photo only
              </label>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-center pt-2">
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-10 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 rounded-lg hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 font-medium flex items-center space-x-2 shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? "Searching..." : "Search Profiles"}</span>
            </motion.button>
          </div>
        </div>
      </motion.form>

      {/* Search Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8 space-y-6"
          >
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-semibold text-gray-900"
            >
              Found {results.length} Matches
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}