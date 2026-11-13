import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import vm from "node:vm";
function worker() {
  const events = {},
    added = [],
    intercepts = [];
  let claimed = false;
  const self = {
    __WB_MANIFEST: [
      { url: "icon-192.png", revision: "a" },
      { url: "icon-192.png", revision: "a" },
      { url: "offline.html", revision: "b" },
    ],
    location: { origin: "https://demo.test" },
    clients: {
      claim: () => {
        claimed = true;
      },
    },
    addEventListener: (name, fn) => (events[name] = fn),
  };
  const caches = {
    open: async () => ({
      addAll: async (urls) => {
        if (new Set(urls).size !== urls.length)
          throw Error("Duplicate cache requests");
        added.push(...urls);
      },
    }),
    keys: async () => [],
    match: async () => new Response("offline"),
  };
  vm.runInNewContext(readFileSync("src/sw.js", "utf8"), {
    self,
    caches,
    URL,
    fetch: async () => {
      throw Error("offline");
    },
  });
  return { events, added, intercepts };
}
it("worker install deduplicates auto-included manifest assets", async () => {
  const w = worker();
  let result;
  w.events.install({ waitUntil: (p) => (result = p) });
  await result;
  expect(w.added).toEqual(["icon-192.png", "offline.html"]);
});
it("worker never intercepts remote storage or same-origin API requests", () => {
  const w = worker();
  for (const url of [
    "https://project.supabase.co/storage/v1/object/x",
    "https://demo.test/auth/token",
    "https://demo.test/api/profile",
  ])
    w.events.fetch({
      request: { method: "GET", url, mode: "cors" },
      respondWith: (p) => w.intercepts.push(p),
    });
  expect(w.intercepts).toHaveLength(0);
});
it("offline navigation uses dedicated fallback", async () => {
  const w = worker();
  let response;
  w.events.fetch({
    request: {
      method: "GET",
      url: "https://demo.test/portfolio",
      mode: "navigate",
    },
    respondWith: (p) => (response = p),
  });
  expect(await (await response).text()).toBe("offline");
});
