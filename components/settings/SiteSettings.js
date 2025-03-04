// components/settings/SiteSettings.js
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SiteSettings = () => {
  const settings = [
    {
      title: "Update Favicon & Logo",
      fields: [
        { type: "file", label: "Favicon", name: "favicon" },
        { type: "file", label: "Logo", name: "logo" }
      ]
    },
    {
      title: "Update Home Page Banner",
      fields: [
        { type: "file", label: "Banner Image", name: "banner" },
        { type: "text", label: "Banner Title", name: "bannerTitle" },
        { type: "textarea", label: "Banner Description", name: "bannerDescription" }
      ]
    },
    {
      title: "Update Watermark",
      fields: [
        { type: "file", label: "Watermark Image", name: "watermark" },
        { type: "number", label: "Opacity", name: "watermarkOpacity" }
      ]
    },
    {
      title: "Enable/Disable Fields",
      fields: [
        { type: "switch", label: "Profile Photo", name: "enableProfilePhoto" },
        { type: "switch", label: "Contact Info", name: "enableContactInfo" },
        { type: "switch", label: "Horoscope", name: "enableHoroscope" }
      ]
    },
    {
      title: "Update Email Settings",
      fields: [
        { type: "email", label: "SMTP Host", name: "smtpHost" },
        { type: "text", label: "SMTP Username", name: "smtpUsername" },
        { type: "password", label: "SMTP Password", name: "smtpPassword" },
        { type: "number", label: "SMTP Port", name: "smtpPort" }
      ]
    }
  ];

  const renderField = (field) => {
    switch (field.type) {
      case 'file':
        return (
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input type="file" id={field.name} />
          </div>
        );
      case 'switch':
        return (
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Switch id={field.name} />
          </div>
        );
      default:
        return (
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input type={field.type} id={field.name} placeholder={field.label} />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Site Settings</h2>
        <Button>Save Changes</Button>
      </div>

      <div className="space-y-6">
        {settings.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  {renderField(field)}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SiteSettings;