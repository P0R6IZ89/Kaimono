export type ProjectBudgetItem = {
  price: number;
  quantity: number;
  status: "PENDING" | "PURCHASED" | "CANCELLED";
};

export type ProjectBudgetState = "unset" | "within" | "at-limit" | "over";

export type ProjectBudgetSummary = {
  activeTotal: number;
  budget: number | null;
  remaining: number;
  overage: number;
  percentage: number;
  state: ProjectBudgetState;
};

const toMinorUnits = (value: number) => Math.round(value * 100);

export function getProjectBudgetSummary(
  budget: number | null,
  items: ProjectBudgetItem[],
): ProjectBudgetSummary {
  const activeTotalMinor = items.reduce((total, item) => {
    if (item.status === "CANCELLED") return total;

    return total + toMinorUnits(item.price) * item.quantity;
  }, 0);
  const budgetMinor = budget === null ? null : toMinorUnits(budget);
  const activeTotal = activeTotalMinor / 100;

  if (budgetMinor === null) {
    return {
      activeTotal,
      budget: null,
      remaining: 0,
      overage: 0,
      percentage: 0,
      state: "unset",
    };
  }

  const differenceMinor = budgetMinor - activeTotalMinor;
  const state: ProjectBudgetState =
    differenceMinor < 0
      ? "over"
      : differenceMinor === 0
        ? "at-limit"
        : "within";

  return {
    activeTotal,
    budget: budgetMinor / 100,
    remaining: Math.max(differenceMinor, 0) / 100,
    overage: Math.max(-differenceMinor, 0) / 100,
    percentage: (activeTotalMinor / budgetMinor) * 100,
    state,
  };
}
