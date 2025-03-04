"use client";
import React, { useState } from "react";
import { MessageSquare, Phone, Send, ArrowRight, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const ContactPage = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    business: "",
    phone: "",
    email: "",
    details: "",
    address: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with Circle Design */}
      <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 py-16 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10 ">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Help & Support
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            BharatMatrimony is eager to help you find your partner at the
            earliest. Our customer service team will be pleased to assist you
            anytime you have a query.
          </p>
        </div>
        {/* Animated Background Elements */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 transform rotate-12 transition-transform duration-1000 hover:rotate-45">
          <div className="w-40 h-40 rounded-full border-8 border-pink-200/60 relative animate-pulse">
            <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-yellow-200/40 animate-pulse delay-100"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Tabs */}
        <Tabs defaultValue="contact" className="space-y-8">
          <TabsList className="border-b w-full justify-start h-auto p-0 bg-transparent space-x-8">
            <TabsTrigger
              value="contact"
              className="border-b-2 border-transparent data-[state=active]:border-pink-500 data-[state=active]:text-pink-600 pb-2 rounded-none bg-transparent hover:text-pink-400 transition-colors"
            >
              Contact Us
            </TabsTrigger>
            <TabsTrigger
              value="business"
              className="border-b-2 border-transparent data-[state=active]:border-pink-500 data-[state=active]:text-pink-600 pb-2 rounded-none bg-transparent hover:text-pink-400 transition-colors"
            >
              Business Enquiries
            </TabsTrigger>
          </TabsList>

          {/* Contact Us Content */}
          <TabsContent value="contact" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Helpline Numbers Card */}
              <Card
                className="transform transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
                onMouseEnter={() => setHoveredCard("helpline")}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-6 text-gray-900">
                    Helpline Numbers
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center transform transition-transform group-hover:rotate-12">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">INDIA</div>
                        <div className="font-medium text-lg group-hover:text-pink-500 transition-colors">
                          0-8144-99-88-77
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center transform transition-transform group-hover:rotate-12">
                      <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">UAE</div>
                        <div className="font-medium text-lg group-hover:text-pink-500 transition-colors">
                          +971 525060879
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Queries Card */}
              <Card
                className="transform transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
                onMouseEnter={() => setHoveredCard("payment")}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-6 text-gray-900">
                    For payment related queries
                  </h3>
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center transform transition-transform group-hover:rotate-12">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div className="font-medium text-lg group-hover:text-green-500 transition-colors">
                      Call +91 7538895777
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Support Card */}
            <Card
              className="transform transition-all duration-500 hover:shadow-xl bg-gradient-to-r from-pink-50 to-purple-50"
              onMouseEnter={() => setHoveredCard("chat")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center transform transition-transform duration-500 hover:rotate-12">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Chat live with our customer service team
                      </h3>
                      <p className="text-gray-600">Get answers instantly</p>
                    </div>
                  </div>
                  <button className="group bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all duration-300 flex items-center gap-2">
                    Chat Now
                    <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Enquiries Content */}
          <TabsContent value="business">
            <Card className="p-8 hover:shadow-xl transition-shadow duration-300">
              <form
                onSubmit={handleSubmit}
                className="max-w-3xl mx-auto space-y-6"
              >
                <p className="text-sm text-pink-500">
                  *All fields are mandatory
                </p>

                {/* Name and Organization */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Your Name <span className="text-pink-500">*</span>
                    </label>
                    <Input
                      required
                      name="name"
                      placeholder="Enter your name"
                      className="w-full transition-all duration-300 focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Organisation / Company{" "}
                      <span className="text-pink-500">*</span>
                    </label>
                    <Input
                      required
                      name="organization"
                      placeholder="Enter your organization name"
                      className="w-full transition-all duration-300 focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                {/* Business and Phone */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Nature of Business{" "}
                      <span className="text-pink-500">*</span>
                    </label>
                    <Input
                      required
                      name="business"
                      placeholder="Enter nature of business"
                      className="w-full transition-all duration-300 focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Contact Phone <span className="text-pink-500">*</span>
                    </label>
                    <Input
                      required
                      name="phone"
                      type="tel"
                      placeholder="Enter contact number"
                      className="w-full transition-all duration-300 focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    E-mail <span className="text-pink-500">*</span>
                  </label>
                  <Input
                    required
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full transition-all duration-300 focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                {/* Contact Address */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Contact Address <span className="text-pink-500">*</span>
                  </label>
                  <Textarea
                    required
                    name="address"
                    placeholder="Enter your complete address"
                    className="w-full min-h-[100px] transition-all duration-300 focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                {/* Partnership Details */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Details / Queries about Partnership{" "}
                    <span className="text-pink-500">*</span>
                  </label>
                  <Textarea
                    required
                    name="details"
                    placeholder="Enter your partnership queries or details"
                    className="w-full min-h-[100px] transition-all duration-300 focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <button
                  type="submit"
                  className="group bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-full hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  <span>Submit Enquiry</span>
                  <Send className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
                </button>

                <div className="pt-4 text-sm">
                  <p className="text-gray-600 font-medium">
                    FOR MORE DETAILS, CONTACT
                  </p>
                  <a
                    href="mailto:partnership@bharatmatrimony.com"
                    className="text-pink-600 hover:text-pink-700 transition-colors hover:underline"
                  >
                    partnership@bharatmatrimony.com
                  </a>
                </div>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ContactPage;
