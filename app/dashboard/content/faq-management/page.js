"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  Loader2,
  MoveUp,
  MoveDown,
  MoreHorizontal,
  X,
  Save,
  Eye,
  ChevronDown,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const FAQAdmin = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewOpenIndex, setPreviewOpenIndex] = useState(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const faqCollection = collection(db, "faqs");
      const q = query(faqCollection, orderBy("order", "asc"));
      const faqSnapshot = await getDocs(q);

      if (!faqSnapshot.empty) {
        const fetchedFaqs = faqSnapshot.docs.map((doc, index) => ({
          id: doc.id,
          question: doc.data().question || "",
          answer: doc.data().answer || "",
          order: doc.data().order || index,
        }));
        setFaqs(fetchedFaqs);
      } else {
        // Start with an empty FAQ if none exist
        setFaqs([{ id: generateId(), question: "", answer: "", order: 0 }]);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      toast.error("Failed to load FAQs");
      // Start with an empty FAQ on error
      setFaqs([{ id: generateId(), question: "", answer: "", order: 0 }]);
    } finally {
      setLoading(false);
    }
  };

  const generateId = () => {
    // Generate a temporary client-side ID
    return "temp-" + Math.random().toString(36).substring(2, 15);
  };

  const handleAddFaq = () => {
    const newFaq = {
      id: generateId(),
      question: "",
      answer: "",
      order: faqs.length,
    };
    setFaqs([...faqs, newFaq]);
  };

  const handleRemoveFaq = (index) => {
    const newFaqs = [...faqs];
    newFaqs.splice(index, 1);

    // Update order for remaining FAQs
    newFaqs.forEach((faq, idx) => {
      faq.order = idx;
    });

    setFaqs(newFaqs);
  };

  const handleFaqChange = (index, field, value) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  const handleMoveFaq = (index, direction) => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === faqs.length - 1)
    ) {
      return;
    }

    const newFaqs = [...faqs];
    const swapIndex = direction === "up" ? index - 1 : index + 1;

    // Swap the FAQs
    [newFaqs[index], newFaqs[swapIndex]] = [newFaqs[swapIndex], newFaqs[index]];

    // Update order for all FAQs
    newFaqs.forEach((faq, idx) => {
      faq.order = idx;
    });

    setFaqs(newFaqs);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(faqs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order for all items
    items.forEach((faq, index) => {
      faq.order = index;
    });

    setFaqs(items);
  };

  const validateFaqs = () => {
    const invalidFaqs = faqs.filter(
      (faq) => !faq.question.trim() || !faq.answer.trim()
    );
    return invalidFaqs.length === 0;
  };

  const saveFaqs = async () => {
    if (!validateFaqs()) {
      toast.error("All FAQs must have both a question and an answer");
      return;
    }

    setSaving(true);
    try {
      // Get existing FAQs to find ones that need to be deleted
      const faqCollection = collection(db, "faqs");
      const faqSnapshot = await getDocs(faqCollection);
      const existingFaqIds = faqSnapshot.docs.map((doc) => doc.id);

      // Find IDs to delete (exist in database but not in current state)
      const currentFaqIds = faqs
        .map((faq) => faq.id)
        .filter((id) => !id.startsWith("temp-"));
      const idsToDelete = existingFaqIds.filter(
        (id) => !currentFaqIds.includes(id)
      );

      // Delete removed FAQs
      for (const id of idsToDelete) {
        await deleteDoc(doc(db, "faqs", id));
      }

      // Update or create FAQs
      for (const faq of faqs) {
        const faqData = {
          question: faq.question.trim(),
          answer: faq.answer.trim(),
          order: faq.order,
          updatedAt: new Date(),
        };

        if (faq.id.startsWith("temp-")) {
          // Create new doc for temporary IDs
          const newDocRef = doc(collection(db, "faqs"));
          await setDoc(newDocRef, faqData);
        } else {
          // Update existing doc
          await setDoc(doc(db, "faqs", faq.id), faqData);
        }
      }

      toast.success("FAQs saved successfully");
      // Refresh to get new IDs
      fetchFaqs();
    } catch (error) {
      console.error("Error saving FAQs:", error);
      toast.error("Failed to save FAQs");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-500" />
          <p className="mt-4 text-gray-600">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  const FAQCard = ({ faq, index, provided }) => (
    <div
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div {...provided?.dragHandleProps} className="p-1 cursor-grab">
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              FAQ #{index + 1}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleMoveFaq(index, "up")}
              disabled={index === 0}
              className="text-gray-500 hover:text-blue-600"
            >
              <MoveUp className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleMoveFaq(index, "down")}
              disabled={index === faqs.length - 1}
              className="text-gray-500 hover:text-blue-600"
            >
              <MoveDown className="w-4 h-4" />
            </Button>
            {faqs.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFaq(index)}
                className="text-gray-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor={`question-${index}`} className="text-gray-700">
              Question
            </Label>
            <Input
              id={`question-${index}`}
              value={faq.question}
              onChange={(e) =>
                handleFaqChange(index, "question", e.target.value)
              }
              placeholder="Enter FAQ question"
              className="mt-1 w-full"
            />
          </div>

          <div>
            <Label htmlFor={`answer-${index}`} className="text-gray-700">
              Answer
            </Label>
            <Textarea
              id={`answer-${index}`}
              value={faq.answer}
              onChange={(e) => handleFaqChange(index, "answer", e.target.value)}
              placeholder="Enter FAQ answer"
              className="mt-1 w-full"
              rows={4}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const Preview = () => (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">FAQ Preview</h2>
          <Button
            onClick={() => setPreviewMode(false)}
            variant="ghost"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) =>
            faq.question && faq.answer ? (
              <div
                key={faq.id}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setPreviewOpenIndex(
                      previewOpenIndex === index ? null : index
                    )
                  }
                  className="w-full p-5 text-left flex justify-between items-center bg-white"
                >
                  <span className="font-medium text-gray-800">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                      previewOpenIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {previewOpenIndex === index && (
                  <div className="p-5 bg-gradient-to-r from-blue-50 to-purple-50">
                    <p className="text-gray-600 whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ) : null
          )}

          {faqs.filter((faq) => faq.question && faq.answer).length === 0 && (
            <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">No complete FAQs to preview</p>
              <p className="text-sm text-gray-400 mt-2">
                Add questions and answers to see them here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage FAQs</h1>
          <p className="text-gray-500 mt-1">
            Add, edit, or remove frequently asked questions
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setPreviewMode(true)}
            variant="outline"
            className="text-gray-700"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            onClick={saveFaqs}
            disabled={saving}
            className="bg-blue-600 text-white hover:bg-blue-700"
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
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="faqs">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4 mb-6"
            >
              <AnimatePresence>
                {faqs.map((faq, index) => (
                  <Draggable key={faq.id} draggableId={faq.id} index={index}>
                    {(provided) => (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FAQCard faq={faq} index={index} provided={provided} />
                      </motion.div>
                    )}
                  </Draggable>
                ))}
              </AnimatePresence>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Button
        onClick={handleAddFaq}
        variant="outline"
        className="mt-4 border-dashed border-gray-300 hover:border-blue-500 hover:text-blue-600"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add New FAQ
      </Button>

      {previewMode && <Preview />}
    </div>
  );
};

export default FAQAdmin;
