import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as api from "./api";
import { Heading, Empty, Photo, Status } from "../shared/UI";
export function AdminHome({ list = false }) {
  const [rows, setRows] = useState([]),
    [count, setCount] = useState(0),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    api
      .listCollections(true)
      .then(async (c) => {
        const p = await Promise.all(c.map((x) => api.listPhotos(x.id, true)));
        if (alive) {
          setRows(c);
          setCount(p.flat().length);
        }
      })
      .catch((e) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);
  return (
    <section className="page">
      <Heading
        label="STUDIO / SPRINT 1"
        title={list ? "Your collections." : "A space for your stories."}
      >
        <Link className="button" to="/admin/collections/new">
          + Create collection
        </Link>
      </Heading>
      <p className="muted">
        Sprint 1 gallery statistics · Admin / Photographer
      </p>
      <Status error={error} />
      {loading ? (
        <p role="status">Loading gallery…</p>
      ) : (
        <>
          <div className="stats">
            {[
              ["Collections", rows.length],
              [
                "Published collections",
                rows.filter((c) => c.visibility === "public").length,
              ],
              ["Photographs", count],
            ].map(([label, n]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{n}</strong>
              </div>
            ))}
          </div>
          <div className="section-title">
            <h2>Collection library</h2>
            <Link to="/portfolio">View public portfolio ↗</Link>
          </div>
          {!rows.length ? (
            <Empty>Create your first collection to begin.</Empty>
          ) : (
            <div className="collection-list">
              {rows.map((c) => (
                <Link key={c.id} to={"/admin/collections/" + c.id}>
                  <div>
                    <h3>{c.title}</h3>
                    <p>
                      {c.style} · {c.description}
                    </p>
                  </div>
                  <span className={"badge " + c.visibility}>
                    {c.visibility}
                  </span>
                  <span>Manage ↗</span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
export function EditCollection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fresh = !id;
  const [values, setValues] = useState({
      title: "",
      description: "",
      style: "Traditional Malay wedding",
      visibility: "hidden",
    }),
    [photos, setPhotos] = useState([]),
    [loading, setLoading] = useState(!fresh),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const loadPhotos = async () => setPhotos(await api.listPhotos(id, true));
  useEffect(() => {
    if (!id) return;
    let alive = true;
    Promise.all([api.listCollections(true), api.listPhotos(id, true)])
      .then(([c, p]) => {
        const row = c.find((x) => x.id === id);
        if (!row) throw Error("Collection not found.");
        if (alive) {
          setValues(row);
          setPhotos(p);
        }
      })
      .catch((e) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);
  async function perform(fn) {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const field = (name) => ({
    value: values[name],
    onChange: (e) => setValues({ ...values, [name]: e.target.value }),
  });
  if (loading) return <p role="status">Loading collection…</p>;
  return (
    <section className="page">
      <Link to="/admin/collections">← Collection library</Link>
      <Heading
        label="STUDIO / GALLERY MANAGEMENT"
        title={fresh ? "Begin a new collection." : "Shape the story."}
      />
      <Status error={error} message={message} />
      <div className="editor-grid">
        <form
          className="panel"
          onSubmit={(e) => {
            e.preventDefault();
            perform(async () => {
              const c = await api.saveCollection(values, id);
              setMessage("Collection saved.");
              if (fresh) navigate("/admin/collections/" + c.id);
            });
          }}
        >
          <h2>Collection details</h2>
          <label>
            Collection title
            <input required maxLength="150" {...field("title")} />
          </label>
          <label>
            Description
            <textarea
              required
              rows="4"
              maxLength="3000"
              {...field("description")}
            />
          </label>
          <label>
            Wedding style
            <input required maxLength="80" list="styles" {...field("style")} />
            <datalist id="styles">
              <option>Traditional Malay wedding</option>
              <option>Contemporary</option>
              <option>Garden wedding</option>
              <option>Couple portraits</option>
            </datalist>
          </label>
          <label>
            Collection visibility
            <select {...field("visibility")}>
              <option value="hidden">Hidden</option>
              <option value="public">Public</option>
            </select>
          </label>
          <p className="muted">
            Only public photos inside a public collection appear in the
            portfolio. Uploads start hidden.
          </p>
          <button disabled={busy}>
            {busy ? "Saving…" : fresh ? "Create collection" : "Save collection"}
          </button>
        </form>
        <aside className="panel subtle">
          <span className="eyebrow">FROM STUDIO TO STORY</span>
          <h2>Ready to share?</h2>
          <ol>
            <li>Create your collection.</li>
            <li>Upload your photographs.</li>
            <li>Set selected photos to Public.</li>
            <li>Set the collection to Public and save.</li>
          </ol>
          {!fresh && (
            <>
              <Link to={"/portfolio/" + id}>Preview public collection ↗</Link>
              <hr />
              <button
                className="danger"
                disabled={busy}
                onClick={() => {
                  if (
                    confirm(
                      "Delete this collection and all its photos? This cannot be undone.",
                    )
                  )
                    perform(async () => {
                      await api.removeCollection(id);
                      navigate("/admin/collections");
                    });
                }}
              >
                Delete collection
              </button>
            </>
          )}
        </aside>
      </div>
      {!fresh && (
        <>
          <div className="section-title">
            <div>
              <h2>Photographs</h2>
              <p>
                JPEG, PNG or WebP · up to 8 MB each · multiple files supported
              </p>
            </div>
          </div>
          <form
            className="upload"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const files = Array.from(form.elements.photos.files);
              perform(async () => {
                try {
                  const n = await api.uploadPhotos(id, files);
                  setMessage(`${n} photos uploaded as hidden.`);
                  form.reset();
                } finally {
                  await loadPhotos();
                }
              });
            }}
          >
            <label>
              Choose photos
              <input
                name="photos"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                required
                disabled={busy}
              />
            </label>
            <button disabled={busy}>
              {busy ? "Uploading…" : "Upload photos"}
            </button>
          </form>
          {photos.length ? (
            <div className="photo-editor-grid">
              {photos.map((p) => (
                <PhotoEditor
                  key={p.id}
                  photo={p}
                  disabled={busy}
                  onSave={(v) =>
                    perform(async () => {
                      await api.savePhoto(p, v);
                      await loadPhotos();
                      setMessage("Photo saved.");
                    })
                  }
                  onDelete={() => {
                    if (confirm("Delete this photo permanently?"))
                      perform(async () => {
                        await api.removePhoto(p);
                        await loadPhotos();
                        setMessage("Photo deleted.");
                      });
                  }}
                />
              ))}
            </div>
          ) : (
            <Empty>No photos yet. Add your first photographs above.</Empty>
          )}
        </>
      )}
    </section>
  );
}
function PhotoEditor({ photo, onSave, onDelete, disabled }) {
  const [caption, setCaption] = useState(photo.caption),
    [visibility, setVisibility] = useState(photo.visibility);
  return (
    <form
      className="photo-editor"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ caption, visibility });
      }}
    >
      <Photo photo={photo} />
      <div className="photo-fields">
        <label>
          Photo caption
          <input
            value={caption}
            maxLength="500"
            onChange={(e) => setCaption(e.target.value)}
          />
        </label>
        <label>
          Photo visibility
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
          >
            <option value="hidden">Hidden</option>
            <option value="public">Public</option>
          </select>
        </label>
        <div className="actions">
          <button disabled={disabled}>Save photo</button>
          <button
            disabled={disabled}
            type="button"
            className="ghost"
            onClick={onDelete}
          >
            Delete photo
          </button>
        </div>
      </div>
    </form>
  );
}
