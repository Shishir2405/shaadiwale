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
  Globe,
  Map,
  Building2,
  Image,
  Users
} from "lucide-react";
import { INDIAN_STATES } from "@/lib/constant/serach";

// LocationIcon component helps visualize the hierarchy of location selection
const LocationIcon = ({ type, selected }) => {
  // We use different icons to represent different location levels
  const icons = {
    country: Globe,
    state: Map,
    city: Building2
  };
  const Icon = icons[type];

  return (
    <div className={`p-2 rounded-full ${
      selected ? "bg-pink-100" : "bg-gray-50"
    }`}>
      <Icon className={`w-4 h-4 ${
        selected ? "text-pink-600" : "text-gray-400"
      }`} />
    </div>
  );
};

// ProfileCard component presents search results in a consistent, attractive format
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
        <p className="text-gray-600">
          {profile.age} years • {profile.religion}
        </p>
        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-1" />
          <span>
            {profile.location?.city}, {profile.location?.state}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);

// LocationSearch component handles the main search functionality
export default function LocationSearch() {
  // Initialize state with meaningful default values
  const [searchParams, setSearchParams] = useState({
    gender: "Bride",
    country: "India",
    state: "",
    city: "",
    withPhoto: false
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  // Handle input changes with proper validation and state updates
  const handleInputChange = useCallback((field, value) => {
    setSearchParams(prev => {
      const newParams = { ...prev, [field]: value };
      
      // Reset city when state changes to maintain data consistency
      if (field === "state") {
        newParams.city = "";
      }
      
      return newParams;
    });
    setError(""); // Clear errors when user makes changes
  }, []);

  // Main search function with comprehensive error handling
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults([]);

    try {
      // Build the base query with required filters
      const usersRef = collection(db, "users");
      const searchGender = searchParams.gender === "Bride" ? "female" : "male";
      
      let queryConstraints = [
        where("gender", "==", searchGender),
        where("location.country", "==", searchParams.country)
      ];

      // Add optional location filters if specified
      if (searchParams.state) {
        queryConstraints.push(where("location.state", "==", searchParams.state));
      }

      if (searchParams.city) {
        queryConstraints.push(where("location.city", "==", searchParams.city));
      }

      // Execute the search query
      const q = query(usersRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);
      const profiles = [];

      // Process results and apply photo filter if needed
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!searchParams.withPhoto || (searchParams.withPhoto && data.photoUrl)) {
          profiles.push({
            id: doc.id,
            ...data
          });
        }
      });

      setResults(profiles);
      
      // Provide helpful feedback for empty results
      if (profiles.length === 0) {
        setError(
          `No profiles found in ${
            searchParams.city || searchParams.state || "this location"
          }. Try broadening your search.`
        );
      }

    } catch (error) {
      console.error("Search error:", error);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Compute helper values for the UI
  const hasLocationSelected = searchParams.state || searchParams.city;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header Section with clear purpose statement */}
      <div className="bg-white shadow-sm rounded-lg mb-6">
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-2">Location Search</h1>
          <p className="text-gray-600">
            Find profiles based on location preferences. Narrow your search by
            state and city to discover matches in your preferred area.
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
          {/* Basic Search Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Users className="w-4 h-4" />
                <span>Looking for</span>
              </label>
              <select
                value={searchParams.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                className="h-10 block w-full rounded-lg border-gray-200 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              >
                <option value="Bride">Bride</option>
                <option value="Groom">Groom</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Image className="w-4 h-4" />
                <span>Photo Settings</span>
              </label>
              <div className="flex items-center h-10">
                <input
                  type="checkbox"
                  id="withPhoto"
                  checked={searchParams.withPhoto}
                  onChange={(e) => handleInputChange("withPhoto", e.target.checked)}
                  className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                />
                <label htmlFor="withPhoto" className="ml-2 text-sm text-gray-600">
                  Show profiles with photo only
                </label>
              </div>
            </div>
          </div>

          {/* Location Selection with Visual Hierarchy */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Location Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <LocationIcon type="country" selected={true} />
                </div>
                <select
                  value={searchParams.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  className="h-10 block w-full rounded-lg border-gray-200 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                >
                  <option value="India">India</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    State
                  </label>
                  <LocationIcon type="state" selected={searchParams.state} />
                </div>
                <select
                  value={searchParams.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="h-10 block w-full rounded-lg border-gray-200 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    City
                  </label>
                  <LocationIcon type="city" selected={searchParams.city} />
                </div>
                <input
                  type="text"
                  value={searchParams.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter city name"
                  className="h-10 block w-full rounded-lg border-gray-200 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                />
              </div>
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
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between"
            >
              <h2 className="text-xl font-semibold text-gray-900">
                Found {results.length} Matches
              </h2>
              {hasLocationSelected && (
                <p className="text-sm text-gray-600">
                  in {searchParams.city || searchParams.state}
                </p>
              )}
            </motion.div>

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