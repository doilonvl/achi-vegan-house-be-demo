import { z } from "zod";

const localizedStringSchema = z.record(z.string(), z.string());

export const createMediaAssetSchema = z.object({
  kind: z.enum(["image", "video"]),
  url: z.string().min(1, "url is required").url("url must be a valid URL"),
  sortOrder: z.number().int().min(0),
  provider: z.enum(["cloudinary", "vdrive", "s3", "other"]).optional(),
  alt_i18n: localizedStringSchema.optional(),
  caption_i18n: localizedStringSchema.optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  slug: z.string().optional(),
});

export const updateMediaAssetSchema = createMediaAssetSchema.partial();

export type CreateMediaAssetBody = z.infer<typeof createMediaAssetSchema>;
export type UpdateMediaAssetBody = z.infer<typeof updateMediaAssetSchema>;
