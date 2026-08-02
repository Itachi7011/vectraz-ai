import {
  LayoutDashboard,
  Newspaper,
  Flag,
  Users,
  Radio,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export type AdminNavLeaf = {
  type: "link";
  label: string;
  href: string;
  icon: LucideIcon;
};

export type AdminNavGroup = {
  type: "group";
  label: string;
  icon: LucideIcon;
  children: (AdminNavLeaf | AdminNavGroup)[];
};

export type AdminNavItem = AdminNavLeaf | AdminNavGroup;

export const ADMIN_NAV: AdminNavItem[] = [
  { type: "link", label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  {
    type: "group",
    label: "Moderation",
    icon: ShieldCheck,
    children: [
      {
        type: "group",
        label: "Articles",
        icon: Newspaper,
        children: [
          { type: "link", label: "All articles", href: "/admin/articles", icon: Newspaper },
          { type: "link", label: "Pending review", href: "/admin/articles?status=PENDING", icon: Clock3 },
          { type: "link", label: "Approved", href: "/admin/articles?status=APPROVED", icon: CheckCircle2 },
          { type: "link", label: "Rejected", href: "/admin/articles?status=REJECTED", icon: XCircle },
        ],
      },
      { type: "link", label: "Reports", href: "/admin/reports", icon: Flag },
    ],
  },
  {
    type: "group",
    label: "People",
    icon: Users,
    children: [{ type: "link", label: "All users", href: "/admin/users", icon: Users }],
  },
  {
    type: "group",
    label: "System",
    icon: Radio,
    children: [{ type: "link", label: "News sources", href: "/admin/sources", icon: Radio }],
  },
];
