"use client";

import { useAuth } from "@/lib/useAuth";
import { SearchInput } from "./search-input";
import { InviteButton } from "./invite-button";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";

export const Navbar = () => {
  const { userId, userName, status } = useAuth();

  return (
    <div className="flex items-center gap-x-4 p-5">
      <div className="hidden lg:flex lg:flex-1">
        <SearchInput />
      </div>

      <div className="block lg:hidden flex-1">
        <div className="flex items-center gap-x-4">
          <Button variant="outline">
            <UserCircle className="h-4 w-4" />
            {userName ?? "Guest"}
          </Button>
        </div>
      </div>
      {userId && <InviteButton />}

      <div className="flex items-center gap-x-4">
        <Button variant="outline">
          <UserCircle className="h-4 w-4" />
          {userName ?? "Guest"}
        </Button>
      </div>
    </div>
  );
};
