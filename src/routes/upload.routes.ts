import { Router } from "express";
import { uploadController } from "../controllers/upload.controller";
import { authAdmin } from "../middlewares/authAdmin";

const router = Router();

router.post("/single", authAdmin, ...uploadController.single);
router.post("/multi", authAdmin, ...uploadController.multi);

export default router;
