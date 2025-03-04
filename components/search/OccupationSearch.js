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
  GraduationCap,
  Briefcase,
  BanknoteIcon,
  Image,
  Users,
  InfoIcon,
} from "lucide-react";
import { EDUCATION, OCCUPATIONS, ANNUAL_INCOME } from "@/lib/constant/serach";

// Tooltip component to provide helpful context for search fields
const InfoTooltip = ({ message }) => (
  <div className="group relative flex">
    <InfoIcon className="w-4 h-4 text-gray-400 cursor-help" />
    <div className="absolute left-full ml-2 w-48 px-2 py-1 bg-gray-800 rounded-lg text-white text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
      {message}
    </div>
  </div>
);

// ProfileCard component with enhanced professional information display
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

    <div className="p-4 space-y-3">
      <div>
        <h3 className="font-medium text-gray-900">
          {profile.name || "Profile " + profile.id.slice(0, 4)}
        </h3>
        <p className="text-sm text-gray-600">
          {profile.age} years • {profile.religion}
        </p>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-700">
          <GraduationCap className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{profile.education}</span>
        </div>

        <div className="flex items-center text-gray-700">
          <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{profile.occupation}</span>
        </div>

        {profile.annualIncome && (
          <div className="flex items-center text-gray-700">
            <BanknoteIcon className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>₹{profile.annualIncome.toLocaleString()} per annum</span>
          </div>
        )}

        <div className="flex items-center text-gray-700">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>
            {profile.location?.city}, {profile.location?.state}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);

// Main component for professional search functionality
export default function OccupationSearch() {
  // Initialize state with default values
  const [searchParams, setSearchParams] = useState({
    gender: "Bride",
    education: "",
    occupation: "",
    annualIncome: "",
    withPhoto: false,
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  // Handle input changes with validation and state updates
  const handleInputChange = useCallback((field, value) => {
    setSearchParams((prev) => ({ ...prev, [field]: value }));
    setError(""); // Clear errors when user makes changes
  }, []);

  // Main search handler with comprehensive error handling
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const usersRef = collection(db, "users");
      const searchGender = searchParams.gender === "Bride" ? "female" : "male";

      let queryConstraints = [where("gender", "==", searchGender)];

      // Build query based on selected criteria
      if (searchParams.education) {
        queryConstraints.push(where("education", "==", searchParams.education));
      }

      if (searchParams.occupation) {
        queryConstraints.push(
          where("occupation", "==", searchParams.occupation)
        );
      }

      if (searchParams.annualIncome) {
        queryConstraints.push(
          where("annualIncome", ">=", parseInt(searchParams.annualIncome))
        );
      }

      const q = query(usersRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);
      const profiles = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          !searchParams.withPhoto ||
          (searchParams.withPhoto && data.photoUrl)
        ) {
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
          "No matching profiles found. Try broadening your criteria or adjusting income range."
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
          <h1 className="text-2xl font-bold mb-2">Professional Search</h1>
          <p className="text-gray-600">
            Find your perfect match based on education, occupation, and income
            criteria. Our advanced filters help you discover compatible
            professionals.
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
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">
                  Looking for
                </label>
              </div>
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
              <div className="flex items-center space-x-2">
                <Image className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">
                  Photo Settings
                </label>
              </div>
              <div className="flex items-center h-10">
                <input
                  type="checkbox"
                  id="withPhoto"
                  checked={searchParams.withPhoto}
                  onChange={(e) =>
                    handleInputChange("withPhoto", e.target.checked)
                  }
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
          </div>

          {/* Professional Criteria */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center space-x-2">
              <span>Professional Details</span>
              <InfoTooltip message="Search based on educational and professional achievements" />
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Education
                  </label>
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                </div>
                <select
                  value={searchParams.education}
                  onChange={(e) =>
                    handleInputChange("education", e.target.value)
                  }
                  className="h-10 block w-full rounded-lg border-gray-200 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                >
                  <option value="">Any Education</option>
                  {EDUCATION.map((edu) => (
                    <option key={edu.value} value={edu.value}>
                      {edu.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Occupation
                  </label>
                  <Briefcase className="w-4 h-4 text-gray-400" />
                </div>
                <select
                  value={searchParams.occupation}
                  onChange={(e) =>
                    handleInputChange("occupation", e.target.value)
                  }
                  className="h-10 block w-full rounded-lg border-gray-200 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                >
                  <option value="">Any Occupation</option>
                  {OCCUPATIONS.map((occ) => (
                    <option key={occ.value} value={occ.value}>
                      {occ.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Minimum Annual Income
                  </label>
                  <BanknoteIcon className="w-4 h-4 text-gray-400" />
                </div>
                <select
                  value={searchParams.annualIncome}
                  onChange={(e) =>
                    handleInputChange("annualIncome", e.target.value)
                  }
                  className="h-10 block w-full rounded-lg border-gray-200 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                >
                  <option value="">Any Income</option>
                  {ANNUAL_INCOME.map((income) => (
                    <option key={income.value} value={income.value}>
                      ₹{income.label}
                    </option>
                  ))}
                </select>
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
              {searchParams.education ||
              searchParams.occupation ||
              searchParams.annualIncome ? (
                <p className="text-sm text-gray-600">
                  Matching your professional criteria
                </p>
              ) : null}
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
