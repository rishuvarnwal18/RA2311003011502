"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const weight = { placement: 30, result: 20, event: 10 };
const color = { placement: "green", result: "orange", event: "#1565c0" };

export default function Page() {
  const [notes, setNotes] = useState([]);
  const [seen, setSeen] = useState([]);
  const [top, setTop] = useState(10);
  const [type, setType] = useState("all");
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
        const res = await fetch(`/api/notifications?limit=100&page=1`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err?.error || "Fetch failed");
        }
        const data = await res.json();
        setNotes(data?.notifications || data || []);
      } catch (e) {
        setError(e?.message || "Unable to load");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const items = useMemo(() => {
    return notes
      .map((n) => {
        const t = String(n.Type || "unknown").toLowerCase();
        const ts = Math.floor(new Date(n.Timestamp).getTime() / 1000);
        const score = (weight[t] || 0) * 1e10 + ts;
        return { ...n, type: t, score };
      })
      .filter((n) => type === "all" || n.type === type)
      .sort((a, b) => b.score - a.score)
      .slice(0, top);
  }, [notes, type, top]);

  const mark = (id) => {
    if (seen.includes(id)) return;
    const next = [...seen, id];
    setSeen(next);
    localStorage.setItem("seen_ids", JSON.stringify(next));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      <header style={{ background: "#e65100", color: "#fff", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 18, fontWeight: 700 }}>Priority Inbox</span>
        <button onClick={() => router.push("/")} style={{ background: "transparent", border: "1px solid #fff", color: "#fff", padding: "8px 16px", cursor: "pointer" }}>
          Back
        </button>
      </header>
      <main style={{ padding: 24 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            Top
            <select value={top} onChange={(e) => setTop(Number(e.target.value))}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            Type
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">All</option>
              <option value="placement">Placement</option>
              <option value="result">Result</option>
              <option value="event">Event</option>
            </select>
          </label>
        </div>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <span>Loading...</span>
          </div>
        ) : error ? (
          <div style={{ padding: 16, background: "#fdecea", color: "#611a15", borderRadius: 8 }}>
            {error}
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: 16, background: "#eef6fc", color: "#0b3d91", borderRadius: 8 }}>
            No priority items
          </div>
        ) : (
          items.map((n, idx) => {
            const seenFlag = seen.includes(n.ID);
            return (
              <article
                key={n.ID}
                onClick={() => mark(n.ID)}
                style={{
                  marginBottom: 16,
                  padding: 16,
                  borderRadius: 12,
                  background: "#fff",
                  borderLeft: `6px solid ${color[n.type] || "#999"}`,
                  opacity: seenFlag ? 0.6 : 1,
                  cursor: "pointer"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: seenFlag ? 400 : 700, fontSize: 16 }}>{n.Message}</div>
                    <div style={{ marginTop: 8, color: "#666" }}>{n.Timestamp}</div>
                  </div>
                  <div style={{ alignSelf: "start", background: color[n.type] || "#999", color: "#fff", padding: "4px 10px", borderRadius: 16, fontSize: 12 }}>
                    {n.Type}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </main>
    </div>
  );
}
