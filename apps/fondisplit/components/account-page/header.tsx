"use client";

import { Avatar } from "@fondingo/ui/avatar";
import { Button } from "@fondingo/ui/button";
import { BiSolidEdit } from "react-icons/bi";

interface IProps {
  userName: string;
  imageUrl: string;
  email: string;
}

export function Header({ userName, imageUrl, email }: IProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="mx-auto my-10 w-fit">
        <Avatar variant="2xl" userName={userName} userImageUrl={imageUrl} />
      </div>
      <div className="relative flex items-center">
        <h2 className="text-2xl font-medium">{userName}</h2>
        <div className="absolute -right-12 top-1/2 flex -translate-y-1/2 items-center justify-center">
          <Button
            size="sm"
            variant="splitGhost"
            onClick={() => {}}
            className="h-auto p-2"
          >
            <BiSolidEdit className="h-6 w-6" />
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground mt-1">{email}</p>
    </div>
  );
}
