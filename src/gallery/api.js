import { demo, requireBackend, check } from "../lib/backend";
import { demoDB, demoSession } from "../lib/demo";
import { validateImage } from "../lib/validation";
function guard() {
  if (demo && demoSession()?.role !== "admin")
    throw Error("Administrator access required.");
}
export async function listCollections(admin = false) {
  if (admin) guard();
  if (demo) {
    const rows = await demoDB.all("collections");
    return rows
      .filter((c) => admin || c.visibility === "public")
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  let q = requireBackend()
    .from("gallery_collections")
    .select("*")
    .order("created_at", { ascending: false });
  if (!admin) q = q.eq("visibility", "public");
  return check(await q);
}
export async function listPhotos(id, admin = false) {
  if (admin) guard();
  if (demo) {
    const c = (await demoDB.all("collections")).find((x) => x.id === id);
    return (await demoDB.all("photos")).filter(
      (p) =>
        p.collection_id === id &&
        (admin || (c?.visibility === "public" && p.visibility === "public")),
    );
  }
  let q = requireBackend()
    .from("gallery_photos")
    .select("*")
    .eq("collection_id", id)
    .order("created_at");
  if (!admin) q = q.eq("visibility", "public");
  return check(await q);
}
export async function saveCollection(value, id) {
  guard();
  const row = {
    title: value.title.trim(),
    description: value.description.trim(),
    style: value.style.trim(),
    visibility: value.visibility,
    updated_at: new Date().toISOString(),
  };
  if (!row.title || !row.description)
    throw Error("Title and description are required.");
  if (demo) {
    const old = id
      ? (await demoDB.all("collections")).find((c) => c.id === id)
      : null;
    const next = {
      ...old,
      ...row,
      id: id || crypto.randomUUID(),
      created_at: old?.created_at || new Date().toISOString(),
    };
    await demoDB.put("collections", next);
    return next;
  }
  const q = requireBackend().from("gallery_collections");
  return check(
    await (id ? q.update(row).eq("id", id) : q.insert(row)).select().single(),
  );
}
export async function uploadPhotos(id, files) {
  guard();
  if (!files.length) throw Error("Choose at least one image.");
  for (const file of files) await validateImage(file);
  let saved = 0;
  for (const file of files) {
    const photoId = crypto.randomUUID();
    const path = `${id}/${photoId}.${{ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[file.type]}`;
    const row = {
      id: photoId,
      collection_id: id,
      storage_path: path,
      caption: file.name,
      visibility: "hidden",
      created_at: new Date().toISOString(),
    };
    try {
      if (demo) await demoDB.put("photos", { ...row, blob: file });
      else {
        const s = requireBackend();
        check(
          await s.storage
            .from("gallery")
            .upload(path, file, { cacheControl: "0", upsert: false }),
        );
        const r = await s.from("gallery_photos").insert(row);
        if (r.error) {
          await s.storage.from("gallery").remove([path]);
          throw r.error;
        }
      }
      saved++;
    } catch (e) {
      throw Error(
        `${saved} of ${files.length} uploaded. ${e.message} Refresh the list before retrying remaining files.`,
      );
    }
  }
  return saved;
}
export async function savePhoto(photo, values) {
  guard();
  const patch = {
    caption: values.caption.trim(),
    visibility: values.visibility,
  };
  if (demo) return demoDB.put("photos", { ...photo, ...patch });
  check(
    await requireBackend()
      .from("gallery_photos")
      .update(patch)
      .eq("id", photo.id),
  );
}
export async function removePhoto(photo) {
  guard();
  if (demo) return demoDB.remove("photos", photo.id);
  const s = requireBackend();
  check(await s.storage.from("gallery").remove([photo.storage_path]));
  check(await s.from("gallery_photos").delete().eq("id", photo.id));
}
export async function removeCollection(id) {
  guard();
  for (const p of await listPhotos(id, true)) await removePhoto(p);
  if (demo) return demoDB.remove("collections", id);
  check(
    await requireBackend().from("gallery_collections").delete().eq("id", id),
  );
}
export async function photoBlob(photo) {
  if (demo) return photo.blob;
  return check(
    await requireBackend().storage.from("gallery").download(photo.storage_path),
  );
}
