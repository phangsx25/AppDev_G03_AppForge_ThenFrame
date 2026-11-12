export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export function validateRegistration({ name, email, password }) {
  if (!name?.trim() || name.trim().length > 100)
    return "Enter a display name (1–100 characters).";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "Enter a valid email address.";
  if (password.length < 8)
    return "Use at least 8 characters for your password.";
  return "";
}
export async function validateImage(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw Error("Use JPEG, PNG or WebP images.");
  if (file.size > MAX_IMAGE_BYTES || !file.size)
    throw Error("Each image must be non-empty and at most 8 MB.");
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const valid =
    file.type === "image/jpeg"
      ? b[0] === 255 && b[1] === 216 && b[2] === 255
      : file.type === "image/png"
        ? b.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10"
        : String.fromCharCode(...b.slice(0, 4)) === "RIFF" &&
          String.fromCharCode(...b.slice(8, 12)) === "WEBP";
  if (!valid) throw Error("Image contents do not match the file type.");
}
export const isPublic = (collection, photo) =>
  collection.visibility === "public" && photo.visibility === "public";
