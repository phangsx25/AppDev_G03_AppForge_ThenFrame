import "fake-indexeddb/auto";
import { beforeAll, describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
let api, session;
beforeAll(async () => {
  vi.stubEnv("VITE_BACKEND", "demo");
  const data = new Map();
  vi.stubGlobal("sessionStorage", {
    getItem: (k) => data.get(k) || null,
    setItem: (k, v) => data.set(k, v),
  });
  api = await import("../src/gallery/api");
  session = await import("../src/lib/demo");
});
describe("US03/US04 real IndexedDB adapter with fake-indexeddb in Node, not browser E2E", () => {
  it("connected flow persists multiple blobs, edits, filters, and deletes", async () => {
    session.setDemoSession("admin");
    const c = await api.saveCollection({
      title: "Sample",
      description: "Demo illustration",
      style: "Garden",
      visibility: "hidden",
    });
    const files = [1, 2].map(
      (n) =>
        new File(
          [readFileSync(`demo-assets/sample-${n}.png`)],
          `sample-${n}.png`,
          { type: "image/png" },
        ),
    );
    expect(await api.uploadPhotos(c.id, files)).toBe(2);
    let photos = await api.listPhotos(c.id, true);
    expect(photos).toHaveLength(2);
    expect(photos.every((p) => p.visibility === "hidden")).toBe(true);
    const originalSize = photos[0].blob.size;
    await api.savePhoto(photos[0], {
      caption: "Edited caption",
      visibility: "public",
    });
    expect(await api.listCollections()).toHaveLength(0);
    expect(await api.listPhotos(c.id)).toHaveLength(0);
    await api.saveCollection(
      { ...c, title: "Edited collection", visibility: "public" },
      c.id,
    );
    expect((await api.listCollections())[0].title).toBe("Edited collection");
    expect(await api.listPhotos(c.id)).toHaveLength(1);
    photos = await api.listPhotos(c.id, true);
    const visible = photos.find((p) => p.visibility === "public");
    expect(visible.caption).toBe("Edited caption");
    expect((await api.photoBlob(visible)).size).toBe(originalSize);
    // Reload module to show storage is not just a component's in-memory array.
    vi.resetModules();
    const reloaded = await import("../src/gallery/api");
    expect(await reloaded.listPhotos(c.id, true)).toHaveLength(2);
    session.setDemoSession(null);
    expect(await reloaded.listPhotos(c.id)).toHaveLength(1);
    await expect(reloaded.uploadPhotos(c.id, files)).rejects.toThrow(
      "Administrator",
    );
    session.setDemoSession("customer");
    await expect(
      reloaded.saveCollection({ ...c, title: "Attack" }, c.id),
    ).rejects.toThrow("Administrator");
    session.setDemoSession("admin");
    await reloaded.removePhoto(visible);
    expect(await reloaded.listPhotos(c.id)).toHaveLength(0);
    await reloaded.removeCollection(c.id);
    expect(await reloaded.listCollections(true)).toHaveLength(0);
    expect(await reloaded.listPhotos(c.id, true)).toHaveLength(0);
  });
  it("validates entire batch before persisting invalid files", async () => {
    session.setDemoSession("admin");
    const c = await api.saveCollection({
      title: "Empty",
      description: "Demo",
      style: "Garden",
      visibility: "public",
    });
    const valid = new File(
        [readFileSync("demo-assets/sample-1.png")],
        "valid.png",
        { type: "image/png" },
      ),
      bad = new File(["bad"], "bad.png", { type: "image/png" });
    await expect(api.uploadPhotos(c.id, [valid, bad])).rejects.toThrow(
      "contents",
    );
    expect(await api.listPhotos(c.id, true)).toHaveLength(0);
    await api.removeCollection(c.id);
  });
});
