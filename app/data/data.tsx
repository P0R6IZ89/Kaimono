import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  Circle,
  CircleCheck,
  CircleMinus,
  CircleOff,
  Timer,
} from "lucide-react";

export const statusConfig = {
  pending: {
    icon: Timer,
    text: "Pendente",
  },
  purchased: {
    icon: CheckCircle,
    text: "Comprado",
  },
  canceled: {
    icon: CircleOff,
    text: "Cancelado",
  },
};

export const statuses = [
  {
    value: "pending",
    label: "Pendente",
    icon: Circle,
    color: "text-foreground",
  },

  {
    value: "purchased",
    label: "Comprado",
    icon: CircleCheck,
    color: "text-foreground",
  },
  {
    value: "canceled",
    label: "Cancelado",
    icon: CircleMinus,
    color: "text-foreground",
  },
];

export const priorities = [
  {
    label: "Low",
    value: "low",
    icon: ArrowDown,
  },
  {
    label: "Medium",
    value: "medium",
    icon: ArrowRight,
  },
  {
    label: "High",
    value: "high",
    icon: ArrowUp,
  },
];
