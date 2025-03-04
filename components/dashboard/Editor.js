"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Loader2, Save, Eye, ArrowLeft, Info, Copy } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Color from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";

// Default policy content in HTML format
const defaultPolicy = `<h1>Refund Policy</h1>
<h2>Overview</h2>
<p>We strive for 100% customer satisfaction. If you're not satisfied with your purchase, we offer a straightforward refund policy.</p>

<h2>Eligibility</h2>
<ul>
  <li>Products must be returned within 30 days of purchase</li>
  <li>Items must be in original packaging and unused</li>
  <li>Proof of purchase is required</li>
</ul>

<h2>How to Request a Refund</h2>
<ol>
  <li>Contact our customer service team at support@example.com</li>
  <li>Provide your order number and reason for return</li>
  <li>Follow the return instructions provided by our team</li>
</ol>

<h2>Processing Time</h2>
<ul>
  <li>Refunds are typically processed within 5-7 business days</li>
  <li>Credit card refunds may take an additional 2-5 business days to appear on your statement</li>
</ul>

<h2>Exceptions</h2>
<ul>
  <li>Digital products and services cannot be refunded once accessed</li>
  <li>Customized products are non-refundable unless defective</li>
  <li>Sale items are final and cannot be refunded</li>
</ul>

<p>For any questions about our refund policy, please contact our customer service team.</p>`;

// Toolbar Button Component
const MenuButton = ({ onClick, active, disabled, children, title }) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-md transition-colors ${
        active
          ? "bg-pink-100 text-pink-600"
          : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
};

