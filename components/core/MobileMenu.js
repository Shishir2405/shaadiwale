import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useScroll } from "framer-motion";
import { SearchDropdown } from "./SearchDropdown";
import { Menu, X, Home, Users2, Phone, ChevronRight } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import SignUpForm from "./SignUpForm";

const NavItems = [
  { id: 1, title: "Home", href: "/" },
  { id: 3, title: "Membership", href: "/membership" },
  { id: 4, title: "Contact Us", href: "/contact" },
];

const MobileMenu = ({ isOpen, onClose, user, handleLogout, setShowSignUp }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40"
        />
        
        {/* Side Menu */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          className="fixed right-0 top-0 h-screen w-[300px] bg-white shadow-xl z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Image src="/logo.png" alt="Logo" width={120} height={32} />
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="py-4">
            {NavItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
                onClick={onClose}
              >
                <span>{item.title}</span>
                <ChevronRight size={20} className="text-gray-400" />
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-gray-50">
            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  onClose();
                }}
                className="w-full py-3 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors font-semibold"
              >
                Logout
              </button>
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
        </motion.div>
      </>
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
  const scrollThreshold = 200;

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
            className="fixed top-0 left-0 right-0 z-40 bg-white shadow-md"
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
                  />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-4">
                  {NavItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="text-black transition-colors hover:text-[#e71c5d]"
                    >
                      {item.title}
                    </Link>
                  ))}

                  <SearchDropdown />

                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="px-6 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors font-semibold"
                    >
                      Logout
                    </button>
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
                className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors z-50"
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