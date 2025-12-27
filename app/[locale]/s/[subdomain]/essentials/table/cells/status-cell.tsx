"use client";

import { Row } from "@tanstack/react-table";
import React from "react";
import { TableRowData } from "../essentials-columns";
import { ItemMedia } from "@/components/ui/item";
import { Checkbox } from "@/components/ui/checkbox";
import { Status } from "@prisma/client";
import { setEssentialStatusAction } from "@/actions/essentialsActions";
import { useSubdomain } from "@/context/SubdomainContext";

interface StatusCellProps {
  row: Row<TableRowData>;
}

const StatusCell: React.FC<StatusCellProps> = ({ row }) => {
  const { subdomain } = useSubdomain();

  const essentialId = row.original.id;

  const [status, setStatus] = React.useState<Status>(row.getValue("status"));
  const [isSaving, startTransition] = React.useTransition();

  const isCancelled = status === "CANCELLED";
  const checked = status === "PURCHASED";

  function onCheckedChange(next: boolean) {
    if (isCancelled) return;

    const prevStatus = status;
    const nextStatus: Status = next ? "PURCHASED" : "PENDING";

    setStatus(nextStatus);

    startTransition(async () => {
      try {
        await setEssentialStatusAction({
          essentialId,
          status: nextStatus,
          subdomain,
        });
      } catch {
        // Roll back if the server update fails
        setStatus(prevStatus);
      }
    });
  }

  return (
    <ItemMedia variant={"icon"}>
      <Checkbox
        checked={checked}
        disabled={isCancelled || isSaving}
        onCheckedChange={(value) => onCheckedChange(Boolean(value))}
      />
    </ItemMedia>
  );
};

export default StatusCell;
