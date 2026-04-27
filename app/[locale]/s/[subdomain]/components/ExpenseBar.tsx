"use client";

import React, { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export type ExpenseSegment = {
  id: string;
  name: string;
  amount: number;
  color: string;
  tags?: string[];
};

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

function formatCurrency(n: number, currency: string, locale = "ja-JP") {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "JPY" ? 0 : 2,
    }).format(n);
  } catch {
    return `${n.toFixed(0)} ${currency}`;
  }
}

// Pure presentational bar
export function ExpenseBar({
  total,
  segments,
  currency = "JPY",
  showRemaining = true,
  className = "",
}: {
  total: number;
  segments: ExpenseSegment[];
  currency?: string;
  showRemaining?: boolean;
  className?: string;
}) {
  const t = useTranslations("ExpenseBar");
  const locale = useLocale();
  const spent = useMemo(
    () =>
      segments.reduce(
        (acc, s) =>
          acc + (Number.isFinite(s.amount) ? Math.max(s.amount, 0) : 0),
        0
      ),
    [segments]
  );
  const remaining = Math.max(total - spent, 0);

  const normalized = useMemo(() => {
    const t = Math.max(total, 0.0001);
    return segments
      .filter((s) => s.amount > 0)
      .map((s, idx) => ({
        key: s.id || `${idx}`,
        pct: clamp((s.amount / t) * 100, 0, 100),
        color: s.color,
        name: s.name,
        amount: s.amount,
      }));
  }, [segments, total]);

  const showRemainingBlock = showRemaining && remaining > 0.0001;
  const remPct = clamp((remaining / Math.max(total, 0.0001)) * 100, 0, 100);

  // Rounded corners for first & last visible blocks
  const indices = normalized.map((_, i) => i);
  const firstIdx = indices.find((i) => normalized[i].pct > 0);
  const lastIdx = (() => {
    const rev = [...indices].reverse();
    const li = rev.find((i) => normalized[i].pct > 0);
    return li ?? -1;
  })();

  return (
    <div
      className={`col-span-2 w-full ${className}`}
      aria-label={t("aria.usage")}
    >
      <div
        className="flex h-6 w-full overflow-hidden rounded-2xl ring-1 ring-zinc-300/70 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 dark:ring-zinc-700"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={Math.min(spent, total)}
        aria-valuetext={t("aria.valueText", {
          spent: formatCurrency(spent, currency, locale),
          total: formatCurrency(total, currency, locale),
        })}
      >
        {normalized.map((b, i) => (
          <div
            key={b.key}
            className={
              `h-full transition-[width] duration-300 ease-out min-w-[2px]` +
              (i === firstIdx ? " rounded-l-2xl" : "") +
              (!showRemainingBlock && i === lastIdx ? " rounded-r-2xl" : "")
            }
            style={{ width: `${b.pct}%`, backgroundColor: b.color }}
            title={`${b.name}: ${formatCurrency(b.amount, currency, locale)}`}
          />
        ))}
        {showRemainingBlock && (
          <div
            className={`h-full flex-1 bg-zinc-200/80 dark:bg-zinc-700/70 transition-[width] duration-300 ease-out ${
              normalized.length === 0 ? "rounded-2xl" : "rounded-r-2xl"
            }`}
            style={{ width: `${remPct}%` }}
            title={`${t("remaining")}: ${formatCurrency(
              remaining,
              currency,
              locale,
            )}`}
          />
        )}
      </div>
    </div>
  );
}

