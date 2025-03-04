"use client";

import React, { useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Heart,
  MapPin,
  UserCircle2,
  Filter,
  Calendar,
  Users,
  Church,
  ChevronDown,
  Sparkles,
  Star,
  Info,
  ArrowRight,
  ArrowLeft,
  X,
} from "lucide-react";
import { RELIGIONS, CASTES } from "@/lib/constant/serach";

const selectClassName =
  "h-9 block w-full rounded-lg border-gray-200 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 disabled:bg-gray-50 disabled:text-gray-500 hover:border-gray-300 transition-all duration-200";

// Step indicator component
const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex items-center justify-center space-x-2 mb-6">
    {[...Array(totalSteps)].map((_, index) => (
      <motion.div
        key={index}
        className={`h-2 rounded-full ${
          index === currentStep
            ? "w-8 bg-gradient-to-r from-pink-500 to-purple-600"
            : "w-2 bg-gray-200"
        }`}
        animate={{ scale: index === currentStep ? 1.1 : 1 }}
        transition={{ duration: 0.2 }}
      />
    ))}
  </div>
);

// Search step component
const SearchStep = ({ title, description, icon: Icon, children, tooltip }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
  >
    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-pink-50 rounded-lg">
          <Icon className="w-5 h-5 text-pink-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {tooltip && (
              <div className="relative group">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute left-0 mt-1 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  {tooltip}
                </div>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </motion.div>
);

// Profile card component
const ProfileCard = ({ profile, index, onFavorite, isFavorite }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
  >
    <div className="relative">
      <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 p-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <UserCircle2 className="w-12 h-12 text-gray-400" />
            <motion.div className="absolute inset-0 bg-pink-500 rounded-full scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-20 transition-all duration-300" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {profile.name || `Profile ${profile.id.slice(0, 4)}`}
            </h3>
            <p className="text-sm text-gray-600">
              {profile.age} years • {profile.religion}
            </p>
          </div>
        </div>
      </div>
      {profile.matchPercentage && (
        <div className="absolute top-2 right-2 px-3 py-1 bg-white/90 rounded-full text-sm font-medium text-pink-600 flex items-center space-x-1">
          <Star className="w-4 h-4 fill-current" />
          <span>{profile.matchPercentage}% Match</span>
        </div>
      )}
    </div>

    <div className="p-4 space-y-3">
      <div className="flex items-center text-gray-600">
        <MapPin className="w-4 h-4 mr-2" />
        <span className="text-sm">
          {profile.location?.city}, {profile.location?.state}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{profile.caste}</span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onFavorite(profile.id)}
          className={`text-${
            isFavorite ? "pink" : "gray"
          }-500 hover:text-pink-600 transition-colors`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
        </motion.button>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
      >
        View Full Profile
      </motion.button>
    </div>
  </motion.div>
);

