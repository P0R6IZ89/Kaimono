"use client";
import { createColumnHelper } from "@tanstack/react-table";
import { PlannedJSON } from "../page";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ProfileCell from "./cells/cell-profile";
import StatusCell from "./cells/cell-status";
import ImageCell from "./cells/cell-image";
import LikesCell from "./cells/cell-likes";
import TitleCell from "./cells/cell-title";

dayjs.extend(relativeTime);

const columnHelper = createColumnHelper<PlannedJSON>();

export const columnsPlanned = [
  columnHelper.display({
    id: "profile",
    header: () => null,
    cell: ({ row }) => <ProfileCell row={row} />,
  }),
  columnHelper.accessor("status", {
    header: () => null,
    cell: ({ row }) => <StatusCell row={row} />,
  }),
  columnHelper.accessor("image", {
    header: () => null,
    cell: ({ row }) => <ImageCell row={row} />,
  }),
  columnHelper.display({
    id: "likes",
    header: () => null,
    cell: ({ row }) => <LikesCell row={row} />,
  }),
  columnHelper.accessor("title", {
    header: () => null,
    cell: ({ row }) => <TitleCell row={row} />,
  }),
  { id: "createdAt", header: () => null },
];
