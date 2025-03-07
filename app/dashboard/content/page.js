"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Globe, HelpCircle, ShieldCheck, FileText, Edit2 } from "lucide-react";

const ContentManagementPage = () => {
  const contentPages = [
    {
      title: "About Us",
      description: "Manage your company's story and introduction",
      icon: Globe,
      href: "/dashboard/content/about-us",
      bgColor: "bg-pink-50",
      textColor: "text-pink-600",
    },
    {
      title: "FAQ Management",
      description: "Update frequently asked questions",
      icon: HelpCircle,
      href: "/dashboard/content/faq-management",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Privacy Policy",
      description: "Review and edit privacy guidelines",
      icon: ShieldCheck,
      href: "/dashboard/content/privacy-policy",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Refund Policy",
      description: "Manage refund and return terms",
      icon: FileText,
      href: "/dashboard/content/refund-policy",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Terms & Conditions",
      description: "Update legal terms for users",
      icon: FileText,
      href: "/dashboard/content/terms-conditions",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      title: "Contact",
      description: "Update Contact Number ",
      icon: FileText,
      href: "/dashboard/content/contact-us",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Content Management
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          {contentPages.map((page, index) => (
            <motion.div
              key={page.title}
              initial={{
                opacity: 0,
                y: 50,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 },
              }}
              className={`
                ${page.bgColor} 
                rounded-2xl 
                shadow-lg 
                overflow-hidden 
                transform 
                transition-all 
                duration-300 
                hover:shadow-xl
                ${index % 2 === 1 ? "md:translate-y-12" : ""}
              `}
            >
              <Link href={page.href} className="block p-6 relative group">
                <div className="flex items-center mb-4">
                  <div
                    className={`
                    ${page.bgColor} 
                    ${page.textColor} 
                    p-3 
                    rounded-full 
                    mr-4 
                    group-hover:scale-110 
                    transition-transform
                  `}
                  >
                    <page.icon size={28} />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {page.title}
                  </h2>
                </div>

                <p className="text-gray-600 mb-4">{page.description}</p>

                <div className="flex justify-between items-center">
                  <span
                    className={`
                    ${page.textColor} 
                    font-medium 
                    flex 
                    items-center 
                    group-hover:underline
                  `}
                  >
                    Edit Content
                  </span>

                  <motion.div
                    whileHover={{ rotate: 15 }}
                    className={`
                      ${page.textColor} 
                      bg-white 
                      rounded-full 
                      p-2 
                      shadow-md
                    `}
                  >
                    <Edit2 size={20} />
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentManagementPage;
