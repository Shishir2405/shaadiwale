// components/layout/DashboardLayout.js
"use client";

import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import {
  Home,
  Users,
  Settings,
  ClipboardList,
  Heart,
  CreditCard,
  Mail,
  FileText,
  PlusCircle,
  Globe,
  BookOpen,
  Briefcase,
  GraduationCap,
  Languages,
  Star,
  Moon,
  DollarSign,
  Database,
  ChartLine,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  CheckCircle,
} from "lucide-react";

const menuItems = [
  {
    title: "My Dashboard",
    icon: Home,
    href: "/dashboard",
  },
  {
    title: "First Form Data",
    icon: Database,
    href: "/dashboard/first-form-data",
  },
  {
    title: "Add New Details",
    icon: PlusCircle,
    children: [
      {
        title: "Add Religion",
        href: "/dashboard/add/religion",
        count: 11,
        icon: BookOpen,
      },
      {
        title: "Add Caste",
        href: "/dashboard/add/caste",
        count: 4,
        icon: Users,
      },
      {
        title: "Add Sub Caste",
        href: "/dashboard/add/subcaste",
        count: 1,
        icon: Users,
      },
      {
        title: "Add State",
        href: "/dashboard/add/state",
        count: 3086,
        icon: Globe,
      },
      {
        title: "Add City",
        href: "/dashboard/add/city",
        count: 35362,
        icon: Globe,
      },
      {
        title: "Add Occupation",
        href: "/dashboard/add/occupation",
        count: 62,
        icon: Briefcase,
      },
      {
        title: "Add Education",
        href: "/dashboard/add/education",
        count: 78,
        icon: GraduationCap,
      },
      {
        title: "Add Mother Tongue",
        href: "/dashboard/add/mothertongue",
        count: 53,
        icon: Languages,
      },
      {
        title: "Add Star and Rasi(Moonsign)",
        href: "/dashboard/add/star-rasi",
        count: 28,
        icon: Star,
      },
      {
        title: "Add Dosh",
        href: "/dashboard/add/dosh",
        count: 11,
        icon: PlusCircle,
      },
    ],
  },
  {
    title: "Membership Plans",
    icon: CreditCard,
    children: [
      {
        title: "View Plans",
        href: "/dashboard/membership",
        icon: ClipboardList,
      },
      {
        title: "Add New Plan",
        href: "/dashboard/membership/add",
        icon: PlusCircle,
      },
    ],
  },
  {
    title: "Database Tools",
    icon: Database,
    children: [
      {
        title: "Export Database",
        href: "/dashboard/export",
        icon: Download,
      },
    ],
  },
  {
    title: "Site Settings",
    icon: Settings,
    children: [
      {
        title: "Update Favicon & Logo",
        href: "/dashboard/settings/branding",
      },
      {
        title: "Update Home Page Banner",
        href: "/dashboard/settings/banner",
      },
      { title: "Update Watermark", href: "/dashboard/settings/watermark" },
      { title: "Enable/Disable Fields", href: "/dashboard/settings/fields" },
      { title: "Enable/Disable Menu Item", href: "/dashboard/settings/menu" },
      { title: "Update Profile Id", href: "/dashboard/settings/profile" },
      { title: "Update Email Settings", href: "/dashboard/settings/email" },
      {
        title: "Update Basic Site Config",
        href: "/dashboard/settings/config",
      },
      {
        title: "Update Analytics Code",
        href: "/dashboard/settings/analytics",
      },
      {
        title: "Update Social Media Links",
        href: "/dashboard/settings/social",
      },
    ],
  },
  {
    title: "Members",
    icon: Users,
    children: [
      {
        title: "All Members",
        href: "/dashboard/members/all",
        icon: Users,
      },
      {
        title: "Active Members",
        href: "/dashboard/members/active",
        icon: CheckCircle,
      },
      {
        title: "Paid Members",
        href: "/dashboard/members/paid",
        icon: CreditCard,
      },
      {
        title: "Featured Profiles",
        href: "/dashboard/members/featured",
        icon: Star,
      },
    ],
  },
  {
    title: "Payment Setting",
    icon: Database,
    href: "/dashboard/payment-option",
  },

  {
    title: "Match Making",
    icon: Heart,
    href: "/dashboard/match-making",
  },
  {
    title: "Advertise",
    icon: Globe,
    href: "/dashboard/advertise",
  },
  {
    title: "User Activity",
    icon: ChartLine,
    href: "/dashboard/user-activity",
  },
  {
    title: "Content Management",
    icon: FileText,
    href: "/dashboard/content",
  },
  {
    title: "Email Templates",
    icon: Mail,
    href: "/dashboard/email-templates",
  },
  {
    title: "Contact Us Data",
    icon: Mail,
    href: "/dashboard/contactUs-data",
  },
];

const DashboardLayout = ({ children }) => {
  React.useEffect(() => {
    // Add styles to hide navbar
    const style = document.createElement("style");
    style.textContent = `
      
      #navbar { display: none !important; }
      
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar menuItems={menuItems} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
