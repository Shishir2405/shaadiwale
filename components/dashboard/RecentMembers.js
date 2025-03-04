// components/dashboard/RecentMembers.js
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from 'lucide-react';

const RecentMembers = ({ members = [] }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Members</CardTitle>
        <span className="text-sm text-muted-foreground">Last 12 Members</span>
      </CardHeader>
      <CardContent className="space-y-4">
        {members.map((member) => (
          <div key={member.id} className="flex items-center space-x-4 rounded-lg border p-4">
            <div className="flex-shrink-0">
              {member.photo ? (
                <img 
                  src={member.photo} 
                  alt={member.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{member.name}</p>
              <div className="flex flex-col space-y-1">
                <p className="text-sm text-muted-foreground">
                  {member.maritalStatus} • {member.religion}
                </p>
                <p className="text-xs text-muted-foreground">
                  {member.location}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentMembers;