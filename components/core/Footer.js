import React from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaPinterest } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";

const Footer = () => {
  return (
    <footer className="bg-white w-full pt-8 pb-4 border-t-2 border-gray-300">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Help And Support */}
          <div>
            <h3 className="text-[#e71c5d] font-semibold mb-4">
              Help And Support
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/contactUs" className="text-gray-600 hover:text-[#e71c5d]">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/faq" className="text-gray-600 hover:text-[#e71c5d]">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/refund-policy" className="text-gray-600 hover:text-[#e71c5d]">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Terms & Policy */}
          <div>
            <h3 className="text-[#e71c5d] font-semibold mb-4">
              Terms & Policy
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/terms-conditions" className="text-gray-600 hover:text-[#e71c5d]">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="/privacy-policy" className="text-gray-600 hover:text-[#e71c5d]">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-[#e71c5d]">
                  Report Misuse
                </a>
              </li>
            </ul>
          </div>

          {/* Need Help? */}
          <div>
            <h3 className="text-[#e71c5d] font-semibold mb-4">Need Help?</h3>
            <ul className="space-y-2">
              <li>
                <a href="/login" className="text-gray-600 hover:text-[#e71c5d]">
                  Login
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-[#e71c5d]">
                  Register
                </a>
              </li>
              <li>
                <a
                  href="/membership"
                  className="text-gray-600 hover:text-[#e71c5d] flex items-center"
                >
                  <span className="mr-1">⭐</span> Upgrade Membership
                </a>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-[#e71c5d] font-semibold mb-4">Information</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-[#e71c5d]">
                  Success Story
                </a>
              </li>
              <li>
                <a href="/about-us" className="text-gray-600 hover:text-[#e71c5d]">
                  About Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* About Us Section */}
        <div className="border-t border-gray-200 pt-6 pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-[#e71c5d] font-semibold mb-2">About Us</h3>
              <p className="text-gray-600">Welcome to theshaadiwale.com</p>
            </div>
            <div>
              <h3 className="text-[#e71c5d] font-semibold mb-2">
                Join us on social
              </h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="h-11 w-11 relative rounded-xl group text-white hover:text-white"
                >
                  <div className="h-full w-full absolute group-hover:bg-white/40 group-hover:backdrop-blur-sm transition-all duration-300 rounded-xl z-10 flex items-center justify-center">
                    <FaFacebook className="text-xl" />
                  </div>
                  <div className="h-full w-full rounded-xl absolute transition-all duration-300 bg-gradient-to-tr from-blue-600 to-blue-500 group-hover:rotate-[35deg] origin-bottom"></div>
                </a>
                <a
                  href="#"
                  className="h-11 w-11 relative rounded-xl group text-white hover:text-white"
                >
                  <div className="h-full w-full absolute group-hover:bg-white/40 group-hover:backdrop-blur-sm transition-all duration-300 rounded-xl z-10 flex items-center justify-center">
                    <FaPinterest className="text-xl" />
                  </div>
                  <div className="h-full w-full rounded-xl absolute transition-all duration-300 bg-gradient-to-tr from-red-600 to-red-500 group-hover:rotate-[35deg] origin-bottom"></div>
                </a>
                <a
                  href="#"
                  className="h-11 w-11 relative rounded-xl group text-white hover:text-white"
                >
                  <div className="h-full w-full absolute group-hover:bg-white/40 group-hover:backdrop-blur-sm transition-all duration-300 rounded-xl z-10 flex items-center justify-center">
                    <BsTwitterX className="text-xl" />{" "}
                    {/* Using the imported 'X' icon */}
                  </div>
                  <div className="h-full w-full rounded-xl absolute transition-all duration-300 bg-black group-hover:rotate-[35deg] origin-bottom"></div>
                </a>

                <a
                  href="#"
                  className="h-11 w-11 relative rounded-xl group text-white hover:text-white"
                >
                  <div className="h-full w-full absolute group-hover:bg-white/40 group-hover:backdrop-blur-sm transition-all duration-300 rounded-xl z-10 flex items-center justify-center">
                    <FaLinkedin className="text-xl" />
                  </div>
                  <div className="h-full w-full rounded-xl absolute transition-all duration-300 bg-gradient-to-tr from-blue-700 to-blue-600 group-hover:rotate-[35deg] origin-bottom"></div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <button className="mb-4 md:mb-0 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              🌐 Change language
            </button>
            <p className="text-sm text-gray-600 text-center">
              All Rights Reserved By @ Design and developed by theshaadiwale.com
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
