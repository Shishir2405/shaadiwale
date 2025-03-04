"use client";

import React, { useState, useEffect, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Loader2,
  Users,
  Award,
  MapPin,
  Mail,
  Phone,
  Globe,
  Clock,
  ChevronDown,
} from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Image from "next/image";

const AboutUsComponent = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("story");
  const [visibleSection, setVisibleSection] = useState(null);

  const containerRef = useRef(null);
  const storyRef = useRef(null);
  const missionRef = useRef(null);
  const teamRef = useRef(null);
  const contactRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.8, 1, 1, 0.8]
  );

  // Default about us content if Firebase data is not available
  const defaultAboutUs = {
    title: "About Our Company",
    subtitle: "Founded with a vision to transform how people connect",
    story: `<p>Our story began with a simple idea – to create something that would make a difference. What started as a small team working from a garage has now grown into a company that serves customers worldwide.</p>
    <p>Founded in 2018, we've spent the last few years perfecting our products and services, always with our customers' needs at the heart of everything we do. Through innovation and dedication, we've overcome challenges and celebrated milestones alongside our growing community.</p>
    <p>Today, we're proud of how far we've come, but we're even more excited about where we're going. With every new day comes the opportunity to create, innovate, and impact more lives positively.</p>`,
    mission:
      "To empower our customers with innovative solutions that improve their lives and businesses.",
    vision:
      "To become the global leader in our industry, recognized for excellence, innovation, and customer satisfaction.",
    values: [
      {
        title: "Customer Focus",
        description: "We put our customers at the center of everything we do.",
      },
      {
        title: "Integrity",
        description: "We uphold the highest standards of honesty and ethics.",
      },
      {
        title: "Innovation",
        description:
          "We constantly seek new and better ways to serve our customers.",
      },
      {
        title: "Excellence",
        description: "We strive for excellence in all aspects of our business.",
      },
      {
        title: "Teamwork",
        description: "We work together to achieve common goals.",
      },
    ],
    team: [
      {
        name: "Jane Doe",
        position: "CEO & Founder",
        bio: "Jane has 15+ years of experience in the industry and leads our vision.",
        image:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        name: "John Smith",
        position: "CTO",
        bio: "John oversees all technical aspects and product development.",
        image:
          "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        name: "Emily Johnson",
        position: "Head of Marketing",
        bio: "Emily crafts our brand story and leads all marketing initiatives.",
        image:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    ],
    stats: [
      {
        value: "5+",
        label: "Years of Experience",
      },
      {
        value: "10k+",
        label: "Happy Customers",
      },
      {
        value: "30+",
        label: "Team Members",
      },
      {
        value: "15+",
        label: "Countries Served",
      },
    ],
    contact: {
      email: "info@yourcompany.com",
      phone: "+1 (555) 123-4567",
      address: "123 Business Street, City, Country",
      hours: "Monday - Friday: 9AM - 6PM",
    },
  };

  // ... (previous useEffect hooks remain the same)
  return (
    <motion.div
      className="max-w-6xl mx-auto px-4"
      ref={containerRef}
      style={{ opacity, scale }}
    >
      {/* Hero Section */}
      <motion.div
        className="relative min-h-[50vh] flex flex-col items-center justify-center text-center mb-16 py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* ... previous hero section content ... */}
        <motion.h1
          className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {content?.title || defaultAboutUs.title}
        </motion.h1>

        <motion.p
          className="text-xl text-gray-600 max-w-2xl mx-auto mb-12"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {content?.subtitle || defaultAboutUs.subtitle}
        </motion.p>

        {/* ... rest of hero section ... */}
      </motion.div>

      {/* Story Section */}
      <section id="story" ref={storyRef} className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
            Our Story
          </h2>
          <div
            className="prose max-w-3xl mx-auto"
            dangerouslySetInnerHTML={{
              __html: content?.story || defaultAboutUs.story,
            }}
          />
        </motion.div>
      </section>

      {/* Mission & Values Section */}
      <section id="mission" ref={missionRef} className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
            Mission & Values
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h3 className="text-2xl font-semibold mb-4 text-purple-600">
                Our Mission
              </h3>
              <p className="text-gray-700">
                {content?.mission || defaultAboutUs.mission}
              </p>
            </div>

            <div className="bg-white shadow-lg rounded-xl p-6">
              <h3 className="text-2xl font-semibold mb-4 text-purple-600">
                Our Vision
              </h3>
              <p className="text-gray-700">
                {content?.vision || defaultAboutUs.vision}
              </p>
            </div>
          </div>

          <div className="mt-12 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold mb-6 text-center text-purple-600">
              Our Core Values
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {(content?.values || defaultAboutUs.values).map(
                (value, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gray-50 rounded-xl p-6 text-center"
                  >
                    <h4 className="text-xl font-semibold mb-3 text-pink-600">
                      {value.title}
                    </h4>
                    <p className="text-gray-700">{value.description}</p>
                  </motion.div>
                )
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Team Section */}
      <section id="team" ref={teamRef} className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
            Our Leadership Team
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {(content?.team || defaultAboutUs.team).map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white shadow-lg rounded-xl overflow-hidden"
              >
                <div className="relative h-64 w-full">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-purple-600 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-gray-500 mb-4">{member.position}</p>
                  <p className="text-gray-700">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16 mb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            {(content?.stats || defaultAboutUs.stats).map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" ref={contactRef} className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
            Contact Us
          </h2>

          <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8 grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Clock className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-gray-700">
                    Business Hours
                  </h3>
                  <p className="text-gray-600">
                    {content?.contact?.hours || defaultAboutUs.contact.hours}
                  </p>
                </div>
              </div>
              {/* Add other contact details similarly */}
            </div>

            {/* Rest of the contact section */}
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
};

export default AboutUsComponent;
