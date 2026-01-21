import mongoose from "mongoose";
import MediaAsset, {
  IMediaAsset,
  MediaKind,
  MediaProvider,
} from "../models/MediaAsset";

export type MediaAssetListOpts = {
  page?: number;
  limit?: number;
  q?: string;
  kind?: MediaKind;
  provider?: MediaProvider;
  tag?: string;
  includeInactive?: boolean;
};

export const mediaAssetRepo = {
  async create(data: Partial<IMediaAsset>) {
    const doc = new MediaAsset(data);
    return doc.save();
  },

  async update(id: string, data: Partial<IMediaAsset>) {
    const doc = await MediaAsset.findById(id);
    if (!doc) return null;
    Object.assign(doc, data);
    return doc.save();
  },

  async delete(id: string) {
    return MediaAsset.findByIdAndDelete(id);
  },

  async getByIdOrSlug(idOrSlug: string) {
    if (mongoose.isValidObjectId(idOrSlug)) {
      return MediaAsset.findById(idOrSlug).lean();
    }
    return MediaAsset.findOne({ slug: idOrSlug }).lean();
  },

  async list(opts: MediaAssetListOpts = {}) {
    const {
      page = 1,
      limit = 20,
      q,
      kind,
      provider,
      tag,
      includeInactive = false,
    } = opts;
    const filter: Record<string, any> = {};

    if (!includeInactive) filter.isActive = true;
    if (kind) filter.kind = kind;
    if (provider) filter.provider = provider;
    if (tag) filter.tags = tag;

    if (q?.trim()) {
      const rx = new RegExp(q.trim(), "i");
      filter.$or = [
        { slug: rx },
        { tags: rx },
        { "alt_i18n.vi": rx },
        { "alt_i18n.en": rx },
        { "caption_i18n.vi": rx },
        { "caption_i18n.en": rx },
      ];
    }

    const [items, total] = await Promise.all([
      MediaAsset.find(filter)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      MediaAsset.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  },
};
