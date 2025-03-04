"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { SearchDropdown } from "./SearchDropdown";
import {
  Menu,
  X,
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Globe,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import SignUpForm from "../auth/SignUpForm";
import { LanguageSwitcher } from "./LanguageSwitcher";

const NavItems = [
  { id: 1, title: "Home", href: "/" },
  { id: 2, title: "Membership", href: "/membership" },
  { id: 3, title: "Contact Us", href: "/contactUs" },
    { id: 4, title: "H", href: "/h" },
];

const UserAvatar = ({ user, size = 8 }) => {
  // Safely extract initials
  const initials = user?.email
    ? user.email.charAt(0).toUpperCase()
    : user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : "U";

  // Check for profile image
  const profileImageUrl =
    user?.photoURL ||
    user?.profileImageUrl ||
    user?.providerData?.[0]?.photoURL;

  // Determine Tailwind classes based on size
  const sizeClasses =
    {
      8: "w-8 h-8",
      10: "w-10 h-10",
      12: "w-12 h-12",
      16: "w-16 h-16",
    }[size] || "w-8 h-8";

  // If user has a profile image, render it
  if (profileImageUrl) {
    return (
      <div className={`${sizeClasses} rounded-full overflow-hidden`}>
        <Image
          src={profileImageUrl}
          alt={`${user?.displayName || "User"} avatar`}
          width={size * 4}
          height={size * 4}
          className="object-cover w-full h-full"
          priority
        />
      </div>
    );
  }

  // Fallback to initial avatar
  return (
    <div
      className={`${sizeClasses} rounded-full bg-[#e71c5d] text-white flex items-center justify-center font-semibold`}
    >
      {initials}
    </div>
  );
};

const NotificationBell = ({ user }) => {
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "notifications"),
      where("receiverId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotificationCount(snapshot.docs.length);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <Link
      href="/notification"
      className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
    >
      <Bell className="w-5 h-5 text-gray-600" />
      {notificationCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
          {notificationCount}
        </span>
      )}
    </Link>
  );
};

const UserProfileMenu = ({ user, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <UserAvatar user={user} size={10} />
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
          >
            <Link
              href="/edit-profile"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 space-x-2"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4" />
              <span>Edit Profile</span>
            </Link>

            <Link
              href="/settings"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 space-x-2"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>

            <div className="border-t border-gray-100 mt-2">
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-gray-100 space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MobileMenuItem = ({ href, title, onClose }) => (
  <Link
    href={href}
    className="group relative block text-right px-8 py-3 text-2xl font-light"
    onClick={onClose}
  >
    <span className="text-black relative inline-block font-medium">
      {title}
      <span className="absolute left-0 right-0 bottom-0 h-[3px] bg-[#e71c5d] transform scale-x-0 transition-transform duration-300 origin-right group-hover:scale-x-100" />
    </span>
  </Link>
);

const MobileUserProfile = ({ user }) => (
  <div className="px-8 py-4 border-b border-gray-100">
    <div className="flex items-center space-x-3">
      <UserAvatar user={user} />
      <div></div>
    </div>
  </div>
);

const MobileMenu = ({ isOpen, onClose, user, handleLogout, setShowSignUp }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="fixed inset-0 bg-white z-50 flex flex-col overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <Link href="/" onClick={onClose}>
            <Image
              src="/logo.png"
              alt="Logo"
              width={150}
              height={50}
              priority
            />
          </Link>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* User Profile (if logged in) */}
        {user && <MobileUserProfile user={user} />}

        {/* Language Switcher in Mobile Menu */}
        <div className="px-8 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-2 text-gray-600">
            <Globe className="w-5 h-5" />
            <span className="text-sm font-medium">Language:</span>
            <div className="flex-1">
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        {/* Navigation Links Container */}
        <div className="flex-1 flex flex-col justify-between">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
            className="space-y-1 mt-4"
          >
            {NavItems.map((item) => (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, x: 20 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <MobileMenuItem
                  href={item.href}
                  title={item.title}
                  onClose={onClose}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Auth Buttons */}
          <div className="mt-auto px-8 py-6">
            {user ? (
              <div className="space-y-3">
                <Link
                  href="/profile"
                  className="block w-full py-3 bg-gray-100 text-gray-900 rounded-full text-center hover:bg-gray-200 transition-colors font-semibold"
                  onClick={onClose}
                >
                  Edit Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    onClose();
                  }}
                  className="w-full py-3 border-2 border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="block w-full py-3 bg-[#e71c5d] text-white rounded-full text-center hover:bg-[#b72150] transition-colors font-semibold"
                  onClick={onClose}
                >
                  Login
                </Link>
                <button
                  onClick={() => {
                    setShowSignUp(true);
                    onClose();
                  }}
                  className="w-full py-3 border-2 border-[#e71c5d] text-[#e71c5d] rounded-full hover:bg-[#e71c5d] hover:text-white transition-colors font-semibold"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Navbar = () => {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(true);
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const scrollThreshold = 200;
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = scrollY.get();
      setVisible(
        currentScrollY <= scrollThreshold || currentScrollY < prevScrollY
      );
      setPrevScrollY(currentScrollY);
    };

    const unsubscribe = scrollY.onChange(handleScroll);

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => {
      unsubscribe();
      unsubscribeAuth();
    };
  }, [scrollY, prevScrollY]);

  const handleNotificationClick = async (notification) => {
    if (notification.type === "message") {
      router.push(`/chat/${notification.senderId}`);
    }
    await deleteDoc(doc(db, "notifications", notification.id));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 bg-white shadow-md z-[10000000]"
          >
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between h-16">
                {/* Logo */}
                <Link href="/" className="flex items-center">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={150}
                    height={40}
                    className="h-10 w-auto"
                    priority
                  />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-4">
                  {NavItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="text-black transition-colors hover:text-[#e71c5d] font-medium"
                    >
                      {item.title}
                    </Link>
                  ))}

                  <SearchDropdown />

                  {/* Language Switcher in Desktop */}
                  <div className="relative group px-2 py-1 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-gray-600 group-hover:text-[#e71c5d] transition-colors" />
                      <LanguageSwitcher />
                    </div>
                  </div>

                  {user ? (
                    <div className="flex items-center space-x-4">
                      <NotificationBell user={user} />

                      <UserProfileMenu
                        user={user}
                        handleLogout={handleLogout}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Link
                        href="/login"
                        className="px-6 py-2 bg-[#e71c5d] text-white rounded-full hover:bg-[#b72150] transition-colors font-semibold"
                      >
                        Login
                      </Link>
                      <button
                        onClick={() => setShowSignUp(true)}
                        className="px-6 py-2 border-2 border-[#e71c5d] text-[#e71c5d] rounded-full hover:bg-[#e71c5d] hover:text-white transition-colors font-semibold"
                      >
                        Register
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                >
                  <Menu size={24} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        handleLogout={handleLogout}
        setShowSignUp={setShowSignUp}
      />

      {/* SignUp Modal */}
      <AnimatePresence>
        {showSignUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative"
            >
              <button
                onClick={() => setShowSignUp(false)}
                className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors z-50 shadow-lg"
              >
                <X size={20} />
              </button>
              <SignUpForm />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
