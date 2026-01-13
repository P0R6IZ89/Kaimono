export type PlannedBacklogItem = {
  id: string;
  title: string;
  status: "PENDING" | "PURCHASED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  price: number;
  quantity: number;
  createdAt?: string | Date;
};

export type ProjectWithPlanned = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  counts: {
    total: number;
    pending: number;
    purchased: number;
    cancelled: number;
  };
  plannedItems: PlannedBacklogItem[];
};