// Search suggestion component
const SearchSuggestion = ({ title, icon: Icon, description, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full p-4 rounded-lg border border-gray-200 hover:border-pink-200 hover:bg-pink-50/50 transition-all group"
  >
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
        <Icon className="w-5 h-5 text-gray-600 group-hover:text-pink-500" />
      </div>
      <div className="text-left">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </motion.button>
);

// Main component
export default function QuickSearch() {
  // Step management
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 2;

  // Core states
  const [searchParams, setSearchParams] = useState({
    gender: "Bride",
    ageFrom: 18,
    ageTo: 30,
    religion: "",
    caste: "",
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState(new Set());
  const [searchSuggestions, setSearchSuggestions] = useState(true);

  const handleInputChange = useCallback((field, value) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "religion" ? { caste: "" } : {}),
    }));
    setError("");
  }, []);

  const searchSuggestionsList = [
    {
      title: "Recently Active",
      icon: Sparkles,
      description: "Find profiles active in the last 24 hours",
      onClick: () => {
        setSearchParams((prev) => ({ ...prev, activeWithin: 24 }));
        setSearchSuggestions(false);
      },
    },
    {
      title: "Near Me",
      icon: MapPin,
      description: "Discover profiles from your city",
      onClick: () => {
        setSearchParams((prev) => ({ ...prev, locationPreference: "nearby" }));
        setSearchSuggestions(false);
      },
    },
    {
      title: "Best Matches",
      icon: Star,
      description: "Find highly compatible profiles",
      onClick: () => {
        setSearchParams((prev) => ({ ...prev, matchPreference: "best" }));
        setSearchSuggestions(false);
      },
    },
  ];

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const usersRef = collection(db, "users");
      const searchGender = searchParams.gender === "Bride" ? "female" : "male";
      let queryConstraints = [where("gender", "==", searchGender)];

      if (searchParams.religion) {
        queryConstraints.push(
          where("religion", "==", searchParams.religion.toLowerCase())
        );
      }

      const q = query(usersRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);

      let profiles = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.age >= searchParams.ageFrom &&
          data.age <= searchParams.ageTo &&
          (!searchParams.caste || data.caste === searchParams.caste)
        ) {
          profiles.push({
            id: doc.id,
            ...data,
          });
        }
      });

      setResults(profiles);

      if (profiles.length === 0) {
        setError(
          "No matching profiles found. Try adjusting your search criteria."
        );
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = useCallback((profileId) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(profileId)) {
        newFavorites.delete(profileId);
      } else {
        newFavorites.add(profileId);
      }
      return newFavorites;
    });
  }, []);

  const calculateMatchPercentage = useCallback(
    (profile) => {
      let matches = 0;
      let total = 0;

      if (
        profile.age >= searchParams.ageFrom &&
        profile.age <= searchParams.ageTo
      ) {
        matches += 2;
      }
      total += 2;

      if (
        searchParams.religion &&
        profile.religion.toLowerCase() === searchParams.religion.toLowerCase()
      ) {
        matches += 3;
      }
      if (searchParams.religion) total += 3;

      if (searchParams.caste && profile.caste === searchParams.caste) {
        matches += 2;
      }
      if (searchParams.caste) total += 2;

      return total > 0 ? Math.round((matches / total) * 100) : 100;
    },
    [searchParams]
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 mb-2"
        >
          Quick Search
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600"
        >
          Find your perfect match with our simple search
        </motion.p>
      </div>

      {/* Search Suggestions */}
      <AnimatePresence>
        {searchSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          >
            {searchSuggestionsList.map((suggestion) => (
              <SearchSuggestion key={suggestion.title} {...suggestion} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

      {/* Search Steps */}
      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <SearchStep
            key="step1"
            title="Basic Details"
            description="Tell us who you're looking for"
            icon={Users}
            tooltip="Start with basic preferences"
          >
            <div className="space-y-6">
              {/* Gender Selection */}
              <div className="grid grid-cols-2 gap-4">
                {["Bride", "Groom"].map((gender) => (
                  <motion.button
                    key={gender}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleInputChange("gender", gender)}
                    className={`w-full p-4 rounded-lg border-2 transition-colors ${
                      searchParams.gender === gender
                        ? "border-pink-500 bg-pink-50 text-pink-700"
                        : "border-gray-200 hover:border-pink-200 text-gray-600"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Users className="w-6 h-6" />
                      <span className="text-sm font-medium">{gender}</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Age Range */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Age Range (Years)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">From</label>
                    <select
                      value={searchParams.ageFrom}
                      onChange={(e) =>
                        handleInputChange("ageFrom", parseInt(e.target.value))
                      }
                      className={selectClassName}
                    >
                      {[...Array(43)].map((_, i) => (
                        <option key={i + 18} value={i + 18}>
                          {i + 18} years
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">To</label>
                    <select
                      value={searchParams.ageTo}
                      onChange={(e) =>
                        handleInputChange("ageTo", parseInt(e.target.value))
                      }
                      className={selectClassName}
                    >
                      {[...Array(43)].map((_, i) => (
                        <option
                          key={i + 18}
                          value={i + 18}
                          disabled={i + 18 < searchParams.ageFrom}
                        >
                          {i + 18} years
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </SearchStep>
        )}

        {currentStep === 1 && (
          <SearchStep
            key="step2"
            title="Religion & Community"
            description="Find someone who shares your values"
            icon={Church}
            tooltip="Select religious preferences"
          >
            <div className="space-y-6">
              {/* Religion Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Religion Preference
                </label>
                <select
                  value={searchParams.religion}
                  onChange={(e) =>
                    handleInputChange("religion", e.target.value)
                  }
                  className={selectClassName}
                >
                  <option value="">Any Religion</option>
                  {RELIGIONS.map((religion) => (
                    <option key={religion.value} value={religion.value}>
                      {religion.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Caste Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Caste Preference
                  </label>
                  {!searchParams.religion && (
                    <span className="text-xs text-gray-500">
                      Select a religion first
                    </span>
                  )}
                </div>
                <select
                  value={searchParams.caste}
                  onChange={(e) => handleInputChange("caste", e.target.value)}
                  className={selectClassName}
                  disabled={!searchParams.religion}
                >
                  <option value="">Any Caste</option>
                  {searchParams.religion &&
                    CASTES[searchParams.religion.toLowerCase()]?.map(
                      (caste) => (
                        <option key={caste} value={caste}>
                          {caste}
                        </option>
                      )
                    )}
                </select>
              </div>
            </div>
          </SearchStep>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
          disabled={currentStep === 0}
          className="px-4 py-2 text-gray-600 flex items-center space-x-2 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </motion.button>

        {currentStep === totalSteps - 1 ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSearch}
            disabled={loading}
            className="px-8 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Find Matches</span>
              </>
            )}
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1))
            }
            className="px-4 py-2 text-pink-600 flex items-center space-x-2"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 space-y-8"
        >
          {/* Results Stats */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {results.length}
                </div>
                <div className="text-sm text-gray-600">Total Matches</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {
                    results.filter((p) => calculateMatchPercentage(p) >= 80)
                      .length
                  }
                </div>
                <div className="text-sm text-gray-600">High Compatibility</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {favorites.size}
                </div>
                <div className="text-sm text-gray-600">Favorites</div>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((profile, index) => (
              <ProfileCard
                key={profile.id}
                profile={{
                  ...profile,
                  matchPercentage: calculateMatchPercentage(profile),
                }}
                index={index}
                onFavorite={handleFavoriteToggle}
                isFavorite={favorites.has(profile.id)}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="text-center"
          >
            <div className="relative w-16 h-16 mx-auto mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-pink-200 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-1 border-4 border-t-pink-500 border-transparent rounded-full"
              />
            </div>
            <p className="text-gray-600">Finding your perfect match...</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
