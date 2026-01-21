import { Request, Response } from "express";
import { detectLocale, localizeDoc, localizeList } from "../i18n/localize";
import { testimonialRepo } from "../repositories/testimonial.repo";
import type { TestimonialSource } from "../models/Testimonial";

function parseBool(input: any) {
  if (input == null) return undefined;
  if (typeof input === "boolean") return input;
  const value = String(input).trim().toLowerCase();
  if (["1", "true", "yes", "y"].includes(value)) return true;
  if (["0", "false", "no", "n"].includes(value)) return false;
  return undefined;
}

function parseNumber(input: any) {
  if (input == null || input === "") return undefined;
  const n = Number(input);
  return Number.isFinite(n) ? n : undefined;
}

function parseTestimonialSource(input: any): TestimonialSource | undefined {
  if (input == null) return undefined;
  const value = String(input).trim().toLowerCase();
  if (
    value === "google" ||
    value === "facebook" ||
    value === "website" ||
    value === "other"
  ) {
    return value;
  }
  return undefined;
}

function resolveLocale(req: Request) {
  const input =
    (req.query?.locale as string) ||
    (req.query?.lang as string) ||
    (req.headers["x-locale"] as string) ||
    (req.headers["x-language"] as string) ||
    (req.headers["accept-language"] as string) ||
    "";
  return detectLocale(input);
}

export const testimonialController = {
  async create(req: Request, res: Response) {
    try {
      const { quote_i18n, rating, authorName, sortOrder } = req.body || {};
      if (!quote_i18n || !authorName || rating == null || sortOrder == null) {
        return res.status(400).json({
          message: "quote_i18n, rating, authorName, sortOrder are required",
        });
      }

      const doc = await testimonialRepo.create(req.body || {});
      return res.status(201).json(doc);
    } catch (err: any) {
      return res.status(400).json({ message: err?.message || "Bad Request" });
    }
  },

  async listAdmin(req: Request, res: Response) {
    const {
      page,
      limit,
      q,
      source,
      isFeatured,
      minRating,
      maxRating,
    } = req.query as any;
    const result = await testimonialRepo.list({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      q: q ? String(q) : undefined,
      source: parseTestimonialSource(source),
      isFeatured: parseBool(isFeatured),
      includeInactive: true,
      minRating: parseNumber(minRating),
      maxRating: parseNumber(maxRating),
    });

    const locale = resolveLocale(req);
    const items = localizeList(result.items, locale, {
      fields: ["quote", "authorRole"],
    });
    res.json({ ...result, items });
  },

  async list(req: Request, res: Response) {
    const { page, limit, q, source, isFeatured, minRating, maxRating } =
      req.query as any;
    const result = await testimonialRepo.list({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      q: q ? String(q) : undefined,
      source: parseTestimonialSource(source),
      isFeatured: parseBool(isFeatured),
      includeInactive: false,
      minRating: parseNumber(minRating),
      maxRating: parseNumber(maxRating),
    });

    const locale = resolveLocale(req);
    const items = localizeList(result.items, locale, {
      fields: ["quote", "authorRole"],
    });
    res.json({ ...result, items });
  },

  async getOne(req: Request, res: Response) {
    const doc = await testimonialRepo.getByIdOrSlug(req.params.id);
    if (!doc || !doc.isActive)
      return res.status(404).json({ message: "Not found" });

    const locale = resolveLocale(req);
    return res.json(
      localizeDoc(doc, locale, { fields: ["quote", "authorRole"] })
    );
  },

  async getOneAdmin(req: Request, res: Response) {
    const doc = await testimonialRepo.getByIdOrSlug(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    const locale = resolveLocale(req);
    return res.json(
      localizeDoc(doc, locale, { fields: ["quote", "authorRole"] })
    );
  },

  async update(req: Request, res: Response) {
    try {
      const doc = await testimonialRepo.update(req.params.id, req.body || {});
      if (!doc) return res.status(404).json({ message: "Not found" });
      return res.json(doc);
    } catch (err: any) {
      return res.status(400).json({ message: err?.message || "Bad Request" });
    }
  },

  async remove(req: Request, res: Response) {
    const doc = await testimonialRepo.delete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    return res.json({ ok: true });
  },
};