const TiptapPolicyEditor = ({
  policyType = "refundPolicy",
  policyTitle = "Refund Policy",
}) => {
  const [policyContent, setPolicyContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Color,
      TextStyle,
    ],
    content: policyContent || defaultPolicy,
    onUpdate: ({ editor }) => {
      setPolicyContent(editor.getHTML());
    },
  });

  // Get the document reference based on policy type
  const getPolicyRef = () => {
    return doc(db, "policies", policyType);
  };

  useEffect(() => {
    const fetchPolicyContent = async () => {
      setLoading(true);
      try {
        const policyRef = getPolicyRef();
        const policyDoc = await getDoc(policyRef);

        if (policyDoc.exists() && policyDoc.data().content) {
          setPolicyContent(policyDoc.data().content);
          if (editor) {
            editor.commands.setContent(policyDoc.data().content);
          }
          if (policyDoc.data().updatedAt) {
            setLastSaved(new Date(policyDoc.data().updatedAt.toDate()));
          }
        } else {
          // Use default policy if no data found
          setPolicyContent(defaultPolicy);
          if (editor) {
            editor.commands.setContent(defaultPolicy);
          }
        }
      } catch (err) {
        console.error(`Error fetching ${policyTitle}:`, err);
        toast.error(`Failed to load ${policyTitle.toLowerCase()}`);
        // Use default policy on error
        setPolicyContent(defaultPolicy);
        if (editor) {
          editor.commands.setContent(defaultPolicy);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPolicyContent();
  }, [editor, policyType, policyTitle]);

  const handleSave = async () => {
    if (!policyContent.trim()) {
      toast.error("Policy content cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const policyRef = getPolicyRef();
      await setDoc(policyRef, {
        content: policyContent,
        updatedAt: new Date(),
      });

      toast.success(`${policyTitle} saved successfully`);
      setLastSaved(new Date());
    } catch (err) {
      console.error(`Error saving ${policyTitle.toLowerCase()}:`, err);
      toast.error(`Failed to save ${policyTitle.toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (
      window.confirm(
        `Are you sure you want to reset to the default ${policyTitle.toLowerCase()}? This will discard all your changes.`
      )
    ) {
      setPolicyContent(defaultPolicy);
      if (editor) {
        editor.commands.setContent(defaultPolicy);
      }
      toast.success(`Reset to default ${policyTitle.toLowerCase()}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-pink-500" />
          <p className="mt-4 text-gray-600">
            Loading {policyTitle.toLowerCase()} editor...
          </p>
        </div>
      </div>
    );
  }

  // Toolbar component
  const MenuBar = ({ editor }) => {
    if (!editor) {
      return null;
    }

    return (
      <div className="border-b border-gray-200 p-2 bg-white rounded-t-xl flex flex-wrap gap-1">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <span className="font-bold">B</span>
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <span className="italic">I</span>
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <span className="underline">U</span>
        </MenuButton>
        <div className="w-px h-6 bg-gray-200 mx-1"></div>
        <MenuButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          H1
        </MenuButton>
        <MenuButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          H2
        </MenuButton>
        <MenuButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          H3
        </MenuButton>
        <div className="w-px h-6 bg-gray-200 mx-1"></div>
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="10" y1="6" x2="21" y2="6"></line>
            <line x1="10" y1="12" x2="21" y2="12"></line>
            <line x1="10" y1="18" x2="21" y2="18"></line>
            <path d="M4 6h1v4"></path>
            <path d="M4 10h2"></path>
            <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
          </svg>
        </MenuButton>
        <div className="w-px h-6 bg-gray-200 mx-1"></div>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="17" y1="10" x2="3" y2="10"></line>
            <line x1="21" y1="6" x2="3" y2="6"></line>
            <line x1="21" y1="14" x2="3" y2="14"></line>
            <line x1="17" y1="18" x2="3" y2="18"></line>
          </svg>
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="10" x2="6" y2="10"></line>
            <line x1="21" y1="6" x2="3" y2="6"></line>
            <line x1="21" y1="14" x2="3" y2="14"></line>
            <line x1="18" y1="18" x2="6" y2="18"></line>
          </svg>
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="21" y1="10" x2="7" y2="10"></line>
            <line x1="21" y1="6" x2="3" y2="6"></line>
            <line x1="21" y1="14" x2="3" y2="14"></line>
            <line x1="21" y1="18" x2="7" y2="18"></line>
          </svg>
        </MenuButton>
        <div className="w-px h-6 bg-gray-200 mx-1"></div>
        <MenuButton
          onClick={() => {
            const url = window.prompt("Enter URL");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          active={editor.isActive("link")}
          title="Insert Link"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive("link")}
          title="Remove Link"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </MenuButton>
      </div>
    );
  };

  const EditorInfo = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Rich Text Editor Guide
          </h2>
          <Button
            onClick={() => setShowInfoModal(false)}
            variant="ghost"
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              Text Formatting
            </h3>
            <p className="text-gray-600 mb-2">
              Use the toolbar to format your text. You can make text{" "}
              <strong>bold</strong>, <em>italic</em>, or <u>underlined</u>.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              Headers
            </h3>
            <p className="text-gray-600 mb-2">
              Use H1, H2, and H3 buttons to create headings of different sizes
              for section titles.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Lists</h3>
            <p className="text-gray-600 mb-2">
              Create ordered (numbered) or unordered (bullet) lists using the
              list buttons.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Links</h3>
            <p className="text-gray-600 mb-2">
              Select text and click the link button to add a hyperlink.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              Text Alignment
            </h3>
            <p className="text-gray-600 mb-2">
              Align your text left, center, or right using the alignment
              buttons.
            </p>
          </div>

          <div>
            <Button
              onClick={() => setShowInfoModal(false)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
            >
              Got It
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const PolicyPreview = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {policyTitle} Preview
          </h2>
          <Button
            onClick={() => setShowPreview(false)}
            variant="ghost"
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        <div className="prose max-w-none border rounded-lg p-6 bg-gray-50">
          <div dangerouslySetInnerHTML={{ __html: policyContent }} />
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => setShowPreview(false)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
          >
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
          Edit {policyTitle}
        </h1>
        <p className="text-gray-500 mt-1">
          Update your {policyTitle.toLowerCase()} using the rich text editor
        </p>
        {lastSaved && (
          <p className="text-gray-400 text-sm mt-1">
            Last saved: {lastSaved.toLocaleString()}
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-pink-100">
        <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowInfoModal(true)}
              variant="ghost"
              className="text-gray-600 hover:text-pink-600"
              size="sm"
            >
              <Info className="w-4 h-4 mr-1" />
              Editor Help
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() =>
                navigator.clipboard.writeText(
                  editor?.getHTML().replace(/<[^>]*>/g, "") || ""
                )
              }
              variant="outline"
              size="sm"
              className="text-gray-600 border-pink-200 hover:border-pink-400"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy Text
            </Button>
            <Button
              onClick={handleResetToDefault}
              variant="outline"
              size="sm"
              className="text-gray-600 border-pink-200 hover:border-pink-400"
            >
              Reset to Default
            </Button>
          </div>
        </div>

        <MenuBar editor={editor} />

        <div className="border-t border-gray-100">
          <EditorContent editor={editor} className="min-h-[450px] p-4" />
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <Button
          onClick={() => setShowPreview(true)}
          variant="outline"
          className="text-gray-700 border-pink-200 hover:border-pink-400"
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {showPreview && <PolicyPreview />}
      {showInfoModal && <EditorInfo />}
    </div>
  );
};

export default TiptapPolicyEditor;
