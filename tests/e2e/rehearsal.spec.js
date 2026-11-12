import { test, expect } from "@playwright/test";
import path from "node:path";
const samples = [1, 2].map((n) => path.resolve(`demo-assets/sample-${n}.png`));
async function admin(page) {
  await page.goto("/admin/login");
  await page.getByRole("button", { name: "Continue as demo admin" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
async function create(page, title = "Sample ceremony") {
  await page.getByRole("link", { name: "+ Create collection" }).click();
  await page.getByLabel("Collection title").fill(title);
  await page
    .getByLabel("Description", { exact: true })
    .fill("Original demo illustrations. Not actual studio clients.");
  await page
    .getByRole("button", { name: "Create collection", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/collections\/[a-f0-9-]+$/);
}
test("connected gallery workflow: create, multiple upload, visibility, edit, reload, public viewing, delete", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await admin(page);
  await create(page);
  const editUrl = page.url();
  await page.getByLabel("Choose photos").setInputFiles(samples);
  await page
    .getByRole("button", { name: "Upload photos", exact: true })
    .click();
  await expect(page.locator(".photo-editor")).toHaveCount(2);
  await page.reload();
  await expect(page.locator(".photo-editor")).toHaveCount(2);
  await page.getByLabel("Collection title").fill("Edited sample ceremony");
  await page
    .getByRole("button", { name: "Save collection", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("saved");
  const first = page.locator(".photo-editor").first();
  await first.getByLabel("Photo caption").fill("Demo rings");
  await first.getByLabel("Photo visibility").selectOption("public");
  await first.getByRole("button", { name: "Save photo", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Photo saved");
  await page.goto("/portfolio");
  await expect(page.getByText("No published collections yet.")).toBeVisible();
  await page.goto(editUrl);
  await page.getByLabel("Collection visibility").selectOption("public");
  await page
    .getByRole("button", { name: "Save collection", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("saved");
  await page.goto("/portfolio");
  await page.getByRole("link", { name: /Edited sample ceremony/ }).click();
  await expect(page.locator("figure")).toHaveCount(1);
  await expect(page.getByText("Demo rings")).toBeVisible();
  await page.goto(editUrl);
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/admin\/login/);
  await page.goto("/portfolio");
  await page.getByRole("link", { name: /Edited sample ceremony/ }).click();
  await expect(page.locator("figure")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Upload photos" })).toHaveCount(
    0,
  );
  await admin(page);
  await page.goto(editUrl);
  page.on("dialog", (d) => d.accept());
  await page
    .locator(".photo-editor")
    .first()
    .getByRole("button", { name: "Delete photo" })
    .click();
  await expect(page.locator(".photo-editor")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Delete collection", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/collections$/);
  await expect(
    page.getByText("Create your first collection to begin."),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("simulated access guards and logout", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/admin\/login/);
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole("button", { name: "Continue as demo customer" }).click();
  await expect(page).toHaveURL(/account/);
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Access denied" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Log out" }).click();
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login$/);
});
test("rejects invalid uploads and shows empty public collection", async ({
  page,
}) => {
  await admin(page);
  await create(page, "Empty sample");
  await page
    .getByLabel("Choose photos")
    .setInputFiles({
      name: "bad.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake png"),
    });
  await page
    .getByRole("button", { name: "Upload photos", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("contents");
  await expect(page.locator(".photo-editor")).toHaveCount(0);
  await page.getByLabel("Collection visibility").selectOption("public");
  await page
    .getByRole("button", { name: "Save collection", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("saved");
  await page.getByRole("link", { name: "Preview public collection" }).click();
  await expect(page.getByText("No public photographs")).toBeVisible();
});
test("mobile layout and navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Your love story/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await admin(page);
  await create(page);
  await page.getByLabel("Choose photos").setInputFiles(samples);
  await page
    .getByRole("button", { name: "Upload photos", exact: true })
    .click();
  await expect(page.locator(".photo-editor")).toHaveCount(2);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("manifest, icons, service worker, offline fallback and cache boundaries", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  const manifest = await (
    await page.request.get("/manifest.webmanifest")
  ).json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons.map((i) => i.sizes)).toEqual(["192x192", "512x512"]);
  for (const size of [192, 512])
    expect(
      await page.evaluate(async (n) => {
        const img = new Image();
        img.src = `/icon-${n}.png`;
        await img.decode();
        return [img.naturalWidth, img.naturalHeight];
      }, size),
    ).toEqual([size, size]);
  const cache = await page.evaluate(async () => {
    const result = [];
    for (const key of await caches.keys())
      for (const r of await (await caches.open(key)).keys()) result.push(r.url);
    return result;
  });
  expect(cache.length).toBeGreaterThan(3);
  expect(cache.some((x) => /supabase|auth\/|storage\/|blob:/.test(x))).toBe(
    false,
  );
  await context.setOffline(true);
  await page.goto("/portfolio");
  await expect(
    page.getByRole("heading", { name: "You’re offline." }),
  ).toBeVisible();
  await context.setOffline(false);
});
