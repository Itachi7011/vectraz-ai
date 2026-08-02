export type Role = "USER" | "ADMIN";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  createdAt: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  clickCount: number;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string | null;
  url: string;
  imageUrl: string | null;
  author: string | null;
  sourceName: string;
  sourceType: string;
  aiGenerated: boolean;
  matchedKeywords: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  views: number;
  clicks: number;
  publishedAt: string;
  categories: { slug: string; name: string }[];
};

export type SubscriptionPlan = "FREE" | "PRO" | "ENTERPRISE";

export type Subscription = {
  id?: string;
  plan: SubscriptionPlan;
  status: "ACTIVE" | "CANCELED" | "EXPIRED" | "TRIAL";
  isDummyPayment: boolean;
};

export type NotificationItem = {
  id: string;
  type: "NEW_ARTICLE" | "SYSTEM" | "SUBSCRIPTION" | "ADMIN";
  status: "UNREAD" | "READ";
  title: string;
  message: string;
  articleId: string | null;
  createdAt: string;
};

export type Paginated<T> = {
  pagination: { page: number; limit: number; total: number; totalPages: number };
} & Record<string, T[]>;
