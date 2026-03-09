import { Router } from "express";
import rateLimit from "express-rate-limit";
import { reservationRequestController } from "../controllers/reservationRequest.controller";
import { authAdmin } from "../middlewares/authAdmin";
import { validate } from "../middlewares/validate";
import {
  createReservationSchema,
  updateReservationStatusSchema,
} from "../schemas/reservation.schema";

const router = Router();

const reservationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/", reservationLimiter, validate(createReservationSchema), reservationRequestController.create);
router.get("/", authAdmin, reservationRequestController.list);
router.get("/:id", authAdmin, reservationRequestController.getOne);
router.patch(
  "/:id/status",
  authAdmin,
  validate(updateReservationStatusSchema),
  reservationRequestController.updateStatus
);

export default router;
