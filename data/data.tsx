import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CircleCheckBig,
  CircleMinus,
  Clock,
  TriangleAlert,
} from "lucide-react";

export const statuses = [
  {
    value: "PENDING",
    icon: Clock,
  },

  {
    value: "PURCHASED",
    icon: CircleCheckBig,
  },
  {
    value: "CANCELLED",
    icon: CircleMinus,
  },
];

export const priorities = [
  {
    value: "LOW",
    icon: ArrowDown,
  },
  {
    value: "MEDIUM",
    icon: ArrowRight,
  },
  {
    value: "HIGH",
    icon: ArrowUp,
  },
  {
    value: "URGENT",
    icon: TriangleAlert,
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
    action: "Marcar como Completo",
  },
  info: {
    title: "{title}",
    description: "Aqui você pode editar o item selecionado.",
    action: "Salvar",
  },
  pending: {
    title: "Marcar como pendente {title}?",
    description: "O item será marcado como pendente.",
    action: "Reverter para Pendente",
  },
};
