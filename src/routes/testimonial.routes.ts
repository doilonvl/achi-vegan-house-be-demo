import { Router } from "express";
import { testimonialController } from "../controllers/testimonial.controller";
import { authAdmin } from "../middlewares/authAdmin";

const router = Router();

router.get("/", testimonialController.list);
router.get("/admin", authAdmin, testimonialController.listAdmin);
router.get("/admin/:id", authAdmin, testimonialController.getOneAdmin);
router.get("/:id", testimonialController.getOne);
router.post("/", authAdmin, testimonialController.create);
router.patch("/:id", authAdmin, testimonialController.update);
router.delete("/:id", authAdmin, testimonialController.remove);

export default router;
