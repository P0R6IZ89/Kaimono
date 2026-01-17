"use client";
import { type ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ProfileCell from "./cells/cell-profile";
import ImageCell from "./cells/cell-image";
import TitleCell from "./cells/cell-title-priority";
import PriceCell from "./cells/cell-price";
import ActionsCell from "./cells/cell-actions";
import { PlannedSchema } from "@/app/[locale]/types/planned";
import BadgeRowCell from "./cells/cell-badge-row";

dayjs.extend(relativeTime);

export const columnsPlanned: ColumnDef<PlannedSchema>[] = [
  {
    accessorKey: "createdAt",
    header: () => null,
    cell: () => null,
  },
  {
    id: "profile",
    header: () => null,
    cell: ({ row }) => <ProfileCell row={row} />,
  },
  {
    id: "image",
    header: () => null,
    cell: ({ row }) => <ImageCell row={row} />,
  },
  {
    accessorKey: "status",
    header: () => null,
    cell: ({ row }) => <BadgeRowCell row={row} />,
    filterFn: "arrIncludesSome",
  },
  {
    accessorKey: "title",
    header: () => null,
    cell: ({ row }) => <TitleCell row={row} />,
  },
  {
    id: "price",
    header: () => null,
    cell: ({ row }) => <PriceCell row={row} />,
  },

  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => <ActionsCell row={row} />,
  },
];
