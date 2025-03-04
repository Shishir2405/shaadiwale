"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  ArrowLeft,
  MapPin,
  GraduationCap,
  Briefcase,
  User,
  Calendar,
  Clock,
  Globe,
  Phone,
  Mail,
  Languages,
  Music,
  Book,
  Film,
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

async function getProfileData(id) {
  try {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();

      // Calculate age
      const currentYear = new Date().getFullYear();
      const birthYear = parseInt(userData.year);
      const age = currentYear - birthYear;

      return {
        id: docSnap.id,
        ...userData,
        age,
        displayName: `${userData.firstName || ""} ${
          userData.lastName || ""
        }`.trim(),
        displayLocation: `${userData.residingCity || ""}, ${
          userData.residingState || ""
        }`.trim(),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

export default function ProfilePage() {
  // Unwrap params safely
  const params = useParams(); // Unwrap params
  const id = params.id; // Directly extract id

  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [showContact, setShowContact] = useState(false);

  // Server-side data loading
  React.useEffect(() => {
    async function loadProfileData() {
      try {
        const profileData = await getProfileData(id);

        if (profileData) {
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100">
        <div className="p-8 rounded-lg bg-white shadow-lg">
          <div className="space-y-4">
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-pink-600 text-center">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100">
        <div className="p-8 rounded-lg bg-white shadow-lg text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Profile Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The profile you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const ProfileHeader = () => (
    <div className="relative">
      {/* Background Image */}
      <div className="h-64 bg-pink-100">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
      </div>

      {/* Profile Actions */}
      <div className="absolute top-4 left-4 flex gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md"
        >
          <ArrowLeft className="w-5 h-5 text-pink-500" />
        </motion.button>
      </div>

      <div className="absolute top-4 right-4 flex gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md"
        >
          <Share2 className="w-5 h-5 text-pink-500" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsLiked(!isLiked)}
          className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md"
        >
          <Heart
            className={`w-5 h-5 ${isLiked ? "text-pink-500" : "text-gray-600"}`}
            fill={isLiked ? "currentColor" : "none"}
          />
        </motion.button>
      </div>

      {/* Profile Photo */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-20">
        <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
          {profile.photos?.profile?.url ? (
            <Image
              src={profile.photos.profile.url}
              alt={profile.firstName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-pink-100 flex items-center justify-center">
              <span className="text-4xl text-pink-300">
                {profile.firstName?.[0]}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ProfileInfo = () => {
    const { user } = useAuth();
    const router = useRouter();

    const handleMessageClick = () => {
      // Don't allow messaging yourself
      if (user?.uid === profile.id) {
        return;
      }
      router.push(`/chat/${profile.id}`);
    };

    return (
      <div className="mt-24 text-center">
        <h1 className="text-3xl font-semibold text-gray-800">
          {profile.firstName} {profile.lastName}
        </h1>
        <p className="text-pink-500 mt-1">
          {profile.age} years • {profile.height}
        </p>
        <p className="text-gray-600 mt-1">
          {profile.religion} {profile.caste ? `• ${profile.caste}` : ""}
        </p>

        <div className="mt-6 flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowContact(true)}
            className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Connect Now
          </motion.button>
          {user?.uid !== profile.id && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMessageClick}
              className="px-6 py-3 border-2 border-pink-500 text-pink-500 rounded-lg hover:bg-pink-50 transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Message
            </motion.button>
          )}
        </div>
      </div>
    );
  };

  const TabNavigation = () => (
    <div className="border-b border-pink-100 mt-8">
      <div className="flex justify-center gap-8">
        {["about", "lifestyle", "photos", "preferences"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab
                ? "text-pink-500"
                : "text-gray-600 hover:text-pink-500"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const AboutTab = () => (
    <div className="py-8 px-4 space-y-8">
      {/* Basic Details */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Basic Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-pink-500 mt-0.5" />
            <div>
              <div className="font-medium text-gray-800">Profile Created</div>
              <div className="text-gray-600">By Self</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-pink-500 mt-0.5" />
            <div>
              <div className="font-medium text-gray-800">Birth Date</div>
              <div className="text-gray-600">{profile.birthDate}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-pink-500 mt-0.5" />
            <div>
              <div className="font-medium text-gray-800">Last Active</div>
              <div className="text-gray-600">3 hours ago</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-pink-500 mt-0.5" />
            <div>
              <div className="font-medium text-gray-800">Location</div>
              <div className="text-gray-600">
                {profile.residingCity}, {profile.residingState}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Education & Career */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Education & Career
        </h3>
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <GraduationCap className="w-5 h-5 text-pink-500 mt-0.5" />
            <div>
              <div className="font-medium text-gray-800">Education</div>
              <div className="text-gray-600">{profile.highestEducation}</div>
              <div className="text-gray-500 text-sm">
                {profile.educationDetails}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Briefcase className="w-5 h-5 text-pink-500 mt-0.5" />
            <div>
              <div className="font-medium text-gray-800">Profession</div>
              <div className="text-gray-600">{profile.occupation}</div>
              <div className="text-gray-500 text-sm">{profile.employedIn}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-pink-500 mt-0.5" />
            <div>
              <div className="font-medium text-gray-800">Work Location</div>
              <div className="text-gray-600">{profile.workLocation}</div>
            </div>
          </div>
        </div>
      </div>

      {/* About Me */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">About Me</h3>
        <p className="text-gray-600 whitespace-pre-line">
          {profile.about || "No description provided."}
        </p>
      </div>

      {/* Family Details */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Family Details
        </h3>
        <div className="space-y-4">
          {profile.familyDetails?.map((detail, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-pink-50 last:border-0"
            >
              <span className="text-gray-600">{detail.label}</span>
              <span className="text-gray-800 font-medium">{detail.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const LifestyleTab = () => (
    <div className="py-8 px-4 space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Lifestyle & Interests
        </h3>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Languages className="w-5 h-5 text-pink-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-800">Languages</div>
                <div className="text-gray-600">
                  {profile.languages?.join(", ") || "Not specified"}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Music className="w-5 h-5 text-pink-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-800">
                  Music Preferences
                </div>
                <div className="text-gray-600">
                  {profile.musicPreferences?.join(", ") || "Not specified"}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Book className="w-5 h-5 text-pink-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-800">
                  Reading Interests
                </div>
                <div className="text-gray-600">
                  {profile.readingInterests?.join(", ") || "Not specified"}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Film className="w-5 h-5 text-pink-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-800">
                  Movie Preferences
                </div>
                <div className="text-gray-600">
                  {profile.moviePreferences?.join(", ") || "Not specified"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {profile.lifestyle?.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-pink-50 last:border-0"
            >
              <span className="text-gray-600">{item.label}</span>
              <span className="text-gray-800 font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PhotosTab = () => (
    <div className="py-8 px-4">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Photo Gallery
        </h3>

        {profile.photos && Object.keys(profile.photos).length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(profile.photos).map(([key, photo]) => (
              <div
                key={key}
                className="relative aspect-square rounded-lg overflow-hidden group"
              >
                <Image
                  src={photo.url}
                  alt={`${profile.firstName}'s ${key} photo`}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="px-4 py-2 bg-white/90 rounded-lg text-sm font-medium text-gray-800">
                    View Full Size
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No photos available
          </div>
        )}
      </div>
    </div>
  );

  const PreferencesTab = () => (
    <div className="py-8 px-4 space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Partner Preferences
        </h3>

        <div className="space-y-6">
          {/* Basic Preferences */}
          <div className="space-y-4">
            <h4 className="text-pink-500 font-medium">Basic Preferences</h4>
            {profile.partnerPreferences?.basic?.map((pref, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-pink-50 last:border-0"
              >
                <span className="text-gray-600">{pref.label}</span>
                <span className="text-gray-800 font-medium">{pref.value}</span>
              </div>
            ))}
          </div>

          {/* Professional Preferences */}
          <div className="space-y-4">
            <h4 className="text-pink-500 font-medium">
              Professional Preferences
            </h4>
            {profile.partnerPreferences?.professional?.map((pref, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-pink-50 last:border-0"
              >
                <span className="text-gray-600">{pref.label}</span>
                <span className="text-gray-800 font-medium">{pref.value}</span>
              </div>
            ))}
          </div>

          {/* Religious Preferences */}
          <div className="space-y-4">
            <h4 className="text-pink-500 font-medium">Religious Preferences</h4>
            {profile.partnerPreferences?.religious?.map((pref, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-pink-50 last:border-0"
              >
                <span className="text-gray-600">{pref.label}</span>
                <span className="text-gray-800 font-medium">{pref.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Contact Modal
  const ContactModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={() => setShowContact(false)}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Contact Details
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-pink-500" />
              <div>
                <div className="text-sm text-gray-600">Phone</div>
                <div className="font-medium text-gray-800">{profile.phone}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-pink-500" />
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <div className="font-medium text-gray-800">{profile.email}</div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => setShowContact(false)}
              className="w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-b-xl">
        <ProfileHeader />
        <ProfileInfo />
        <TabNavigation />

        {activeTab === "about" && <AboutTab />}
        {activeTab === "lifestyle" && <LifestyleTab />}
        {activeTab === "photos" && <PhotosTab />}
        {activeTab === "preferences" && <PreferencesTab />}
      </div>

      <AnimatePresence>{showContact && <ContactModal />}</AnimatePresence>
    </div>
  );
}
