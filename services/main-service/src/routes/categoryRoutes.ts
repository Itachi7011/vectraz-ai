import { Router } from "express";
import * as categoryController from "../controllers/categoryController";

const router = Router();

router.get("/", categoryController.listCategories);
router.get("/:slug", categoryController.getCategory);
router.post("/:slug/click", categoryController.trackCategoryClick);

export default router;
