import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
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
    icon: Timer,
    color: "",
  },

  {
    value: "purchased",
    label: "Comprado",
    icon: CheckCircle,
    color: "text-green-700",
  },
  {
    value: "canceled",
    label: "Cancelado",
    icon: CircleOff,
    color: "text-destructive",
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
