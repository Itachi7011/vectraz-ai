import { Router } from "express";
import * as authController from "../controllers/authController";
import { validateRequest } from "../middlewares/validateRequest";
import {
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/authValidators";
import { loginLimiter, signupLimiter, otpLimiter, passwordResetLimiter } from "../middlewares/rateLimiters";

const router = Router();

router.get("/health", authController.health);

router.post("/signup", signupLimiter, validateRequest(signupSchema), authController.signup);
router.post("/verify-otp", otpLimiter, validateRequest(verifyOtpSchema), authController.verifyOtp);
router.post("/resend-otp", otpLimiter, validateRequest(resendOtpSchema), authController.resendOtp);

router.post("/login", loginLimiter, validateRequest(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

router.post(
  "/forgot-password",
  passwordResetLimiter,
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  passwordResetLimiter,
  validateRequest(resetPasswordSchema),
  authController.resetPassword
);

export default router;
