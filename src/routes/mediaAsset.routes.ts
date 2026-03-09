import { Router } from "express";
import { mediaAssetController } from "../controllers/mediaAsset.controller";
import { authAdmin } from "../middlewares/authAdmin";
import { validate } from "../middlewares/validate";
import {
  createMediaAssetSchema,
  updateMediaAssetSchema,
} from "../schemas/mediaAsset.schema";

const router = Router();

router.get("/", mediaAssetController.list);
router.get("/admin", authAdmin, mediaAssetController.listAdmin);
router.get("/admin/:id", authAdmin, mediaAssetController.getOneAdmin);
router.get("/:id", mediaAssetController.getOne);
router.post("/", authAdmin, validate(createMediaAssetSchema), mediaAssetController.create);
router.patch("/:id", authAdmin, validate(updateMediaAssetSchema), mediaAssetController.update);
router.delete("/:id", authAdmin, mediaAssetController.remove);

export default router;
