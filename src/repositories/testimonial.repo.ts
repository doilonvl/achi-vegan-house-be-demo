import mongoose from "mongoose";
import Testimonial, {
  ITestimonial,
  TestimonialSource,
} from "../models/Testimonial";

export type TestimonialListOpts = {
  page?: number;
  limit?: number;
  q?: string;
  source?: TestimonialSource;
  isFeatured?: boolean;
  includeInactive?: boolean;
  minRating?: number;
  maxRating?: number;
};

export const testimonialRepo = {
  async create(data: Partial<ITestimonial>) {
    console.log("[DEBUG] testimonialRepo.create: Data before save:", JSON.stringify(data, null, 2));
    const doc = new Testimonial(data);
    return doc.save();
  },

  async update(id: string, data: Partial<ITestimonial>) {
    const doc = await Testimonial.findById(id);
    if (!doc) return null;
    Object.assign(doc, data);
    return doc.save();
  },

  async delete(id: string) {
    return Testimonial.findByIdAndDelete(id);
  },

  async getByIdOrSlug(idOrSlug: string) {
    if (mongoose.isValidObjectId(idOrSlug)) {
      return Testimonial.findById(idOrSlug).lean();
    }
    return Testimonial.findOne({ slug: idOrSlug }).lean();
  },

  async list(opts: TestimonialListOpts = {}) {
    const {
      page = 1,
      limit = 20,
      q,
      source,
      isFeatured,
      includeInactive = false,
      minRating,
      maxRating,
    } = opts;
    const filter: Record<string, any> = {};

    if (!includeInactive) filter.isActive = true;
    if (source) filter.source = source;
    if (typeof isFeatured === "boolean") filter.isFeatured = isFeatured;

    if (typeof minRating === "number" || typeof maxRating === "number") {
      filter.rating = {};
      if (typeof minRating === "number") filter.rating.$gte = minRating;
      if (typeof maxRating === "number") filter.rating.$lte = maxRating;
    }

    if (q?.trim()) {
      const rx = new RegExp(q.trim(), "i");
      filter.$or = [
        { slug: rx },
        { authorName: rx },
        { "quote_i18n.vi": rx },
        { "quote_i18n.en": rx },
        { "authorRole_i18n.vi": rx },
        { "authorRole_i18n.en": rx },
      ];
    }

    const [items, total] = await Promise.all([
      Testimonial.find(filter)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Testimonial.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  },
};
