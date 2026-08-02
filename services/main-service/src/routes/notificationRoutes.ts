import { Router } from "express";
import * as notificationController from "../controllers/notificationController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

router.use(requireAuth);
router.get("/", notificationController.listNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.post("/:id/read", notificationController.markAsRead);
router.post("/read-all", notificationController.markAllAsRead);

export default router;
