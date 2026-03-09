import { z } from "zod";

const localizedStringSchema = z.record(z.string(), z.string());

export const createTestimonialSchema = z.object({
  quote_i18n: localizedStringSchema.refine(
    (obj) => Object.keys(obj).length > 0,
    "quote_i18n must have at least one locale"
  ),
  authorName: z.string().min(1, "authorName is required").max(160),
  rating: z.number().min(1, "rating must be at least 1").max(5, "rating cannot exceed 5"),
  sortOrder: z.number().int().min(0),
  source: z.enum(["google", "facebook", "website", "other"]).optional(),
  authorRole_i18n: localizedStringSchema.optional(),
  avatarInitials: z.string().max(6).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const updateTestimonialSchema = createTestimonialSchema.partial();

export type CreateTestimonialBody = z.infer<typeof createTestimonialSchema>;
export type UpdateTestimonialBody = z.infer<typeof updateTestimonialSchema>;
