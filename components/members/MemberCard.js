// components/members/MemberCard.js
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  Check, 
  X, 
  Star,
  MessageSquare 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MemberCard = ({ member }) => {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        {member.photo ? (
          <img
            src={member.photo}
            alt={member.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center">
            <span className="text-2xl font-semibold text-muted-foreground">
              Upload Photo
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="bg-white/90">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Check className="mr-2 h-4 w-4" /> Approve
              </DropdownMenuItem>
              <DropdownMenuItem>
                <X className="mr-2 h-4 w-4" /> Reject
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Star className="mr-2 h-4 w-4" /> Feature
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold">{member.name}</h3>
            <p className="text-sm text-muted-foreground">{member.id}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Status</p>
              <p>{member.maritalStatus}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Religion</p>
              <p>{member.religion}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Location</p>
              <p>{member.location}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Caste</p>
              <p>{member.caste}</p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button className="flex-1" size="sm">
              <MessageSquare className="mr-2 h-4 w-4" /> Contact
            </Button>
            <Button variant="outline" className="flex-1" size="sm">
              View Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberCard;