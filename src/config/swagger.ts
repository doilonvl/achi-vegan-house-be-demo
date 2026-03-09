import type { Application } from "express";
import type { OpenAPIV3 } from "openapi-types";

const spec: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "Achi Vegan House API",
    version: "1.0.0",
    description: "REST API for Achi Vegan House backend",
  },
  servers: [
    {
      url: process.env.API_BASE || "/api/v1",
      description: "API base",
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "access_token",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
      LoginBody: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 1 },
        },
      },
      UserResponse: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string" },
          fullName: { type: "string" },
          role: { type: "string" },
        },
      },
      ReservationCreate: {
        type: "object",
        required: ["fullName", "phoneNumber", "guestCount", "reservationDate", "reservationTime"],
        properties: {
          fullName: { type: "string", maxLength: 160 },
          phoneNumber: { type: "string", maxLength: 40 },
          email: { type: "string", format: "email" },
          guestCount: { type: "integer", minimum: 1, maximum: 100 },
          reservationDate: { type: "string", format: "date-time" },
          reservationTime: { type: "string" },
          note: { type: "string", maxLength: 1000 },
          source: { type: "string", enum: ["website", "phone", "walk_in", "other"] },
        },
      },
      ReservationStatusUpdate: {
        type: "object",
        required: ["status"],
        properties: {
          status: { type: "string", enum: ["new", "emailed", "confirmed", "cancelled"] },
        },
      },
      TestimonialCreate: {
        type: "object",
        required: ["quote_i18n", "authorName", "rating", "sortOrder"],
        properties: {
          quote_i18n: { type: "object", additionalProperties: { type: "string" } },
          authorName: { type: "string" },
          rating: { type: "number", minimum: 1, maximum: 5 },
          sortOrder: { type: "integer", minimum: 0 },
          source: { type: "string", enum: ["google", "facebook", "website", "other"] },
          isFeatured: { type: "boolean" },
          isActive: { type: "boolean" },
        },
      },
      MediaAssetCreate: {
        type: "object",
        required: ["url", "type"],
        properties: {
          url: { type: "string" },
          type: { type: "string", enum: ["image", "video"] },
          caption_i18n: { type: "object", additionalProperties: { type: "string" } },
          tags: { type: "array", items: { type: "string" } },
          isActive: { type: "boolean" },
        },
      },
    },
  },
  paths: {
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Admin login",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginBody" } } },
        },
        responses: {
          200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/UserResponse" } } } },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout",
        responses: { 200: { description: "Logged out" } },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token",
        responses: {
          200: { description: "New access token" },
          401: { description: "Invalid refresh token" },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current admin user",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "User info", content: { "application/json": { schema: { $ref: "#/components/schemas/UserResponse" } } } },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/reservation-requests": {
      post: {
        tags: ["Reservations"],
        summary: "Create reservation (public, rate-limited)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ReservationCreate" } } },
        },
        responses: {
          201: { description: "Created" },
          422: { description: "Validation error" },
          429: { description: "Too many requests" },
        },
      },
      get: {
        tags: ["Reservations"],
        summary: "List reservations (admin)",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "List of reservations" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/reservation-requests/{id}": {
      get: {
        tags: ["Reservations"],
        summary: "Get one reservation (admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Reservation" }, 404: { description: "Not found" } },
      },
    },
    "/reservation-requests/{id}/status": {
      patch: {
        tags: ["Reservations"],
        summary: "Update reservation status (admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ReservationStatusUpdate" } } },
        },
        responses: { 200: { description: "Updated" }, 404: { description: "Not found" } },
      },
    },
    "/testimonials": {
      get: {
        tags: ["Testimonials"],
        summary: "List active testimonials (public)",
        responses: { 200: { description: "List" } },
      },
      post: {
        tags: ["Testimonials"],
        summary: "Create testimonial (admin)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/TestimonialCreate" } } },
        },
        responses: { 201: { description: "Created" } },
      },
    },
    "/testimonials/{id}": {
      get: {
        tags: ["Testimonials"],
        summary: "Get testimonial (public)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Testimonial" }, 404: { description: "Not found" } },
      },
      patch: {
        tags: ["Testimonials"],
        summary: "Update testimonial (admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Updated" } },
      },
      delete: {
        tags: ["Testimonials"],
        summary: "Delete testimonial (admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted" } },
      },
    },
    "/media-assets": {
      get: {
        tags: ["Media Assets"],
        summary: "List active media assets (public)",
        responses: { 200: { description: "List" } },
      },
      post: {
        tags: ["Media Assets"],
        summary: "Create media asset (admin)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/MediaAssetCreate" } } },
        },
        responses: { 201: { description: "Created" } },
      },
    },
    "/media-assets/{id}": {
      get: {
        tags: ["Media Assets"],
        summary: "Get media asset (public)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Media asset" }, 404: { description: "Not found" } },
      },
      patch: {
        tags: ["Media Assets"],
        summary: "Update media asset (admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Updated" } },
      },
      delete: {
        tags: ["Media Assets"],
        summary: "Delete media asset (admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted" } },
      },
    },
    "/blogs": {
      get: {
        tags: ["Blogs"],
        summary: "List blogs (admin)",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "List" } },
      },
      post: {
        tags: ["Blogs"],
        summary: "Create blog (admin)",
        security: [{ cookieAuth: [] }],
        responses: { 201: { description: "Created" } },
      },
    },
    "/blogs/{id}": {
      get: {
        tags: ["Blogs"],
        summary: "Get blog by id (admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Blog" }, 404: { description: "Not found" } },
      },
      put: {
        tags: ["Blogs"],
        summary: "Update blog (admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Updated" } },
      },
      delete: {
        tags: ["Blogs"],
        summary: "Delete blog (admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted" } },
      },
    },
    "/blogs/{id}/publish": {
      patch: {
        tags: ["Blogs"],
        summary: "Publish blog (admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Published" } },
      },
    },
    "/blogs/{id}/archive": {
      patch: {
        tags: ["Blogs"],
        summary: "Archive blog (admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Archived" } },
      },
    },
    "/blogs/{id}/schedule": {
      patch: {
        tags: ["Blogs"],
        summary: "Schedule blog (admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Scheduled" } },
      },
    },
    "/public/blogs": {
      get: {
        tags: ["Public"],
        summary: "List published blogs (public)",
        responses: { 200: { description: "List of published blogs" } },
      },
    },
    "/upload": {
      post: {
        tags: ["Upload"],
        summary: "Upload file to Cloudinary (admin)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          content: { "multipart/form-data": { schema: { type: "object", properties: { file: { type: "string", format: "binary" } } } } },
        },
        responses: { 200: { description: "Upload result" } },
      },
    },
  },
};

export function setupSwagger(app: Application): void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const swaggerUi = require("swagger-ui-express") as typeof import("swagger-ui-express");
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
  app.get("/api-docs.json", (_req, res) => res.json(spec));
}
