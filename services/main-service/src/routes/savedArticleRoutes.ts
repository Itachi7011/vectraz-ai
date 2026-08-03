import { Router } from "express";
import * as savedArticleController from "../controllers/savedArticleController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

router.use(requireAuth);
router.get("/", savedArticleController.listSavedArticles);

export default router;
