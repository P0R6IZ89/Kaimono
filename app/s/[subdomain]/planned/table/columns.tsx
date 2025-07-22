"use client";
import { createColumnHelper } from "@tanstack/react-table";
import { PlannedJSON } from "../page";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ProfileCell from "./cells/cell-profile";
import ImageCell from "./cells/cell-image";
import TitleCell from "./cells/cell-title-priority";
import PriceCell from "./cells/cell-price";
import CommentsCell from "./cells/cell-comments";
import LikeStatusCell from "./cells/cell-like-status";
import MenuCell from "./cells/cell-menu";

dayjs.extend(relativeTime);

const columnHelper = createColumnHelper<PlannedJSON>();

export const columnsPlanned = [
  { id: "createdAt" },
  columnHelper.display({
    id: "profile",
    header: () => null,
    cell: ({ row }) => <ProfileCell row={row} />,
  }),
  columnHelper.accessor("status", {
    header: () => null,
    cell: ({ row }) => <MenuCell row={row} />,
    filterFn: "arrIncludesSome",
  }),
  columnHelper.accessor("image", {
    header: () => null,
    cell: ({ row }) => <ImageCell row={row} />,
  }),
  columnHelper.display({
    id: "likes",
    header: () => null,
    cell: ({ row }) => <LikeStatusCell row={row} />,
  }),
  columnHelper.display({
    id: "title",
    header: () => null,
    cell: ({ row }) => <TitleCell row={row} />,
  }),
  columnHelper.display({
    id: "price",
    header: () => null,
    cell: ({ row }) => <PriceCell row={row} />,
  }),
  columnHelper.display({
    id: "comments",
    header: () => null,
    cell: ({ row }) => <CommentsCell row={row} />,
  }),
];
