"use client"
import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

// SVG Icons as components
const Icons = {
  Facebook: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  Twitter: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  LinkedIn: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  Pinterest: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12"/>
    </svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
    </svg>
  ),
  Loading: () => (
    <svg className="animate-spin w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
  ExternalLink: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
    </svg>
  ),
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
    </svg>
  ),
  Save: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
    </svg>
  )
};

const socialPlatforms = [
  {
    id: "facebook",
    name: "Facebook",
    placeholder: "https://facebook.com/your-profile",
    color: "bg-blue-500",
    textColor: "text-blue-500",
    bgLight: "bg-blue-50",
    icon: Icons.Facebook
  },
  {
    id: "twitter",
    name: "Twitter",
    placeholder: "https://twitter.com/your-profile",
    color: "bg-sky-500",
    textColor: "text-sky-500",
    bgLight: "bg-sky-50",
    icon: Icons.Twitter
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    placeholder: "https://linkedin.com/in/your-profile",
    color: "bg-blue-600",
    textColor: "text-blue-600",
    bgLight: "bg-blue-50",
    icon: Icons.LinkedIn
  },
  {
    id: "pinterest",
    name: "Pinterest",
    placeholder: "https://pinterest.com/your-profile",
    color: "bg-red-500",
    textColor: "text-red-500",
    bgLight: "bg-red-50",
    icon: Icons.Pinterest
  }
];

const EditDialog = ({ platform, initialValue, onSave, onClose }) => {
  const [value, setValue] = useState(initialValue);
  const [isValid, setIsValid] = useState(true);
  const Icon = platform.icon;

  const handleSave = () => {
    try {
      new URL(value);
      onSave(value);
      onClose();
    } catch {
      setIsValid(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Icon />
          Edit {platform.name} Link
        </DialogTitle>
        <DialogDescription>
          Update your {platform.name} profile URL
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            type="url"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={platform.placeholder}
            className={`border-2 ${!isValid ? "border-red-500" : ""}`}
          />
          {!isValid && (
            <span className="text-sm text-red-500">
              Please enter a valid URL
            </span>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className={platform.color}>
            Save Changes
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

const PreviewCard = ({ url, platform }) => {
  if (!url) return null;
  const Icon = platform.icon;

  return (
    <div className={`mt-2 p-4 rounded-lg ${platform.bgLight} border border-opacity-50 hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon />
          <span className="text-sm font-medium truncate max-w-xs">{url}</span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2 rounded-full hover:${platform.bgLight} transition-all duration-300`}
        >
          <Icons.ExternalLink />
        </a>
      </div>
    </div>
  );
};

const ConnectionStatus = ({ isValid, isChecking }) => {
  if (isChecking) {
    return (
      <div className="flex items-center space-x-2 text-yellow-600">
        <Icons.Loading />
        <span className="text-sm font-medium">Checking connection...</span>
      </div>
    );
  }

  if (isValid) {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <Icons.Check />
        <span className="text-sm font-medium">Connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-gray-400">
      <Icons.Alert />
      <span className="text-sm font-medium">Not connected</span>
    </div>
  );
};

const SocialLinkCard = ({
  platform,
  value,
  onChange,
  onDelete,
  isValid,
  isChecking
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const Icon = platform.icon;

  return (
    <>
      <div className="rounded-xl border transition-all duration-300 hover:shadow-lg">
        <div className={`p-6 ${platform.color} bg-opacity-10 border-b border-opacity-50`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 ${platform.color} bg-opacity-20 rounded-xl`}>
                <Icon />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {platform.name}
                </h3>
                <ConnectionStatus isValid={isValid} isChecking={isChecking} />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-gray-100"
                onClick={() => setShowEditDialog(true)}
              >
                <Icons.Edit />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-red-50"
                onClick={onDelete}
              >
                <Icons.Trash />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {value && <PreviewCard url={value} platform={platform} />}
        </div>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <EditDialog
          platform={platform}
          initialValue={value || ""}
          onSave={(newValue) => onChange(platform.id, newValue)}
          onClose={() => setShowEditDialog(false)}
        />
      </Dialog>
    </>
  );
};

const EnhancedSocialLinks = () => {
  const [settings, setSettings] = useState({
    facebook: "",
    twitter: "",
    linkedin: "",
    pinterest: ""
  });
  const [loading, setLoading] = useState(false);
  const [validUrls, setValidUrls] = useState({});
  const [checkingUrls, setCheckingUrls] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    validateUrls(settings);
  }, []);

  const validateUrls = async (urls) => {
    const validations = {};
    const checking = {};

    Object.entries(urls).forEach(([platform, url]) => {
      if (url) {
        checking[platform] = true;
        setCheckingUrls({ ...checking });

        try {
          new URL(url);
          validations[platform] = true;
        } catch {
          validations[platform] = false;
        }
        checking[platform] = false;
      } else {
        validations[platform] = false;
        checking[platform] = false;
      }
    });

    setValidUrls(validations);
    setCheckingUrls(checking);
  };

  const handleChange = (platform, value) => {
    const newSettings = {
      ...settings,
      [platform]: value
    };
    setSettings(newSettings);
    validateUrls({ [platform]: value });
    setHasChanges(true);
  };

  const handleDelete = (platform) => {
    const newSettings = {
      ...settings,
      [platform]: ""
    };
    setSettings(newSettings);
    setHasChanges(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setHasChanges(false);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
          Social Media Dashboard
        </h1>
        <p className="text-xl text-gray-600">
          Manage your social media presence in one place
        </p>
      </div>

      {hasChanges && (
        <Alert className="bg-yellow-50 border-yellow-100">
          <Icons.Alert className="text-yellow-600" />
          <AlertDescription className="text-yellow-600 text-lg">
            You have unsaved changes. Don't forget to save!
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {socialPlatforms.map((platform) => (
            <SocialLinkCard
              key={platform.id}
              platform={platform}
              value={settings[platform.id]}
              onChange={handleChange}
              onDelete={() => handleDelete(platform.id)}
              isValid={validUrls[platform.id]}
              isChecking={checkingUrls[platform.id]}
            />
          ))}
        </div>

        <div className="sticky bottom-6">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white hover:opacity-90 h-14 text-xl font-medium shadow-lg transition-all duration-300"
            disabled={loading || !hasChanges}
          >
            {loading ? (
              <>
                <Icons.Loading className="w-7 h-7 mr-3" />
                Saving Changes...
              </>
            ) : (
              <>
                <Icons.Save className="w-7 h-7 mr-3" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedSocialLinks;