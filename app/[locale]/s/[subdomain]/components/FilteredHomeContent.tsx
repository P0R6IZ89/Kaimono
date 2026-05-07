"use client";

import type {
  allProjectType,
  oldestPlannedItemsType,
  recentlyAddedType,
  recentShoppingItemsType,
} from "./HomeContent";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CircleCheckBig,
  CircleMinus,
  Clock,
  Link as LinkIcon,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Home } from "./home/Recommendation";
import { DataTableFacetedFilter } from "../planned/table/data-table-faceted-filter";
import { CreatePlannedDialogTrigger } from "../planned/dialogs/dialog-create-trigger";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type Table,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CldImage } from "next-cloudinary";
import { Link } from "@/i18n/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { formatPriceYen } from "@/lib/formatPriceYen";

type HomePlannedItem = allProjectType["plannedItems"][number];
type HomeProject = allProjectType;

const PLANNED_PLACEHOLDER_IMAGE =
  "https://res.cloudinary.com/dsttcre2h/image/upload/v1751870559/placeholder_dtzhrr.png";
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_STATUS_FILTER = ["PENDING"];

function getDefaultColumnFilters(): ColumnFiltersState {
  return [{ id: "status", value: DEFAULT_STATUS_FILTER }];
}

function getDefaultPagination(): PaginationState {
  return { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE };
}

function TotalPriceCount({ totalPrice }: { totalPrice: number }) {
  const t = useTranslations("Table");

  return (
    <p className="mb-2 text-sm text-muted-foreground">
      {totalPrice} {t("items")}
    </p>
  );
}

