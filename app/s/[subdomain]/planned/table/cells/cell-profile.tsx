import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { capitalizeFirstLetter } from "@/lib/utils";
import { Row } from "@tanstack/react-table";
import { PlannedSchema } from "@/app/types/planned";

dayjs.extend(relativeTime);

function ProfileCell({ row }: { row: Row<PlannedSchema> }) {
  const { image, username, userEmail, createdAt } = row.original;
  const daysOld = dayjs().diff(createdAt, "day");
  const timeClass = daysOld > 90 ? "text-green-500" : "text-foreground";
  return (
    <div className="dark absolute top-4 left-4 flex items-center justify-between space-x-4 z-20 text-foreground">
      <div className="flex items-center space-x-4">
        <Avatar>
          {image ? <AvatarImage src={image} /> : null}
          <AvatarFallback>
            {username
              ? capitalizeFirstLetter(username)
              : capitalizeFirstLetter(userEmail ?? "")}
          </AvatarFallback>
        </Avatar>
        <div>
          {username ? (
            <p className="text-sm font-medium leading-none">{username}</p>
          ) : (
            <p className="text-sm font-medium leading-none">{userEmail}</p>
          )}
          <p className={`${timeClass} text-sm`}>{dayjs(createdAt).fromNow()}</p>
        </div>
      </div>
    </div>
  );
}

export default ProfileCell;
