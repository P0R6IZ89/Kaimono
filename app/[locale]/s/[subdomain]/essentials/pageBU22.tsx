"use client";

import * as React from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  MoreHorizontal,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type Status = "PENDING" | "PURCHASED" | "CANCELLED";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

type EssentialItem = {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  qty: number;
  unitPrice: number;
  createdAt: Date;
  note?: string;
};

const mock: EssentialItem[] = [
  {
    id: "1",
    title: "コンタクトレンズ",
    status: "PENDING",
    priority: "HIGH",
    qty: 2,
    unitPrice: 1222,
    createdAt: new Date(),
    note: "毎月",
  },
  {
    id: "2",
    title: "洗剤",
    status: "PENDING",
    priority: "MEDIUM",
    qty: 1,
    unitPrice: 780,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    note: "ストック少なめ",
  },
  {
    id: "3",
    title: "シャンプー",
    status: "PURCHASED",
    priority: "LOW",
    qty: 1,
    unitPrice: 980,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12),
  },
];

function yen(n: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function EssentialsPage() {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<Status | "ALL">("ALL");
  const [sort, setSort] = React.useState<"NEW" | "PRICE_DESC">("NEW");

  const items = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = mock.filter((x) =>
      q ? x.title.toLowerCase().includes(q) : true
    );
    if (statusFilter !== "ALL")
      list = list.filter((x) => x.status === statusFilter);

    if (sort === "NEW") {
      list = list
        .slice()
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else {
      list = list
        .slice()
        .sort((a, b) => b.unitPrice * b.qty - a.unitPrice * a.qty);
    }
    return list;
  }, [query, statusFilter, sort]);

  const stats = React.useMemo(() => {
    const total = mock.length;
    const pending = mock.filter((x) => x.status === "PENDING").length;
    const pendingTotal = mock
      .filter((x) => x.status === "PENDING")
      .reduce((acc, x) => acc + x.unitPrice * x.qty, 0);

    return { total, pending, pendingTotal };
  }, []);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">必需品</h1>
          <p className="text-sm text-muted-foreground">
            定期的に購入する必要がある必須アイテムの管理。
          </p>
        </div>

        <NewEssentialDialog />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="border-muted/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              アイテム数
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {stats.total}
          </CardContent>
        </Card>

        <Card className="border-muted/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              未購入
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="text-2xl font-semibold">{stats.pending}</div>
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              要対応
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-muted/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              未購入合計
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {yen(stats.pendingTotal)}
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="アイテムを検索…"
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                ステータス
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setStatusFilter("ALL")}>
                すべて
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("PENDING")}>
                未購入
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("PURCHASED")}>
                購入済み
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("CANCELLED")}>
                キャンセル
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="gap-2">
                <ArrowUpDown className="h-4 w-4" />
                並び替え
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setSort("NEW")}>
                新しい順
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("PRICE_DESC")}>
                金額が高い順
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* List */}
      <Card className="mt-4 border-muted/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">リスト</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {items.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y divide-muted/60">
              {items.map((item) => (
                <ItemRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile FAB */}
      <div className="fixed bottom-6 right-6 z-50 sm:hidden">
        <NewEssentialDialog
          trigger={
            <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
              <Plus className="h-5 w-5" />
            </Button>
          }
        />
      </div>
    </div>
  );
}

function ItemRow({ item }: { item: EssentialItem }) {
  const total = item.unitPrice * item.qty;

  return (
    <div className="flex items-center gap-3 py-3">
      <Checkbox />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate font-medium">{item.title}</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{item.note ?? "—"}</span>
              <span className="text-muted-foreground/50">•</span>
              <span>{item.createdAt.toLocaleString("ja-JP")}</span>
              <span className="text-muted-foreground/50">•</span>
              <span>
                {yen(item.unitPrice)} × {item.qty}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={item.status} />
            <PriorityBadge priority={item.priority} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-24 text-right font-semibold tabular-nums">
          {yen(total)}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem>編集</DropdownMenuItem>
            <DropdownMenuItem>購入済みにする</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  if (status === "PENDING") return <Badge>未購入</Badge>;
  if (status === "PURCHASED")
    return <Badge variant="secondary">購入済み</Badge>;
  return <Badge variant="outline">キャンセル</Badge>;
}

function PriorityBadge({ priority }: { priority: Priority }) {
  if (priority === "URGENT") return <Badge variant="destructive">緊急</Badge>;
  if (priority === "HIGH") return <Badge variant="outline">高</Badge>;
  if (priority === "MEDIUM") return <Badge variant="outline">中</Badge>;
  return <Badge variant="outline">低</Badge>;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="text-base font-medium">アイテムがありません</div>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        「追加」から必需品を登録すると、ここに一覧表示されます。
      </p>
      <Separator className="my-5 w-40" />
      <NewEssentialDialog
        trigger={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            追加
          </Button>
        }
      />
    </div>
  );
}

function NewEssentialDialog({ trigger }: { trigger?: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            追加
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>必需品を追加</DialogTitle>
          <DialogDescription>
            UI例です。ここをあなたの server action / zod validation
            に接続してください。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>タイトル</Label>
            <Input placeholder="例: 洗剤" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>数量</Label>
              <Input placeholder="1" inputMode="numeric" />
            </div>
            <div className="space-y-2">
              <Label>単価</Label>
              <Input placeholder="980" inputMode="numeric" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>メモ</Label>
            <Input placeholder="例: 毎月 / ストック少なめ" />
          </div>

          <Button className="w-full">保存</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
