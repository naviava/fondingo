"use client";

import { useEditUserModal } from "@fondingo/store/fondisplit";
import { Avatar } from "@fondingo/ui/avatar";
import { Button } from "@fondingo/ui/button";
import { BiSolidEdit } from "react-icons/bi";

interface IProps {
  email: string;
  userName: string;
  imageUrl: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export function Header({
  email,
  userName,
  imageUrl,
  firstName,
  lastName,
  phone,
}: IProps) {
  const { onOpen } = useEditUserModal((state) => state);

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
            onClick={() =>
              onOpen({
                displayName: userName,
                firstName,
                lastName,
                phone,
              })
            }
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