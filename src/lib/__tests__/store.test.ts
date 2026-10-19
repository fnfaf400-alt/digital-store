import { describe, expect, it } from "vitest";
import { formatMoney } from "../money";
import { checkoutSchema, productSchema, registerSchema } from "../checkout";
import { createDownloadToken, createLicenseKey, slugify } from "../slug";
import { hashPassword, verifyPassword } from "../password";

describe("money", () => {
  it("formats SAR from cents", () => {
    expect(formatMoney(7900)).toBe("79.00 ر.س");
  });
});

describe("slug and keys", () => {
  it("slugifies arabic and latin titles", () => {
    expect(slugify("دليل بناء متجر")).toBe("دليل-بناء-متجر");
    expect(slugify("Hello World!")).toBe("hello-world");
  });

  it("creates unique license and download tokens", () => {
    const a = createLicenseKey();
    const b = createLicenseKey();
    expect(a).toMatch(/^[A-Z0-9]{4}(-[A-Z0-9]{4}){3}$/);
    expect(a).not.toBe(b);
    expect(createDownloadToken()).toHaveLength(48);
  });
});

describe("validation", () => {
  it("accepts a valid customer registration", () => {
    const parsed = registerSchema.parse({
      name: "سارة",
      email: "sara@example.com",
      password: "secret12",
    });
    expect(parsed.email).toBe("sara@example.com");
  });

  it("rejects short passwords", () => {
    expect(() =>
      registerSchema.parse({ name: "سارة", email: "sara@example.com", password: "123" }),
    ).toThrow();
  });

  it("accepts checkout and product payloads", () => {
    expect(checkoutSchema.parse({ productId: "abc" }).productId).toBe("abc");
    expect(
      productSchema.parse({
        title: "كتاب تجريبي",
        description: "وصف قصير كافٍ للمنتج الرقمي",
        longDescription: "هذا وصف أطول يوضح محتوى الملف وما سيحصل عليه المشتري بعد الدفع.",
        priceCents: 1000,
        type: "كتاب",
        coverEmoji: "📘",
        fileName: "book.txt",
        fileContent: "محتوى الملف",
        downloadLimit: 5,
        categoryId: "cat_1",
      }).title,
    ).toBe("كتاب تجريبي");
  });
});

describe("passwords", () => {
  it("hashes and verifies", async () => {
    const hash = await hashPassword("Admin123!");
    expect(hash).not.toBe("Admin123!");
    await expect(verifyPassword("Admin123!", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong", hash)).resolves.toBe(false);
  });
});
