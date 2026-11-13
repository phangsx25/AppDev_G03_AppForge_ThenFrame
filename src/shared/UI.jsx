import { useEffect, useState } from "react";
import { photoBlob } from "../gallery/api";
export function Photo({ photo }) {
  const [url, setUrl] = useState(""),
    [error, setError] = useState(false);
  useEffect(() => {
    let alive = true,
      objectUrl;
    setUrl("");
    setError(false);
    photoBlob(photo)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        if (alive) setUrl(objectUrl);
        else URL.revokeObjectURL(objectUrl);
      })
      .catch(() => {
        if (alive) setError(true);
      });
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photo.id, photo.storage_path]);
  return url ? (
    <img
      loading="lazy"
      src={url}
      alt={photo.caption || "Wedding collection photograph"}
    />
  ) : (
    <div className="placeholder">
      {error ? "Photo unavailable — try refreshing" : "Loading photograph…"}
    </div>
  );
}
export function Status({ error, message }) {
  return (
    <>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
    </>
  );
}
export function Empty({ children }) {
  return (
    <div className="empty">
      <span aria-hidden="true">◇</span>
      <p>{children}</p>
    </div>
  );
}
export function Heading({ label, title, children }) {
  return (
    <div className="heading">
      <div>
        <span className="eyebrow">{label}</span>
        <h1>{title}</h1>
      </div>
      {children}
    </div>
  );
}
