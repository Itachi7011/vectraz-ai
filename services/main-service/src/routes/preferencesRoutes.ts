import { Router } from "express";
import * as preferencesController from "../controllers/preferencesController";
import { requireAuth } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";

const router = Router();

router.use(requireAuth);
router.get("/", preferencesController.getPreferences);
router.put(
  "/",
  validateRequest(preferencesController.updatePreferencesSchema),
  preferencesController.updatePreferences
);

export default router;