function PlannedMasonryCard({ item }: { item: HomePlannedItem }) {
  const imageSrc = item.image || PLANNED_PLACEHOLDER_IMAGE;
  const plannedHref = {
    pathname: "/planned" as const,
    query: { title: item.title, showAll: "1" },
  };

  return (
    <Card className="gap-0 w-full break-inside-avoid overflow-hidden rounded-xl p-0 shadow hover:ring-2 hover:ring-primary/50 hover:brightness-125 transition-all">
      <div className="relative">
        <Link
          href={plannedHref}
          className="block"
          aria-label={`Open ${item.title}`}
        >
          <CldImage
            width={600}
            height={600}
            src={imageSrc}
            alt={item.title}
            className="h-auto w-full object-cover"
          />
        </Link>
        {item.productUrl && (
          <Button
            asChild
            variant="secondary"
            className="absolute rounded-full bottom-2 right-2"
          >
            <a
              href={item.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open product link for ${item.title}`}
            >
              <LinkIcon />
            </a>
          </Button>
        )}
      </div>
      <CardHeader className="gap-2 p-3">
        <CardTitle className="line-clamp-2 text-base">
          <Link
            href={plannedHref}
            className="outline-none hover:underline focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            {item.title}
          </Link>
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

function HomeAddPlannedCard({ projectId }: { projectId: string }) {
  const t = useTranslations("Planned");

  return (
    <CreatePlannedDialogTrigger
      mode="project"
      projectId={projectId}
      contentClassName="sm:max-w-106.25"
      trigger={
        <button
          type="button"
          className="mb-4 flex min-h-52 w-full break-inside-avoid flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-muted-foreground/40 bg-muted/30 p-6 text-center shadow-sm transition-colors hover:border-primary/60 hover:bg-muted/60 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
            <Plus className="size-5" />
          </span>
          <span className="text-base font-medium text-foreground">
            {t("create.title")}
          </span>
          <span className="max-w-52 text-sm text-muted-foreground">
            {t("create.description")}
          </span>
        </button>
      }
    />
  );
}

const columns: ColumnDef<HomePlannedItem>[] = [
  {
    accessorKey: "createdAt",
    header: () => null,
    cell: () => null,
  },
  {
    accessorKey: "status",
    header: () => null,
    cell: () => null,
    filterFn: "arrIncludesSome",
  },
  {
    accessorKey: "title",
    header: () => null,
    cell: () => null,
    filterFn: "includesString",
  },
  {
    id: "card",
    header: () => null,
    cell: ({ row }) => <PlannedMasonryCard item={row.original} />,
  },
];

function HomePlannedToolbar({
  table,
  onReset,
}: {
  table: Table<HomePlannedItem>;
  onReset: () => void;
}) {
  const isMobile = useIsMobile();

  const t = useTranslations("Table");
  const tCommon = useTranslations("Common");

  const statusOptions = useMemo(
    () => [
      {
        value: "PENDING",
        label: tCommon("status.PENDING"),
        icon: Clock,
      },
      {
        value: "PURCHASED",
        label: tCommon("status.PURCHASED"),
        icon: CircleCheckBig,
      },
      {
        value: "CANCELLED",
        label: tCommon("status.CANCELLED"),
        icon: CircleMinus,
      },
    ],
    [tCommon],
  );

  return (
    <div className="mb-4 flex flex-row gap-2 md:flex-row md:items-center md:justify-between">
      <Input
        className="md:max-w-sm"
        placeholder={t("searchPlaceholder")}
        value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
        onChange={(event) => {
          table.getColumn("title")?.setFilterValue(event.target.value);
        }}
      />
      <div className="flex flex-row items-center gap-2">
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title={!isMobile ? t("filterByStatus") : undefined}
            options={statusOptions}
          />
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="h-8 px-2 lg:px-3"
        >
          {!isMobile && t("clearFilters")}
          <X />
        </Button>
      </div>
    </div>
  );
}

export function FilteredHomeContent({
  activeProjectId,
  allProjects,
  recentShoppingItems,
  oldestPlannedItems,
  recentlyAdded,
}: {
  activeProjectId: string | null;
  allProjects: allProjectType[];
  recentShoppingItems: recentShoppingItemsType;
  oldestPlannedItems: oldestPlannedItemsType;
  recentlyAdded: recentlyAddedType;
}) {
  const activeProject = allProjects.find(
    (project) => project.id === activeProjectId,
  );

  if (!activeProject) {
    return (
      <Home
        recentShoppingItems={recentShoppingItems}
        oldestPlannedItems={oldestPlannedItems}
        recentlyAdded={recentlyAdded}
      />
    );
  }

  return (
    <ProjectPlannedGrid
      key={activeProject.id}
      activeProject={activeProject}
      allProjects={allProjects}
    />
  );
}

function ProjectPlannedGrid({
  activeProject,
  allProjects,
}: {
  activeProject: HomeProject;
  allProjects: allProjectType[];
}) {
  const t = useTranslations("Table");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    getDefaultColumnFilters,
  );
  const [pagination, setPagination] =
    useState<PaginationState>(getDefaultPagination);

  const table = useReactTable({
    data: activeProject.plannedItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onColumnFiltersChange: (updater) => {
      setColumnFilters((currentFilters) =>
        typeof updater === "function" ? updater(currentFilters) : updater,
      );
      setPagination((currentPagination) => ({
        ...currentPagination,
        pageIndex: 0,
      }));
    },
    onPaginationChange: setPagination,
    state: {
      columnFilters,
      pagination,
    },
    initialState: {
      columnVisibility: {
        createdAt: false,
        status: false,
        title: false,
      },
      sorting: [
        {
          id: "createdAt",
          desc: true,
        },
      ],
    },
  });

  const rows = table.getRowModel().rows;
  const resetFilters = () => {
    setColumnFilters(getDefaultColumnFilters());
    setPagination(getDefaultPagination());
  };
  const selectedPlannedItems = allProjects.find(
    (p) => p.id === activeProject.id,
  )?.plannedItems;
  const totalPrice =
    selectedPlannedItems?.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    ) ?? 0;
  const totalPendingPrice =
    selectedPlannedItems?.reduce((acc, item) => {
      if (item.status === "PENDING") {
        return acc + item.price * item.quantity;
      }
      return acc;
    }, 0) ?? 0;

  return (
    <div>
      <div className="flex flex-row gap-4 pb-4">
        <Item className="flex-1" variant="muted">
          <ItemContent>
            <ItemDescription>Pending Total Price</ItemDescription>
            <ItemTitle className="flex items-baseline gap-2">
              <p className="text-xl font-semibold tracking-tight">
                {formatPriceYen(totalPendingPrice)}
              </p>
              <p className="text-muted-foreground ">
                / {formatPriceYen(totalPrice)}
              </p>
            </ItemTitle>
          </ItemContent>
        </Item>
        {/* <Item className="flex-1" variant="muted">
          <ItemContent>
            <ItemDescription className="text-sm">Total price</ItemDescription>
            <ItemTitle>{formatPriceYen(totalPrice)}</ItemTitle>
          </ItemContent>
        </Item> */}
      </div>
      <HomePlannedToolbar table={table} onReset={resetFilters} />
      <ResponsiveMasonry
        columnsCountBreakPoints={{ 350: 2, 750: 2, 900: 3 }}
        gutterBreakPoints={{ 350: "12px", 750: "12px", 900: "12px" }}
      >
        <Masonry columnsCount={3} gutter="1rem">
          <HomeAddPlannedCard projectId={activeProject.id} />
          {rows.map((row) => (
            <div key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <div key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </div>
          ))}
        </Masonry>
      </ResponsiveMasonry>

      <div className="flex items-center justify-between gap-3 py-4">
        <p className="text-sm text-muted-foreground">
          {t("page")} {table.getState().pagination.pageIndex + 1} {t("of")}{" "}
          {table.getPageCount() || 1}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {t("previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {t("next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
