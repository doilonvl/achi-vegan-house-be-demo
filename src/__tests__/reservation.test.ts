/// <reference types="jest" />
/**
 * TEST RESERVATION ENDPOINT
 *
 * Endpoint POST /reservation-requests là public (không cần auth).
 * Test tập trung vào:
 * 1. Zod validation - từ chối request thiếu/sai dữ liệu
 * 2. Business logic - tạo reservation thành công
 * 3. Honeypot - bot submission bị block
 */

import request from "supertest";
import app from "../app";

// Mock rate limiter để không bị block 429 trong tests
// Trong thực tế production, rate limiter vẫn hoạt động bình thường
jest.mock(
  "express-rate-limit",
  () => () => (_req: any, _res: any, next: any) => next(),
);

jest.mock("../repositories/reservationRequest.repo", () => ({
  reservationRequestRepo: {
    create: jest.fn(),
    list: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
  },
}));

// Mock email service - không gửi email thật trong tests
jest.mock("../services/sendReservationEmail", () => ({
  sendReservationEmail: jest.fn().mockResolvedValue(void 0),
}));

import { reservationRequestRepo } from "../repositories/reservationRequest.repo";

const BASE = "/api/v1/reservation-requests";

// Dữ liệu hợp lệ để tái sử dụng
const validPayload = {
  fullName: "Nguyen Van A",
  phoneNumber: "0901234567",
  email: "nguyenvana@gmail.com",
  guestCount: 4,
  reservationDate: "2026-06-15",
  reservationTime: "19:00",
  note: "Yêu cầu bàn ngoài trời",
};

describe("POST /reservation-requests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Validation tests ---
  it("400 khi thiếu fullName", async () => {
    const { fullName, ...body } = validPayload;
    const res = await request(app).post(BASE).send(body);
    expect(res.status).toBe(400);
    expect(res.body.errors.fullName).toBeDefined();
  });

  it("400 khi thiếu phoneNumber", async () => {
    const { phoneNumber, ...body } = validPayload;
    const res = await request(app).post(BASE).send(body);
    expect(res.status).toBe(400);
    expect(res.body.errors.phoneNumber).toBeDefined();
  });

  it("400 khi guestCount = 0 (< min)", async () => {
    const res = await request(app)
      .post(BASE)
      .send({ ...validPayload, guestCount: 0 });
    expect(res.status).toBe(400);
    expect(res.body.errors.guestCount).toBeDefined();
  });

  it("400 khi guestCount vượt quá 100", async () => {
    const res = await request(app)
      .post(BASE)
      .send({ ...validPayload, guestCount: 101 });
    expect(res.status).toBe(400);
  });

  it("400 khi email sai format", async () => {
    const res = await request(app)
      .post(BASE)
      .send({ ...validPayload, email: "khong-phai-email" });
    expect(res.status).toBe(400);
    expect(res.body.errors.email).toBeDefined();
  });

  // --- Honeypot test ---
  it("202 khi request từ bot (honeypot field có giá trị)", async () => {
    // Bot thường fill tất cả fields, kể cả field ẩn "website"
    const res = await request(app)
      .post(BASE)
      .send({ ...validPayload, website: "http://spam.com" });
    // Controller trả 202 Accepted (giả vờ thành công để bot không biết bị chặn)
    expect(res.status).toBe(202);
  });

  // --- Success test ---
  it("201 khi tạo reservation thành công", async () => {
    const mockDoc = {
      _id: { toString: () => "mock-reservation-id" },
      ...validPayload,
      reservationDate: new Date("2026-06-15"),
      source: "website",
      status: "new",
      save: jest.fn().mockResolvedValue(undefined),
    };
    (reservationRequestRepo.create as jest.Mock).mockResolvedValue(mockDoc);

    const res = await request(app).post(BASE).send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.id).toBe("mock-reservation-id");
    expect(res.body.status).toBe("new");
    // Đảm bảo repo.create được gọi đúng 1 lần
    expect(reservationRequestRepo.create).toHaveBeenCalledTimes(1);
  });
});
