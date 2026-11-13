import { describe, it, expect } from "vitest";
import {
  validateRegistration,
  validateImage,
  isPublic,
  MAX_IMAGE_BYTES,
} from "../src/lib/validation";
describe("US01 registration input validation", () => {
  it("accepts valid customer details", () =>
    expect(
      validateRegistration({
        name: "Demo user",
        email: "demo@example.test",
        password: "long-password",
      }),
    ).toBe(""));
  it.each([
    { name: "", email: "a@b.test", password: "12345678" },
    { name: "A", email: "invalid", password: "12345678" },
    { name: "A", email: "a@b.test", password: "short" },
  ])("rejects invalid registration %o", (value) =>
    expect(validateRegistration(value)).not.toBe(""),
  );
});
describe("US03 upload validation", () => {
  it("accepts PNG signature", async () => {
    await expect(
      validateImage(
        new File(
          [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])],
          "photo.png",
          { type: "image/png" },
        ),
      ),
    ).resolves.toBeUndefined();
  });
  it("rejects unsupported file type", async () => {
    await expect(
      validateImage(new File(["x"], "x.svg", { type: "image/svg+xml" })),
    ).rejects.toThrow("JPEG");
  });
  it("rejects spoofed MIME", async () => {
    await expect(
      validateImage(new File(["not an image"], "x.png", { type: "image/png" })),
    ).rejects.toThrow("contents");
  });
  it("rejects oversize file", async () => {
    await expect(
      validateImage({ type: "image/png", size: MAX_IMAGE_BYTES + 1 }),
    ).rejects.toThrow("8 MB");
  });
  it("rejects empty file", async () => {
    await expect(
      validateImage(new File([], "x.png", { type: "image/png" })),
    ).rejects.toThrow("non-empty");
  });
});
describe("US04 visibility rules", () => {
  it.each([
    ["public", "public", true],
    ["hidden", "public", false],
    ["public", "hidden", false],
    ["hidden", "hidden", false],
  ])("%s collection + %s photo", (c, p, expected) =>
    expect(isPublic({ visibility: c }, { visibility: p })).toBe(expected),
  );
});
