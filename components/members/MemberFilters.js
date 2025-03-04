// components/members/MemberFilters.js
import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

const MemberFilters = ({ onFilterChange }) => {
  const filters = {
    status: ['All', 'Active', 'Inactive', 'Pending'],
    membershipType: ['All', 'Free', 'Paid', 'Featured'],
    religion: ['All', 'Hindu', 'Muslim', 'Christian', 'Sikh', 'Other'],
    maritalStatus: ['All', 'Never Married', 'Divorced', 'Widowed'],
  };

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Button variant="ghost" size="sm">
          <X className="mr-2 h-4 w-4" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(filters).map(([key, options]) => (
          <Select key={key} onValueChange={(value) => onFilterChange?.(key, value)}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${key}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {options.map((option) => (
                  <SelectItem key={option} value={option.toLowerCase()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ))}
      </div>
    </div>
  );
};

export default MemberFilters;