// Editor + Legend for an expense app
export default function ExpenseBarEditor() {
  const t = useTranslations("ExpenseBar");
  const locale = useLocale();
  const [currency, setCurrency] = useState<string>("JPY");
  const [total, setTotal] = useState<number>(200000); // total monthly expense/budget (e.g., ¥200,000)
  const [segments, setSegments] = useState<ExpenseSegment[]>([
    {
      id: crypto.randomUUID(),
      name: t("defaults.rent"),
      amount: 90000,
      color: "#ef4444",
      tags: ["fixed"],
    },
    {
      id: crypto.randomUUID(),
      name: t("defaults.groceries"),
      amount: 30000,
      color: "#22c55e",
      tags: ["food", "home"],
    },
    {
      id: crypto.randomUUID(),
      name: t("defaults.transport"),
      amount: 8000,
      color: "#3b82f6",
      tags: ["train", "bus"],
    },
    {
      id: crypto.randomUUID(),
      name: t("defaults.utilities"),
      amount: 15000,
      color: "#eab308",
      tags: ["electric", "water"],
    },
    {
      id: crypto.randomUUID(),
      name: t("defaults.subscriptions"),
      amount: 4000,
      color: "#a855f7",
      tags: ["apps"],
    },
    {
      id: crypto.randomUUID(),
      name: t("defaults.eatingOut"),
      amount: 12000,
      color: "#f97316",
      tags: ["food", "friends"],
    },
  ]);

  const spent = useMemo(
    () => segments.reduce((a, s) => a + Math.max(s.amount, 0), 0),
    [segments]
  );
  const remaining = Math.max(total - spent, 0);
  const over = Math.max(spent - total, 0);

  function updateSegment(id: string, patch: Partial<ExpenseSegment>) {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  }

  function removeSegment(id: string) {
    setSegments((prev) => prev.filter((s) => s.id !== id));
  }

  function addSegment() {
    setSegments((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: t("defaults.newCategory"),
        amount: 0,
        color: randomColor(),
        tags: [],
      },
    ]);
  }

  return (
    <div className="col-span-2 mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold tracking-tight mb-2">
        {t("title")}
      </h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
        {t.rich("description", {
          strong: (chunks) => <strong>{chunks}</strong>,
        })}
      </p>

      <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-700/60 p-4 bg-white/80 dark:bg-zinc-900/50 backdrop-blur">
        {/* Header numbers */}
        <div className="flex items-end justify-between mb-3">
          <div className="text-lg font-medium">
            {t("spentSummary", {
              spent: formatCurrency(Math.min(spent, total), currency, locale),
              total: formatCurrency(total, currency, locale),
            })}
          </div>
          {over > 0 && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {t("overBy", { amount: formatCurrency(over, currency, locale) })}
            </div>
          )}
        </div>

        <ExpenseBar
          total={total}
          segments={segments}
          currency={currency}
          className="mb-4"
        />

        {/* Legend with description tags */}
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          {segments.map((s) => (
            <div key={s.id} className="flex flex-col gap-1 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full ring-1 ring-black/10"
                  style={{ backgroundColor: s.color }}
                  aria-hidden
                />
                <span className="truncate font-medium">{s.name}</span>
                <span className="ml-auto tabular-nums text-zinc-600 dark:text-zinc-400">
                  {formatCurrency(s.amount, currency, locale)}
                </span>
              </div>
              {s.tags && s.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pl-5">
                  {s.tags.map((t, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-zinc-300/60 dark:border-zinc-700 px-2 py-0.5 text-[11px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 text-sm">
            <span
              className="inline-block h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-600 ring-1 ring-black/10"
              aria-hidden
            />
            <span>{t("remaining")}</span>
            <span className="ml-auto tabular-nums text-zinc-600 dark:text-zinc-400">
              {formatCurrency(remaining, currency, locale)}
            </span>
          </div>
        </div>

        {/* Controls: Total monthly expense + currency */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <label className="flex flex-col text-sm">
            <span className="text-zinc-600 dark:text-zinc-400 mb-1">
              {t("totalLabel")}
            </span>
            <input
              type="number"
              min={0}
              step={currency === "JPY" ? 1 : 0.01}
              value={total}
              onChange={(e) => setTotal(parseFloat(e.target.value) || 0)}
              className="h-9 rounded-lg border border-zinc-300/70 bg-white/70 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-900 dark:border-zinc-700"
            />
          </label>

          <label className="flex flex-col text-sm">
            <span className="text-zinc-600 dark:text-zinc-400 mb-1">
              {t("currency")}
            </span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="h-9 rounded-lg border border-zinc-300/70 bg-white/70 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-900 dark:border-zinc-700"
            >
              <option value="JPY">JPY ¥</option>
              <option value="USD">USD $</option>
              <option value="EUR">EUR €</option>
            </select>
          </label>
        </div>

        {/* Editor grid */}
        <div className="overflow-hidden rounded-xl border border-zinc-200/70 dark:border-zinc-700/60">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50/80 dark:bg-zinc-800/60">
              <tr>
                <th className="text-left p-3 font-medium">{t("category")}</th>
                <th className="text-left p-3 font-medium">{t("amount")}</th>
                <th className="text-left p-3 font-medium">
                  {t("tags")}
                </th>
                <th className="text-left p-3 font-medium">{t("color")}</th>
                <th className="p-3 text-right">
                  <button
                    onClick={addSegment}
                    className="rounded-md border border-zinc-300/70 px-2.5 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    {t("addCategory")}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {segments.map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-zinc-200/70 dark:border-zinc-700/60"
                >
                  <td className="p-3">
                    <input
                      value={s.name}
                      onChange={(e) =>
                        updateSegment(s.id, { name: e.target.value })
                      }
                      className="h-9 w-full rounded-md border border-zinc-300/70 bg-white/70 px-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-900 dark:border-zinc-700"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      min={0}
                      step={currency === "JPY" ? 1 : 0.01}
                      value={s.amount}
                      onChange={(e) =>
                        updateSegment(s.id, {
                          amount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-9 w-40 rounded-md border border-zinc-300/70 bg-white/70 px-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-900 dark:border-zinc-700"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      value={(s.tags || []).join(", ")}
                      onChange={(e) =>
                        updateSegment(s.id, {
                          tags: e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder={t("tagsPlaceholder")}
                      className="h-9 w-full rounded-md border border-zinc-300/70 bg-white/70 px-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-900 dark:border-zinc-700"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={s.color}
                        onChange={(e) =>
                          updateSegment(s.id, { color: e.target.value })
                        }
                        className="h-9 w-12 rounded-md border border-zinc-300/70 dark:border-zinc-700 bg-transparent"
                      />
                      <input
                        value={s.color}
                        onChange={(e) =>
                          updateSegment(s.id, { color: e.target.value })
                        }
                        className="h-9 w-28 rounded-md border border-zinc-300/70 bg-white/70 px-2 font-mono text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-900 dark:border-zinc-700"
                      />
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => removeSegment(s.id)}
                      className="rounded-md border border-zinc-300/70 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-zinc-700 dark:hover:bg-red-950/30"
                      aria-label={t("removeCategory", { name: s.name })}
                    >
                      {t("remove")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
        {t.rich("tip", {
          total: () => <code>total</code>,
          segments: () => <code>segments</code>,
          component: () => <code>{`<ExpenseBar/>`}</code>,
        })}
      </p>
    </div>
  );
}

function randomColor() {
  // Pleasant random pastel-ish color
  const h = Math.floor(Math.random() * 360);
  return `hsl(${h} 85% 60%)`;
}
