import { Router } from "express";
import * as adminController from "../controllers/adminController";
import { requireAuth, requireAdmin } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import {
  blockUserSchema,
  listUsersSchema,
  analyticsRangeSchema,
  listArticlesAdminSchema,
} from "../validators/adminValidators";

const router = Router();

router.use(requireAuth, requireAdmin);

// Users
router.get("/users", validateRequest(listUsersSchema), adminController.listUsers);
router.post("/users/:id/block", validateRequest(blockUserSchema), adminController.blockUser);
router.post("/users/:id/unblock", adminController.unblockUser);

// Analytics
router.get("/analytics/overview", validateRequest(analyticsRangeSchema), adminController.analyticsOverview);
router.get("/analytics/timeseries", validateRequest(analyticsRangeSchema), adminController.analyticsTimeseries);
router.get("/analytics/categories", adminController.analyticsCategoryBreakdown);

// News sources & moderation
router.get("/news-sources/health", adminController.newsSourceHealth);
router.post("/news/refresh", adminController.triggerNewsRefresh);
router.get("/articles", validateRequest(listArticlesAdminSchema), adminController.listArticlesAdmin);
router.post("/articles/:id/approve", adminController.approveArticle);
router.post("/articles/:id/reject", adminController.rejectArticle);

// Reports
router.get("/reports", adminController.listReports);
router.post("/reports/:id/resolve", adminController.resolveReport);

export default router;
