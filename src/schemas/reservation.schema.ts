import { z } from "zod";

export const createReservationSchema = z.object({
  fullName: z.string().min(1, "fullName is required").max(160),
  phoneNumber: z.string().min(1, "phoneNumber is required").max(40),
  email: z.string().email("Invalid email format").max(160).optional().or(z.literal("")),
  guestCount: z.coerce
    .number()
    .int("guestCount must be an integer")
    .min(1, "guestCount must be at least 1")
    .max(100, "guestCount cannot exceed 100"),
  reservationDate: z.coerce.date(),
  reservationTime: z.string().min(1, "reservationTime is required").max(20),
  note: z.string().max(1000).optional(),
  source: z.enum(["website", "phone", "walk_in", "other"]).optional().default("website"),
  // honeypot — allow it through so controller can inspect it
  website: z.string().optional(),
  // locale fields for email language detection
  locale: z.string().optional(),
  lang: z.string().optional(),
});

export const updateReservationStatusSchema = z.object({
  status: z.enum(["new", "emailed", "confirmed", "cancelled"]),
});

export type CreateReservationBody = z.infer<typeof createReservationSchema>;
export type UpdateReservationStatusBody = z.infer<typeof updateReservationStatusSchema>;
