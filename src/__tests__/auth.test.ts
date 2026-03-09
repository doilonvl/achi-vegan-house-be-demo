/// <reference types="jest" />
/**
 * TEST AUTH ENDPOINTS
 *
 * Khái niệm quan trọng: MOCKING
 * --------------------------------
 * Vấn đề: authController gọi userRepo.getByEmail() → cần kết nối MongoDB thật
 * Giải pháp: "mock" module userRepo = thay thế bằng hàm giả do Jest tạo
 *
 * jest.mock("path/to/module") thay toàn bộ module bằng object giả.
 * Sau đó dùng (fn as jest.Mock).mockResolvedValue(data) để định nghĩa giá trị trả về.
 */

import request from "supertest";
import app from "../app";

// --- BƯỚC 1: MOCK các dependencies ---
// Jest sẽ intercept import này và trả về object giả thay vì code thật
jest.mock("../repositories/user.repo", () => ({
  userRepo: {
    getByEmail: jest.fn(), // hàm giả, chưa có giá trị trả về
    getById: jest.fn(),
  },
}));

jest.mock("../utils/password", () => ({
  verifyPassword: jest.fn(),
  hashPassword: jest.fn(),
}));

jest.mock("../utils/jwt", () => ({
  signAccessToken: jest.fn(() => "fake-access-token"),
  signRefreshToken: jest.fn(() => "fake-refresh-token"),
  setAuthCookies: jest.fn(),     // không làm gì, chỉ ghi nhận đã được gọi
  clearAuthCookies: jest.fn(),
  verifyRefreshToken: jest.fn(),
}));

// --- BƯỚC 2: Import các mock đã khai báo để dùng trong test ---
import { userRepo } from "../repositories/user.repo";
import { verifyPassword } from "../utils/password";

const BASE = "/api/v1/auth";

describe("POST /auth/login", () => {
  // Reset mock state trước mỗi test để các test không ảnh hưởng nhau
  beforeEach(() => jest.clearAllMocks());

  // --- Tests validation (Zod middleware) ---
  it("400 khi thiếu email", async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ password: "secret123" });

    expect(res.status).toBe(400);
    // Zod trả về { message: "Validation error", errors: { email: [...] } }
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.email).toBeDefined();
  });

  it("400 khi email sai format", async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: "khong-phai-email", password: "secret123" });

    expect(res.status).toBe(400);
    expect(res.body.errors.email).toBeDefined();
  });

  it("400 khi thiếu password", async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: "admin@test.com" });

    expect(res.status).toBe(400);
    expect(res.body.errors.password).toBeDefined();
  });

  // --- Tests business logic (controller) ---
  it("401 khi không tìm thấy user", async () => {
    // Định nghĩa: khi getByEmail được gọi, trả về null (user không tồn tại)
    (userRepo.getByEmail as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: "ghost@test.com", password: "secret123" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("401 khi sai password", async () => {
    const mockUser = {
      id: "user-id-1",
      email: "admin@test.com",
      passwordHash: "hashed_password",
      isActive: true,
      role: "admin",
      fullName: "Admin",
      lastLoginAt: new Date(),
      save: jest.fn(),
    };
    (userRepo.getByEmail as jest.Mock).mockResolvedValue(mockUser);
    // verifyPassword trả về false = sai mật khẩu
    (verifyPassword as jest.Mock).mockResolvedValue(false);

    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: "admin@test.com", password: "wrong_password" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("403 khi account bị inactive", async () => {
    const mockUser = {
      id: "user-id-2",
      email: "inactive@test.com",
      passwordHash: "hashed",
      isActive: false, // <- bị khóa
      role: "admin",
      fullName: "Inactive User",
      save: jest.fn(),
    };
    (userRepo.getByEmail as jest.Mock).mockResolvedValue(mockUser);
    (verifyPassword as jest.Mock).mockResolvedValue(true);

    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: "inactive@test.com", password: "correct" });

    expect(res.status).toBe(403);
  });

  it("200 khi login thành công", async () => {
    const mockUser = {
      id: "user-id-3",
      email: "admin@achiveganhouse.com",
      passwordHash: "hashed",
      isActive: true,
      role: "admin",
      fullName: "Admin Achi",
      lastLoginAt: new Date(),
      save: jest.fn().mockResolvedValue(undefined), // save() không cần làm gì thật
    };
    (userRepo.getByEmail as jest.Mock).mockResolvedValue(mockUser);
    (verifyPassword as jest.Mock).mockResolvedValue(true);

    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: "admin@achiveganhouse.com", password: "correct" });

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("admin@achiveganhouse.com");
    expect(res.body.role).toBe("admin");
    // Không bao giờ trả về passwordHash!
    expect(res.body.passwordHash).toBeUndefined();
  });
});
