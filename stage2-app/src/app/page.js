"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const map = { placement: "green", result: "orange", event: "#1565c0" };

export default function Page() {
  const [notes, setNotes] = useState([]);
  const [seen, setSeen] = useState([]);
  const [mode, setMode] = useState("all");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("seen_ids") : null;
    setSeen(raw ? JSON.parse(raw) : []);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const tokenRes = await fetch("/api/token");
        const { token } = await tokenRes.json();
        const res = await fetch(`/api/notifications?limit=10&page=${page}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err?.error || "Fetch failed");
        }
        const data = await res.json();
        setNotes(data?.notifications || data || []);
        setCount(data?.total ? Math.max(1, Math.ceil(data.total / 10)) : 5);
      } catch (e) {
        setError(e?.message || "Unable to load");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  const filtered = useMemo(
    () => notes.filter((n) => {
      const type = String(n?.Type || "unknown").toLowerCase();
      return mode === "all" || type === mode;
    }),
    [notes, mode]
  );

  const unread = filtered.filter((n) => !seen.includes(n.ID)).length;

  const mark = (id) => {
    if (seen.includes(id)) return;
    const next = [...seen, id];
    setSeen(next);
    localStorage.setItem("seen_ids", JSON.stringify(next));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb" }}>
      <header style={{ background: "#0d1b4b", color: "#fff", padding: 16, display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>Campus Notifications</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={() => router.push("/priority")} style={{ color: "#fff", background: "transparent", border: "1px solid #fff", padding: "8px 14px", cursor: "pointer" }}>
            Priority Inbox
          </button>
          <span style={{ background: "#e65100", color: "#fff", borderRadius: 9999, padding: "6px 12px", fontWeight: 700 }}>
            Unread {unread}
          </span>
        </div>
      </header>

      <main style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
            <span>Loading...</span>
          </div>
        ) : error ? (
          <div style={{ padding: 16, background: "#fdecea", color: "#611a15", borderRadius: 8 }}>{error}</div>
        ) : (
          <>
            <section style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 24 }}>
              <div style={{ fontWeight: 700 }}>Filter:</div>
              {['all', 'placement', 'result', 'event'].map((value) => (
                <button
                  key={value}
                  onClick={() => setMode(value)}
                  style={{
                    padding: '8px 14px',
                    cursor: 'pointer',
                    border: mode === value ? '2px solid #0d1b4b' : '1px solid #ccc',
                    background: mode === value ? '#0d1b4b' : '#fff',
                    color: mode === value ? '#fff' : '#000',
                    borderRadius: 8,
                  }}
                >
                  {value === 'all' ? 'All' : value.charAt(0).toUpperCase() + value.slice(1)}
                </button>
              ))}
            </section>

            {filtered.length === 0 ? (
              <div style={{ padding: 16, background: "#eef6fc", color: "#0b3d91", borderRadius: 8 }}>No notifications</div>
            ) : (
              filtered.map((n) => {
                const typeLabel = n?.Type ? String(n.Type) : "Unknown";
                const key = String(typeLabel).toLowerCase();
                const seenFlag = seen.includes(n.ID);
                return (
                  <article
                    key={n.ID}
                    onClick={() => mark(n.ID)}
                    style={{
                      marginBottom: 16,
                      padding: 16,
                      borderRadius: 14,
                      background: "#fff",
                      borderLeft: `6px solid ${map[key] || "#999"}`,
                      opacity: seenFlag ? 0.65 : 1,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: seenFlag ? 500 : 700, marginBottom: 8 }}>{n.Message}</div>
                        <div style={{ color: "#666", fontSize: 14 }}>{n.Timestamp}</div>
                      </div>
                      <div style={{ background: map[key] || "#999", color: "#fff", padding: "6px 12px", borderRadius: 12, fontSize: 12, whiteSpace: "nowrap" }}>
                        {n.Type}
                      </div>
                    </div>
                  </article>
                );
              })
            )}

            <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginTop: 24 }}>
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                style={{ padding: "10px 14px", cursor: page === 1 ? "not-allowed" : "pointer", borderRadius: 8, border: "1px solid #ccc", background: "#fff" }}
              >
                Prev
              </button>
              <span style={{ alignSelf: "center" }}>
                Page {page} of {count}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(count, prev + 1))}
                disabled={page === count}
                style={{ padding: "10px 14px", cursor: page === count ? "not-allowed" : "pointer", borderRadius: 8, border: "1px solid #ccc", background: "#fff" }}
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
