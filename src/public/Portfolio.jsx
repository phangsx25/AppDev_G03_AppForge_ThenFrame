import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { listCollections, listPhotos } from "../gallery/api";
import { Photo, Empty, Status, Heading } from "../shared/UI";
export function CollectionCard({ collection }) {
  const [photos, setPhotos] = useState([]);
  useEffect(() => {
    let alive = true;
    listPhotos(collection.id)
      .then((p) => {
        if (alive) setPhotos(p);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [collection.id]);
  return (
    <Link className="collection-card" to={"/portfolio/" + collection.id}>
      <div className="card-image">
        {photos[0] ? (
          <Photo photo={photos[0]} />
        ) : (
          <div className="placeholder">A story waiting to be shared</div>
        )}
      </div>
      <div className="card-title">
        <h3>{collection.title}</h3>
        <span>↗</span>
      </div>
      <span className="eyebrow">{collection.style}</span>
      <p>{collection.description}</p>
    </Link>
  );
}
export function Portfolio({ home = false }) {
  const [rows, setRows] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [style, setStyle] = useState("All styles");
  useEffect(() => {
    let alive = true;
    listCollections()
      .then((data) => {
        if (alive) setRows(data);
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
        label={home ? "A FEW FRAMES OF FOREVER" : "THE THENFRAME PORTFOLIO"}
        title={
          home ? "Stories worth holding onto." : "Find a little inspiration."
        }
      >
        {home ? (
          <Link className="text-link" to="/portfolio">
            Explore the portfolio ↗
          </Link>
        ) : (
          <label className="filter">
            Wedding style
            <select value={style} onChange={(e) => setStyle(e.target.value)}>
              {["All styles", ...new Set(rows.map((c) => c.style))].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        )}
      </Heading>
      <Status error={error} />
      {loading ? (
        <p role="status">Loading collections…</p>
      ) : (
        !error && (
          <>
            {rows.length === 0 ? (
              <Empty>
                No published collections yet. Please visit again soon.
              </Empty>
            ) : (
              <div className="gallery-grid">
                {rows
                  .filter((c) => style === "All styles" || c.style === style)
                  .slice(0, home ? 3 : undefined)
                  .map((c) => (
                    <CollectionCard key={c.id} collection={c} />
                  ))}
              </div>
            )}
          </>
        )
      )}
    </section>
  );
}
export function CollectionDetails() {
  const { id } = useParams();
  const [collection, setCollection] = useState(null),
    [photos, setPhotos] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    Promise.all([listCollections(), listPhotos(id)])
      .then(([c, p]) => {
        if (alive) {
          setCollection(c.find((x) => x.id === id));
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
  return (
    <section className="page">
      <Link to="/portfolio">← All collections</Link>
      {loading ? (
        <p role="status">Loading collection…</p>
      ) : error ? (
        <Status error={error} />
      ) : !collection ? (
        <Empty>This collection is unavailable or hidden.</Empty>
      ) : (
        <>
          <Heading label={collection.style} title={collection.title} />
          <p className="intro">{collection.description}</p>
          {photos.length ? (
            <div className="gallery-grid">
              {photos.map((p) => (
                <figure key={p.id}>
                  <Photo photo={p} />
                  <figcaption>{p.caption}</figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <Empty>No public photographs in this collection yet.</Empty>
          )}
        </>
      )}
    </section>
  );
}
export function Home() {
  return (
    <>
      <section className="hero page">
        <div>
          <span className="eyebrow">WEDDING PHOTOGRAPHY · THENFRAME</span>
          <h1>
            Your love story,
            <br />
            beautifully
            <br />
            <em>captured.</em>
          </h1>
          <p>
            The quiet glances. The joyful celebrations.
            <br />
            Explore the moments that feel like you.
          </p>
          <Link className="button" to="/portfolio">
            Explore the portfolio ↗
          </Link>
          <div className="hero-note">
            PRESENT IN THE MOMENT. PRESERVED IN A FRAME.
          </div>
        </div>
        <div className="hero-art">
          <div className="arch">
            <span className="art-mark">
              T<span>F</span>
            </span>
            <p>
              A love story,
              <br />
              in every frame.
            </p>
            <span className="eyebrow">THENFRAME PHOTOGRAPHY</span>
          </div>
          <div className="art-caption">
            For the moments that become forever.
          </div>
        </div>
      </section>
      <div className="statement">
        <span className="eyebrow">THOUGHTFULLY FRAMED</span>
        <p>
          The tenderness, the tradition,
          <br />
          and everything in between.
        </p>
      </div>
      <Portfolio home />
    </>
  );
}
