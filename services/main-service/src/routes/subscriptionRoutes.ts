import { Router } from "express";
import * as subscriptionController from "../controllers/subscriptionController";
import { requireAuth } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import { upgradeSubscriptionSchema } from "../validators/subscriptionValidators";

const router = Router();

router.use(requireAuth);
router.get("/me", subscriptionController.getMySubscription);
router.post("/upgrade", validateRequest(upgradeSubscriptionSchema), subscriptionController.upgradeSubscription);
router.post("/cancel", subscriptionController.cancelSubscription);

export default router;
