"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, Edit, Trash2 } from "lucide-react";

export default function AdCard({ ad, onDelete }) {
  // Format date nicely
  const formattedDate = ad.date
    ? new Date(ad.date).toLocaleDateString()
    : "N/A";

  // Map level to dimensions
  const dimensions = {
    1: "160×600",
    2: "250×600",
    3: "1170×80",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="relative">
        {ad.imageUrl ? (
          <div className="relative h-48 w-full">
            <Image
              src={ad.imageUrl}
              alt={ad.name || "Advertisement"}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="transition-all duration-300 hover:scale-105"
            />
          </div>
        ) : (
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 h-48 flex items-center justify-center">
            <p className="text-gray-500">No image available</p>
          </div>
        )}
        <div
          className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${
            ad.status === "Active"
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
              : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
          }`}
        >
          {ad.status}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 truncate">{ad.name}</h3>
        <div className="inline-block px-2 py-1 bg-pink-50 text-pink-700 rounded-md text-xs font-medium mt-1">
          Level: {ad.level} ({dimensions[ad.level] || "Custom"})
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-sm flex items-center">
            <span className="font-medium w-16">Contact:</span>
            <span className="text-gray-700">{ad.contactPerson}</span>
          </p>
          <p className="text-sm flex items-center">
            <span className="font-medium w-16">Phone:</span>
            <span className="text-gray-700">{ad.contactNumber}</span>
          </p>
          <p className="text-sm flex items-center">
            <span className="font-medium w-16">Date:</span>
            <span className="text-gray-700">{formattedDate}</span>
          </p>
          {ad.link && (
            <p className="text-sm truncate">
              <span className="font-medium w-16 inline-block">Link:</span>
              <a
                href={ad.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 hover:underline transition-colors"
              >
                {ad.link}
              </a>
            </p>
          )}
        </div>

        <div className="mt-4 flex space-x-2">
          <Link
            href={`/dashboard/advertise/edit/${ad.id}`}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-2 px-4 rounded-md hover:from-blue-600 hover:to-blue-700 transition-colors flex items-center justify-center gap-1"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </Link>
          <button
            onClick={() => onDelete(ad.id)}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-md hover:from-red-600 hover:to-red-700 transition-colors flex items-center justify-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
