"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  Save,
  Eye,
  X,
  Info,
  Layout,
  Trash2,
} from "lucide-react";

const positions = [
  { value: "center", label: "Center", icon: "⋅" },
  { value: "top-left", label: "Top Left", icon: "↖" },
  { value: "top-right", label: "Top Right", icon: "↗" },
  { value: "bottom-left", label: "Bottom Left", icon: "↙" },
  { value: "bottom-right", label: "Bottom Right", icon: "↘" },
];

const WatermarkPreview = ({ settings, demoImage }) => (
  <div className="relative border rounded-lg overflow-hidden aspect-video bg-gray-100">
    <img
      src={demoImage || "/placeholder-image.jpg"}
      alt="Demo"
      className="w-full h-full object-cover"
    />
    {settings.enabled && settings.imageUrl && (
      <div
        className={`absolute ${
          settings.position === "center"
            ? "inset-0 flex items-center justify-center"
            : settings.position === "top-left"
            ? "top-4 left-4"
            : settings.position === "top-right"
            ? "top-4 right-4"
            : settings.position === "bottom-left"
            ? "bottom-4 left-4"
            : "bottom-4 right-4"
        }`}
        style={{ opacity: settings.opacity }}
      >
        <img
          src={settings.imageUrl}
          alt="Watermark"
          className="max-w-[150px] max-h-[150px] object-contain"
        />
      </div>
    )}
  </div>
);

const SettingSection = ({ title, description, children, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden"
  >
    <div className="p-4 border-b border-gray-100 bg-gray-50">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
    <div className="p-4">{children}</div>
  </motion.div>
);

const WatermarkSettings = () => {
  const [settings, setSettings] = useState({
    enabled: false,
    imageUrl: "",
    opacity: 0.5,
    position: "center",
    storagePath: "",
  });

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [previewDemo, setPreviewDemo] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, "siteSettings", "watermark");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    };
    fetchSettings();
  }, []);

  const handleImageUpload = async (e, auth) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    setUploadProgress(true);

    try {
      console.log("Starting upload process...");

      // Delete old image if exists
      if (settings.storagePath) {
        try {
          const oldImageRef = ref(storage, settings.storagePath);
          await deleteObject(oldImageRef);
          console.log("Old image deleted successfully");
        } catch (error) {
          console.error("Error deleting old image:", error);
        }
      }

      // Generate unique filename
      const uniqueId = Date.now().toString();
      const fileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const storagePath = `watermarks/watermark_${uniqueId}_${fileName}`;
      console.log("Storage path:", storagePath);

      // Create storage reference
      const storageRef = ref(storage, storagePath);
      console.log("Storage reference created");

      // Upload file
      const uploadResult = await uploadBytes(storageRef, file);
      console.log("File uploaded successfully:", uploadResult);

      // Get download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log("Download URL obtained:", downloadURL);

      setSettings((prev) => ({
        ...prev,
        imageUrl: downloadURL,
        storagePath: storagePath,
      }));

      toast.success("Watermark uploaded successfully");
    } catch (error) {
      console.error("Detailed upload error:", error);
      toast.error(error.message || "Failed to upload watermark");
    }

    setUploadProgress(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, "siteSettings", "watermark"), settings);
      toast.success("Watermark settings updated successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update settings");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Watermark Settings
          </h1>
          <p className="text-gray-600">
            Configure image watermark settings for your website
          </p>
        </div>
        <Button
          onClick={() => setPreviewDemo(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Preview
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <SettingSection
          title="Enable Watermark"
          description="Toggle watermark functionality"
          icon={Layout}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Watermark Status</h4>
              <p className="text-sm text-gray-600">
                {settings.enabled
                  ? "Watermark is active"
                  : "Watermark is disabled"}
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, enabled: checked }))
              }
            />
          </div>
        </SettingSection>

        <SettingSection
          title="Watermark Image"
          description="Upload and manage your watermark image"
          icon={ImageIcon}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="watermark-upload"
                disabled={!settings.enabled}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() =>
                  document.getElementById("watermark-upload").click()
                }
                disabled={!settings.enabled || uploadProgress}
              >
                {uploadProgress ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Watermark
                  </>
                )}
              </Button>
              {settings.imageUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-red-500 hover:text-red-600"
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      imageUrl: "",
                      storagePath: "",
                    }))
                  }
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            {settings.imageUrl && (
              <div className="relative group">
                <img
                  src={settings.imageUrl}
                  alt="Watermark"
                  className="max-h-40 object-contain rounded border p-2"
                />
              </div>
            )}
          </div>
        </SettingSection>

        <SettingSection
          title="Watermark Configuration"
          description="Adjust watermark appearance settings"
          icon={Info}
        >
          <div className="space-y-6">
            <div>
              <Label>Opacity ({Math.round(settings.opacity * 100)}%)</Label>
              <Input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.opacity}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    opacity: parseFloat(e.target.value),
                  }))
                }
                disabled={!settings.enabled}
                className="w-full"
              />
            </div>

            <div>
              <Label>Position</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {positions.map((pos) => (
                  <Button
                    key={pos.value}
                    type="button"
                    variant={
                      settings.position === pos.value ? "default" : "outline"
                    }
                    className={`h-20 ${
                      settings.position === pos.value ? "border-2" : ""
                    }`}
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, position: pos.value }))
                    }
                    disabled={!settings.enabled}
                  >
                    <div className="text-center">
                      <div className="text-xl mb-1">{pos.icon}</div>
                      <div className="text-xs">{pos.label}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </SettingSection>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Watermark Preview</h2>
                <Button variant="ghost" onClick={() => setPreviewDemo(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <WatermarkPreview settings={settings} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WatermarkSettings;
