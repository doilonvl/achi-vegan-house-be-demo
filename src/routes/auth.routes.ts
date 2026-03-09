import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authAdmin } from "../middlewares/authAdmin";
import { validate } from "../middlewares/validate";
import { loginSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authAdmin, authController.me);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);

export default router;
