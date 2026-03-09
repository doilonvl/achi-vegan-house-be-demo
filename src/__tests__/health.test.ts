/// <reference types="jest" />
/**
 * TEST ĐƠN GIẢN NHẤT: Health check endpoint
 *
 * Không cần mock gì vì /healthz không dùng DB hay external service.
 * Đây là test đầu tiên nên học - hiểu flow cơ bản của Supertest.
 */

import request from "supertest";
import app from "../app";

// `describe` = nhóm các tests liên quan lại
describe("GET /healthz", () => {
  // `it` (hoặc `test`) = một test case cụ thể
  it("trả về status 200 và { ok: true }", async () => {
    // `request(app)` = Supertest wrap app Express của mình
    // Không cần start server, Supertest tự xử lý
    const res = await request(app).get("/healthz");

    // `expect` = kiểm tra kết quả
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
