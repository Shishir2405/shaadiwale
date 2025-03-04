'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

const searchOptions = [
  { id: 1, title: "Quick Search", href: "/quick-search" },
  { id: 2, title: "Basic Search", href: "/basic-search" },
  { id: 3, title: "Advanced Search", href: "/advanced-search" },
  { id: 4, title: "Keyword Search", href: "/keyword-search" },
  { id: 5, title: "Location Search", href: "/location-search" },
  { id: 6, title: "Occupation Search", href: "/occupation-search" },
];

export function SearchDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 font-medium text-black hover:text-[#e71c5d] transition-colors">
        Search
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 bg-white">
        {searchOptions.map((option) => (
          <DropdownMenuItem key={option.id}>
            <Link
              href={option.href}
              className="w-full text-sm text-gray-700 hover:text-[#e71c5d]"
            >
              {option.title}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}