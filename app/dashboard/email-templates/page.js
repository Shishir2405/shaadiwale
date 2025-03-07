"use client";

import React, { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  Loader2,
  Search,
  Mail,
  Send,
  FileText,
  Save,
  Trash2,
  Plus,
  AlertTriangle,
  Check,
  Users,
} from "lucide-react";
import Link from "next/link";

// Email template editor component
const EmailEditor = ({ template, onChange, onSave }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-pink-50 rounded-lg">
            <FileText className="w-5 h-5 text-pink-500" />
          </div>
          <h2 className="font-semibold text-gray-900">Email Template</h2>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Template Name
          </label>
          <input
            type="text"
            value={template.name}
            onChange={(e) => onChange({ ...template, name: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
            placeholder="Welcome Email"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Subject Line
          </label>
          <input
            type="text"
            value={template.subject}
            onChange={(e) => onChange({ ...template, subject: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
            placeholder="Welcome to our platform!"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Email Content
          </label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-2 border-b border-gray-300 flex items-center space-x-1">
              <button className="p-1 rounded hover:bg-white">
                <span className="font-bold">B</span>
              </button>
              <button className="p-1 rounded hover:bg-white">
                <span className="italic">I</span>
              </button>
              <button className="p-1 rounded hover:bg-white">
                <span className="underline">U</span>
              </button>
              <span className="border-r border-gray-300 h-6 mx-1"></span>
              <button className="p-1 rounded hover:bg-white text-xs">H1</button>
              <button className="p-1 rounded hover:bg-white text-xs">H2</button>
            </div>
            <textarea
              value={template.content}
              onChange={(e) =>
                onChange({ ...template, content: e.target.value })
              }
              className="w-full p-3 min-h-[300px] focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Write your email content here... You can use variables like {{firstName}} {{lastName}} which will be replaced with user data."
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={() => onSave(template)}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Template</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// User selection component
const UserSelector = ({ users, selectedUsers, onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName || ""} ${
      user.lastName || ""
    }`.toLowerCase();
    const email = (user.email || "").toLowerCase();
    const phone = (user.phone || "").toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    return (
      fullName.includes(searchLower) ||
      email.includes(searchLower) ||
      phone.includes(searchLower)
    );
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-pink-50 rounded-lg">
            <Users className="w-5 h-5 text-pink-500" />
          </div>
          <h2 className="font-semibold text-gray-900">Select Recipients</h2>
        </div>

        <div className="mt-3 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {selectedUsers.length} user(s) selected
          </span>
          <button
            onClick={() => onSelectUser("all", filteredUsers)}
            className="text-xs bg-pink-50 text-pink-600 px-2 py-1 rounded hover:bg-pink-100 transition-colors"
          >
            {selectedUsers.length === filteredUsers.length
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[400px]">
        <ul className="divide-y divide-gray-100">
          {filteredUsers.map((user) => (
            <li key={user.id}>
              <div className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={selectedUsers.some((u) => u.id === user.id)}
                  onChange={() => onSelectUser(user.id)}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <div className="ml-3 flex items-center flex-1 min-w-0">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white">
                    {user.firstName
                      ? user.firstName[0].toUpperCase()
                      : user.email
                      ? user.email[0].toUpperCase()
                      : "U"}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email || "No email available"}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}

          {filteredUsers.length === 0 && (
            <li className="py-4 px-6 text-center text-gray-500">
              No users found matching your search
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

// Templates list component
const TemplatesList = ({
  templates,
  onSelect,
  onDelete,
  selectedTemplateId,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-pink-50 rounded-lg">
              <Mail className="w-5 h-5 text-pink-500" />
            </div>
            <h2 className="font-semibold text-gray-900">Email Templates</h2>
          </div>
          <button
            onClick={() =>
              onSelect({ id: "new", name: "", subject: "", content: "" })
            }
            className="p-1 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-100 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[300px]">
        {templates.length === 0 ? (
          <div className="py-6 text-center text-gray-500">
            <Mail className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p>No templates yet</p>
            <p className="text-sm">Create your first template to get started</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {templates.map((template) => (
              <li key={template.id}>
                <div
                  className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                    selectedTemplateId === template.id ? "bg-pink-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => onSelect(template)}
                    >
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {template.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {template.subject}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(template.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default function EmailTemplatePage() {
  const [user, authLoading] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      try {
        // For demo purposes, just set isAdmin to true to bypass the admin check
        setIsAdmin(true);
        fetchUsers();
        fetchTemplates();

        // In a real app, you would use this code instead:
        // const userDoc = await getDoc(doc(db, 'users', user.uid));
        // if (userDoc.exists() && userDoc.data().role === 'admin') {
        //   setIsAdmin(true);
        //   fetchUsers();
        //   fetchTemplates();
        // } else {
        //   setError("You don't have admin privileges to access this page");
        //   setLoading(false);
        // }
      } catch (err) {
        console.error("Error checking admin status:", err);
        setError("An error occurred while verifying your permissions");
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (user) {
        checkAdminStatus();
      } else {
        setError("You must be logged in to access this page");
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  const fetchUsers = async () => {
    try {
      const usersQuery = query(collection(db, "users"));
      const querySnapshot = await getDocs(usersQuery);

      const usersData = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((user) => user.email); // Only include users with email addresses

      setUsers(usersData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users list");
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const templatesQuery = query(collection(db, "emailTemplates"));
      const querySnapshot = await getDocs(templatesQuery);

      const templatesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTemplates(templatesData);

      // Select the first template if available and none is selected
      if (templatesData.length > 0 && !selectedTemplate) {
        setSelectedTemplate(templatesData[0]);
      }
    } catch (err) {
      console.error("Error fetching templates:", err);
      setError("Failed to load email templates");
    }
  };

  const handleTemplateChange = (updatedTemplate) => {
    setSelectedTemplate(updatedTemplate);
  };

  const handleTemplateSave = async (template) => {
    try {
      if (!template.name || !template.subject) {
        alert("Template name and subject are required");
        return;
      }

      setLoading(true);

      if (template.id === "new") {
        // Create new template
        const templateData = {
          name: template.name,
          subject: template.subject,
          content: template.content,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: user.uid,
        };

        const docRef = await addDoc(
          collection(db, "emailTemplates"),
          templateData
        );
        const newTemplate = { id: docRef.id, ...templateData };

        setTemplates([...templates, newTemplate]);
        setSelectedTemplate(newTemplate);
      } else {
        // Update existing template
        const templateRef = doc(db, "emailTemplates", template.id);
        await updateDoc(templateRef, {
          name: template.name,
          subject: template.subject,
          content: template.content,
          updatedAt: serverTimestamp(),
        });

        // Update templates list
        setTemplates(
          templates.map((t) =>
            t.id === template.id ? { ...t, ...template } : t
          )
        );
      }

      alert("Template saved successfully!");
    } catch (err) {
      console.error("Error saving template:", err);
      alert("Failed to save template: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateDelete = async (templateId) => {
    if (!confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      setLoading(true);

      await deleteDoc(doc(db, "emailTemplates", templateId));

      // Update templates list
      const updatedTemplates = templates.filter((t) => t.id !== templateId);
      setTemplates(updatedTemplates);

      // If the deleted template was selected, select another one
      if (selectedTemplate && selectedTemplate.id === templateId) {
        setSelectedTemplate(
          updatedTemplates.length > 0 ? updatedTemplates[0] : null
        );
      }

      alert("Template deleted successfully!");
    } catch (err) {
      console.error("Error deleting template:", err);
      alert("Failed to delete template: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelection = (userId, usersList = null) => {
    if (userId === "all") {
      // Toggle select all
      if (selectedUsers.length === usersList.length) {
        setSelectedUsers([]);
      } else {
        setSelectedUsers([...usersList]);
      }
      return;
    }

    // Toggle individual user
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (selectedUsers.some((u) => u.id === userId)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleSendEmails = async () => {
    if (!selectedTemplate) {
      alert("Please select a template first");
      return;
    }

    if (selectedUsers.length === 0) {
      alert("Please select at least one recipient");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to send this email to ${selectedUsers.length} user(s)?`
      )
    ) {
      return;
    }

    try {
      setIsSending(true);
      setSendSuccess(false);
      setSendError(null);

      // In a real application, you would call a Firebase Cloud Function here
      // that would process these email requests and send them using a service
      // like SendGrid, Mailgun, or Firebase's built-in email functionality

      // For this demo, we'll just create records in Firestore
      const emailBatch = [];

      for (const recipient of selectedUsers) {
        // Replace template variables with user data
        let personalizedContent = selectedTemplate.content;
        let personalizedSubject = selectedTemplate.subject;

        // Replace variables in content
        personalizedContent = personalizedContent
          .replace(/{{firstName}}/g, recipient.firstName || "")
          .replace(/{{lastName}}/g, recipient.lastName || "")
          .replace(/{{email}}/g, recipient.email || "");

        // Replace variables in subject
        personalizedSubject = personalizedSubject
          .replace(/{{firstName}}/g, recipient.firstName || "")
          .replace(/{{lastName}}/g, recipient.lastName || "")
          .replace(/{{email}}/g, recipient.email || "");

        // Create email record
        const emailData = {
          templateId: selectedTemplate.id,
          recipientId: recipient.id,
          recipientEmail: recipient.email,
          subject: personalizedSubject,
          content: personalizedContent,
          status: "pending",
          createdAt: serverTimestamp(),
          sentBy: user.uid,
        };

        emailBatch.push(addDoc(collection(db, "emailQueue"), emailData));
      }

      // Wait for all email records to be created
      await Promise.all(emailBatch);

      // In a real app, a cloud function would pick up these records and send the actual emails

      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 5000);
    } catch (err) {
      console.error("Error sending emails:", err);
      setSendError("Failed to send emails: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  if (authLoading || (loading && !error)) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
        <div className="mt-4">
          <Link
            href="/dashboard"
            className="text-pink-500 hover:text-pink-700 flex items-center"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>You don't have admin privileges to access this page</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          Email Campaign Manager
        </h1>
        <p className="text-gray-600">
          Create email templates and send them to your users
        </p>
      </div>

      {sendSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <Check className="w-5 h-5 mr-2" />
            <span>Emails have been queued for sending!</span>
          </div>
        </div>
      )}

      {sendError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>{sendError}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <TemplatesList
            templates={templates}
            onSelect={setSelectedTemplate}
            onDelete={handleTemplateDelete}
            selectedTemplateId={selectedTemplate?.id}
          />

          <UserSelector
            users={users}
            selectedUsers={selectedUsers}
            onSelectUser={handleUserSelection}
          />

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-pink-50 rounded-lg">
                  <Send className="w-5 h-5 text-pink-500" />
                </div>
                <h2 className="font-semibold text-gray-900">Send Campaign</h2>
              </div>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Selected Template:
                  </span>
                  <span className="text-sm text-gray-600">
                    {selectedTemplate?.name || "None"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Recipients:
                  </span>
                  <span className="text-sm text-gray-600">
                    {selectedUsers.length} user(s)
                  </span>
                </div>
              </div>

              <button
                onClick={handleSendEmails}
                disabled={
                  isSending || !selectedTemplate || selectedUsers.length === 0
                }
                className={`w-full py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg 
                  hover:from-pink-600 hover:to-purple-700 transition-colors flex items-center justify-center gap-2
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Emails</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {selectedTemplate ? (
            <EmailEditor
              template={selectedTemplate}
              onChange={handleTemplateChange}
              onSave={handleTemplateSave}
            />
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-50 text-pink-500 mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Template Selected
              </h3>
              <p className="text-gray-500 mb-6">
                Select an existing template from the sidebar or create a new one
                to get started
              </p>
              <button
                onClick={() =>
                  setSelectedTemplate({
                    id: "new",
                    name: "",
                    subject: "",
                    content: "",
                  })
                }
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Template</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
