import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  CircleCheck,
  CircleMinus,
  CircleOff,
  Clock,
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
    icon: Clock,
    color: "text-muted-foreground",
    bg: "",
  },

  {
    value: "purchased",
    label: "Comprado",
    icon: CircleCheck,
    color: "text-green-700",
    bg: "bg-green-50",
  },
  {
    value: "canceled",
    label: "Cancelado",
    icon: CircleMinus,
    color: "text-red-700",
    bg: "bg-red-50",
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
