import { Router } from "express";
import * as newsController from "../controllers/newsController";
import * as reportController from "../controllers/reportController";
import { validateRequest } from "../middlewares/validateRequest";
import { listNewsSchema, trendingSchema, reportArticleSchema } from "../validators/newsValidators";
import { requireAuth, attachUserIfPresent } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", validateRequest(listNewsSchema), newsController.listNews);
router.get("/trending", validateRequest(trendingSchema), newsController.getTrending);
router.get("/:slug", attachUserIfPresent, newsController.getArticleBySlug);
router.post("/:slug/click", newsController.trackClick);
router.post(
  "/:slug/report",
  requireAuth,
  validateRequest(reportArticleSchema),
  reportController.reportArticle
);

export default router;
