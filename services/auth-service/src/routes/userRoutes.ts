import { Router } from "express";
import * as userController from "../controllers/userController";
import { requireAuth } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import { updateProfileSchema, changePasswordSchema } from "../validators/userValidators";
import { avatarUpload } from "../middlewares/uploadMiddleware";

const router = Router();

router.use(requireAuth);

router.get("/me", userController.getProfile);
router.patch("/me", validateRequest(updateProfileSchema), userController.updateProfile);
router.post("/me/change-password", validateRequest(changePasswordSchema), userController.changePassword);
router.post("/me/avatar", avatarUpload, userController.uploadAvatar);

export default router;
