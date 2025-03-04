// components/dashboard/SiteStats.js
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Activity, CreditCard, Heart } from 'lucide-react';
import StatsCard from './StatsCard';

const SiteStats = () => {
  const stats = [
    {
      title: "Advertisement",
      value: "0",
      description: "Active campaigns",
      icon: BarChart
    },
    {
      title: "Membership Plans",
      value: "4",
      description: "Available packages",
      icon: CreditCard
    },
    {
      title: "Express Interest",
      value: "1",
      description: "Pending requests",
      icon: Heart
    },
    {
      title: "Success Story",
      value: "0",
      description: "Happy couples",
      icon: Activity
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Site Statistics</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>
    </div>
  );
};

export default SiteStats;