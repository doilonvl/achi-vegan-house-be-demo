import mongoose, {
  Document,
  Schema,
  Model,
} from "mongoose";
import { LocalizedString, DEFAULT_LOCALE } from "../i18n/types";
import { LocalizedStringSchema } from "./Common";

export type MediaKind = "image" | "video";
export type MediaProvider = "cloudinary" | "vdrive" | "s3" | "other";

export interface IMediaAsset extends Document {
  slug: string;

  kind: MediaKind;
  provider: MediaProvider;

  url: string;

  publicId?: string;
  folder?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;

  alt_i18n?: LocalizedString;
  caption_i18n?: LocalizedString;

  tags?: string[];
  sortOrder: number;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const MediaAssetSchema = new Schema<IMediaAsset>(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 180,
    },

    kind: { type: String, enum: ["image", "video"], required: true },
    provider: {
      type: String,
      enum: ["cloudinary", "vdrive", "s3", "other"],
      default: "cloudinary",
    },

    url: { type: String, required: true, trim: true, maxlength: 2048 },

    publicId: { type: String, trim: true, maxlength: 300 },
    folder: { type: String, trim: true, maxlength: 300 },
    format: { type: String, trim: true, maxlength: 40 },
    width: { type: Number, min: 1, max: 20000 },
    height: { type: Number, min: 1, max: 20000 },
    bytes: { type: Number, min: 0 },

    alt_i18n: { type: LocalizedStringSchema, default: undefined },
    caption_i18n: { type: LocalizedStringSchema, default: undefined },

    tags: [{ type: String, trim: true, maxlength: 60 }],
    sortOrder: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const slugify = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

async function ensureUniqueSlug(doc: any) {
  const MediaAssetModel = doc.constructor;

  const altEn = doc.alt_i18n?.en;
  const altDefault = doc.alt_i18n?.[DEFAULT_LOCALE];
  const altVi = doc.alt_i18n?.vi;

  const baseInput =
    doc.slug || altEn || altDefault || altVi || doc.publicId || "media";
  const base = slugify(baseInput);
  let candidate = base || "media";
  let i = 2;

  while (
    await MediaAssetModel.exists({
      slug: candidate,
      _id: { $ne: doc._id },
    })
  ) {
    candidate = `${base}-${i++}`;
  }

  doc.slug = candidate;
}

MediaAssetSchema.pre("validate", function (this: IMediaAsset) {
  const doc: any = this;

  if (!doc.slug) {
    const altEn = doc.alt_i18n?.en;
    const altDefault = doc.alt_i18n?.[DEFAULT_LOCALE];
    const altVi = doc.alt_i18n?.vi;
    const baseInput = altEn || altDefault || altVi || doc.publicId || "media";
    doc.slug = slugify(baseInput);
  } else {
    doc.slug = slugify(doc.slug);
  }
});

MediaAssetSchema.pre("save", async function (this: IMediaAsset) {
  const doc: any = this;
  if (doc.isNew || doc.isModified("slug")) {
    await ensureUniqueSlug(doc);
  }
});

MediaAssetSchema.index({ slug: 1 }, { unique: true });
MediaAssetSchema.index({ kind: 1, isActive: 1, sortOrder: 1 });
MediaAssetSchema.index({ provider: 1, createdAt: -1 });
MediaAssetSchema.index({
  "alt_i18n.vi": "text",
  "alt_i18n.en": "text",
  "caption_i18n.vi": "text",
  "caption_i18n.en": "text",
  tags: "text",
});

const MediaAssetModel: Model<IMediaAsset> =
  (mongoose.models.MediaAsset as Model<IMediaAsset>) ||
  mongoose.model<IMediaAsset>("MediaAsset", MediaAssetSchema);

export default MediaAssetModel;
