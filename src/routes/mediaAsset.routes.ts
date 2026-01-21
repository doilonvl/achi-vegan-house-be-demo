import { Router } from "express";
import { mediaAssetController } from "../controllers/mediaAsset.controller";
import { authAdmin } from "../middlewares/authAdmin";

const router = Router();

router.get("/", mediaAssetController.list);
router.get("/admin", authAdmin, mediaAssetController.listAdmin);
router.get("/admin/:id", authAdmin, mediaAssetController.getOneAdmin);
router.get("/:id", mediaAssetController.getOne);
router.post("/", authAdmin, mediaAssetController.create);
router.patch("/:id", authAdmin, mediaAssetController.update);
router.delete("/:id", authAdmin, mediaAssetController.remove);

export default router;
