import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CircleCheck,
  CircleMinus,
  Clock,
} from "lucide-react";

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

export const dialog_messages = {
  delete: {
    title: "Deseja deletar {title}?",
    description:
      "Ao selecionar Deletar, o item será removido da lista de compras.",
    action: "Deletar",
  },
  complete: {
    title: "Marcar como completo {title}?",
    description:
      "O item marcado como completo poderá ser visualizado posteriormente.",
    action: "Completo",
  },
  info: {
    title: "{title}",
    description: "Aqui voce pode editar o item selecionado.",
    action: "Salvar",
  },
};
