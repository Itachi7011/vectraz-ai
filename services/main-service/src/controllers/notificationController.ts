import type { Request, Response } from "express";
import { prisma } from "@vectrazai/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

// ── GET /api/notifications ───────────────────────────────────────────
export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Math.min(Number(req.query.limit ?? 20), 50);

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where: { userId: req.user!.sub } }),
    prisma.notification.count({ where: { userId: req.user!.sub, status: "UNREAD" } }),
  ]);

  res.json({ notifications, unreadCount, pagination: { page, limit, total } });
});

// ── GET /api/notifications/unread-count ──────────────────────────────
export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const unreadCount = await prisma.notification.count({
    where: { userId: req.user!.sub, status: "UNREAD" },
  });
  res.json({ unreadCount });
});

// ── POST /api/notifications/:id/read ─────────────────────────────────
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification || notification.userId !== req.user!.sub) throw ApiError.notFound("Notification not found");

  await prisma.notification.update({ where: { id: notification.id }, data: { status: "READ" } });
  res.json({ message: "ok" });
});

// ── POST /api/notifications/read-all ─────────────────────────────────
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.sub, status: "UNREAD" },
    data: { status: "READ" },
  });
  res.json({ message: "ok" });
});
