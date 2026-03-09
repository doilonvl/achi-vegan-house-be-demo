import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware factory: validates req.body against a Zod schema.
 * On success, replaces req.body with the parsed (typed + sanitized) data.
 * On failure, returns 400 with field-level error messages.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: result.error.flatten().fieldErrors,
      });
    }

    req.body = result.data;
    next();
  };
}
