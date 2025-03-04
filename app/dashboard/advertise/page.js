// app/dashboard/advertise/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";

const AdvertisePage = () => {
  const [ads, setAds] = useState([]);
  const [newAd, setNewAd] = useState({
    title: "",
    description: "",
    imageUrl: "",
    link: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "advertisements"));
      const adsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAds(adsData);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to fetch advertisements");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "advertisements"), {
        ...newAd,
        createdAt: new Date().toISOString(),
      });
      toast.success("Advertisement added successfully");
      setNewAd({
        title: "",
        description: "",
        imageUrl: "",
        link: "",
        startDate: "",
        endDate: "",
      });
      fetchAds();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add advertisement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Advertisement Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add New Advertisement Form */}
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Add New Advertisement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={newAd.title}
                onChange={(e) =>
                  setNewAd((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={newAd.description}
                onChange={(e) =>
                  setNewAd((prev) => ({ ...prev, description: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <Label>Image URL</Label>
              <Input
                type="url"
                value={newAd.imageUrl}
                onChange={(e) =>
                  setNewAd((prev) => ({ ...prev, imageUrl: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <Label>Link</Label>
              <Input
                type="url"
                value={newAd.link}
                onChange={(e) =>
                  setNewAd((prev) => ({ ...prev, link: e.target.value }))
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newAd.startDate}
                  onChange={(e) =>
                    setNewAd((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={newAd.endDate}
                  onChange={(e) =>
                    setNewAd((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Advertisement"}
            </Button>
          </form>
        </div>

        {/* Existing Advertisements */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Current Advertisements</h2>
          <div className="space-y-4">
            {ads.map((ad) => (
              <div key={ad.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{ad.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{ad.description}</p>
                {ad.imageUrl && (
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="mt-2 max-h-40 rounded object-cover"
                  />
                )}
                <div className="mt-2 text-sm text-gray-500">
                  <p>Start: {new Date(ad.startDate).toLocaleDateString()}</p>
                  <p>End: {new Date(ad.endDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertisePage;
