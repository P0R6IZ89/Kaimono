export type PlannedSchema = {
  id: string;
  title: string;
  price: number;
  status: "PENDING" | "PURCHASED" | "CANCELLED";
  quantity: number;
  createdAt: string | Date;
  image?: string | null;
  likedByMe: boolean;
  likesCount: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  productUrl?: string | null;
  username?: string | null;
  userEmail: string;
  userImage?: string | null;
  description?: string | null;
  commentsCount: number;
  project?: {
    id: string;
    name: string;
  } | null;
  comments: {
    id: string;
    content: string;
    createdAt: string | Date;
    authorName?: string | null;
    authorEmail?: string | null;
    authorImage?: string | null;
  }[];
};
