import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authController } from "../controllers/auth.controller";
import { authAdmin } from "../middlewares/authAdmin";
import { validate } from "../middlewares/validate";
import { loginSchema } from "../schemas/auth.schema";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later." },
});

router.post("/login", loginLimiter, validate(loginSchema), authController.login);
router.get("/me", authAdmin, authController.me);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);

export default router;
