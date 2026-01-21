import { Request, Response } from "express";
import { detectLocale, localizeDoc, localizeList } from "../i18n/localize";
import { mediaAssetRepo } from "../repositories/mediaAsset.repo";
import type { MediaKind, MediaProvider } from "../models/MediaAsset";

function parseBool(input: any) {
  if (input == null) return undefined;
  if (typeof input === "boolean") return input;
  const value = String(input).trim().toLowerCase();
  if (["1", "true", "yes", "y"].includes(value)) return true;
  if (["0", "false", "no", "n"].includes(value)) return false;
  return undefined;
}

function parseMediaKind(input: any): MediaKind | undefined {
  if (input == null) return undefined;
  const value = String(input).trim().toLowerCase();
  if (value === "image" || value === "video") return value;
  return undefined;
}

function parseMediaProvider(input: any): MediaProvider | undefined {
  if (input == null) return undefined;
  const value = String(input).trim().toLowerCase();
  if (
    value === "cloudinary" ||
    value === "vdrive" ||
    value === "s3" ||
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

export const mediaAssetController = {
  async create(req: Request, res: Response) {
    try {
      const { kind, url, sortOrder } = req.body || {};
      if (!kind || !url || sortOrder === undefined) {
        return res
          .status(400)
          .json({ message: "kind, url, sortOrder are required" });
      }

      const doc = await mediaAssetRepo.create(req.body || {});
      return res.status(201).json(doc);
    } catch (err: any) {
      return res.status(400).json({ message: err?.message || "Bad Request" });
    }
  },

  async list(req: Request, res: Response) {
    const { page, limit, q, kind, provider, tag } = req.query as any;
    const result = await mediaAssetRepo.list({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      q: q ? String(q) : undefined,
      kind: parseMediaKind(kind),
      provider: parseMediaProvider(provider),
      tag: tag ? String(tag) : undefined,
      includeInactive: false,
    });

    const locale = resolveLocale(req);
    const items = localizeList(result.items, locale, {
      fields: ["alt", "caption"],
    });
    res.json({ ...result, items });
  },

  async getOne(req: Request, res: Response) {
    const doc = await mediaAssetRepo.getByIdOrSlug(req.params.id);
    if (!doc || !doc.isActive)
      return res.status(404).json({ message: "Not found" });

    const locale = resolveLocale(req);
    return res.json(localizeDoc(doc, locale, { fields: ["alt", "caption"] }));
  },

  async listAdmin(req: Request, res: Response) {
    const { page, limit, q, kind, provider, tag } = req.query as any;
    const result = await mediaAssetRepo.list({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      q: q ? String(q) : undefined,
      kind: parseMediaKind(kind),
      provider: parseMediaProvider(provider),
      tag: tag ? String(tag) : undefined,
      includeInactive: true,
    });

    const locale = resolveLocale(req);
    const items = localizeList(result.items, locale, {
      fields: ["alt", "caption"],
    });
    res.json({ ...result, items });
  },

  async getOneAdmin(req: Request, res: Response) {
    const doc = await mediaAssetRepo.getByIdOrSlug(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    const locale = resolveLocale(req);
    return res.json(localizeDoc(doc, locale, { fields: ["alt", "caption"] }));
  },

  async update(req: Request, res: Response) {
    try {
      const doc = await mediaAssetRepo.update(req.params.id, req.body || {});
      if (!doc) return res.status(404).json({ message: "Not found" });
      return res.json(doc);
    } catch (err: any) {
      return res.status(400).json({ message: err?.message || "Bad Request" });
    }
  },

  async remove(req: Request, res: Response) {
    const doc = await mediaAssetRepo.delete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    return res.json({ ok: true });
  },
};
