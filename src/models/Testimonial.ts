import mongoose, {
  Document,
  Schema,
  Model,
  Types,
  CallbackWithoutResultAndOptionalError,
} from "mongoose";
import { LocalizedString, DEFAULT_LOCALE } from "../i18n/types";
import { LocalizedStringSchema } from "./Common";

export type TestimonialSource = "google" | "facebook" | "website" | "other";

export interface ITestimonial extends Document {
  slug: string;

  quote_i18n: LocalizedString;
  rating: number;

  authorName: string;
  authorRole_i18n?: LocalizedString;
  avatarInitials?: string;
  avatarAssetId?: Types.ObjectId;

  mediaAssetIds: Types.ObjectId[];

  source: TestimonialSource;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;

  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 180,
    },

    quote_i18n: { type: LocalizedStringSchema, required: true },

    rating: { type: Number, required: true, min: 1, max: 5 },

    authorName: { type: String, required: true, trim: true, maxlength: 160 },
    authorRole_i18n: { type: LocalizedStringSchema, default: undefined },
    avatarInitials: { type: String, trim: true, maxlength: 6 },

    avatarAssetId: { type: Schema.Types.ObjectId, ref: "MediaAsset" },

    mediaAssetIds: [
      { type: Schema.Types.ObjectId, ref: "MediaAsset" },
    ],

    source: {
      type: String,
      enum: ["google", "facebook", "website", "other"],
      default: "website",
    },

    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, required: true, min: 0 },
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
  const TestimonialModel = doc.constructor;

  const quoteEn = doc.quote_i18n?.en;
  const quoteDefault = doc.quote_i18n?.[DEFAULT_LOCALE];
  const quoteVi = doc.quote_i18n?.vi;

  const baseInput =
    doc.slug ||
    quoteEn ||
    quoteDefault ||
    quoteVi ||
    doc.authorName ||
    "testimonial";
  const base = slugify(baseInput).slice(0, 120);
  let candidate = base || "testimonial";
  let i = 2;

  while (
    await TestimonialModel.exists({
      slug: candidate,
      _id: { $ne: doc._id },
    })
  ) {
    candidate = `${base}-${i++}`;
  }

  doc.slug = candidate;
}

TestimonialSchema.pre("validate", async function (this: ITestimonial) {
  const doc: any = this;

  if (!doc.slug) {
    const quoteEn = doc.quote_i18n?.en;
    const quoteDefault = doc.quote_i18n?.[DEFAULT_LOCALE];
    const quoteVi = doc.quote_i18n?.vi;
    const baseInput =
      quoteEn || quoteDefault || quoteVi || doc.authorName || "testimonial";
    doc.slug = slugify(baseInput).slice(0, 120);
  } else {
    doc.slug = slugify(doc.slug).slice(0, 120);
  }
});

TestimonialSchema.pre("save", async function (this: ITestimonial) {
  const doc: any = this;
  if (doc.isNew || doc.isModified("slug")) {
    await ensureUniqueSlug(doc);
  }
});

TestimonialSchema.index({ slug: 1 }, { unique: true });
TestimonialSchema.index({ isActive: 1, sortOrder: 1 });
TestimonialSchema.index({ isFeatured: 1, isActive: 1, sortOrder: 1 });
TestimonialSchema.index({
  "quote_i18n.vi": "text",
  "quote_i18n.en": "text",
  "authorRole_i18n.vi": "text",
  "authorRole_i18n.en": "text",
  authorName: "text",
});

const TestimonialModel: Model<ITestimonial> =
  (mongoose.models.Testimonial as Model<ITestimonial>) ||
  mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);

export default TestimonialModel;
