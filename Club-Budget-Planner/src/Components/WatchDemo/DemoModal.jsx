import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, X, BarChart3 } from "lucide-react";

/**
 * ClubVault — Watch Demo modal window.
 * Import and drop in anywhere. Controlled via `open` + `onClose`.
 *
 * Usage:
 *   const [demoOpen, setDemoOpen] = useState(false);
 *   <button onClick={() => setDemoOpen(true)}>Watch Demo</button>
 *   <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
 *
 * Once you have a real video, pass one of:
 *   videoSrc="/path/to/demo.mp4"
 *   youtubeId="dQw4w9WgXcQ"
 * and it'll play that instead of the simulated placeholder.
 */
export default function DemoModal({ open, onClose, videoSrc, youtubeId }) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);
  const DURATION = 96; // seconds, placeholder runtime

  useEffect(() => {
    if (!open) {
      setPlaying(false);
      setElapsed(0);
      clearInterval(intervalRef.current);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (playing && !videoSrc && !youtubeId) {
      intervalRef.current = setInterval(() => {
        setElapsed((t) => {
          if (t >= DURATION) {
            setPlaying(false);
            return DURATION;
          }
          return t + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, videoSrc, youtubeId]);

  if (!open) return null;

  const progress = (elapsed / DURATION) * 100;
  const fmt = (s) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ClubVault product demo"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(23, 20, 17, 0.66)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "24px",
        animation: "cv-fade 0.18s ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "860px",
          background: "#FAF9F6",
          borderRadius: "16px",
          border: "1px solid rgba(20,17,14,0.08)",
          boxShadow: "0 24px 64px rgba(20,17,14,0.28)",
          overflow: "hidden",
          animation: "cv-rise 0.22s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px 16px",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#8a8378",
                fontFamily:
                  "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              Product walkthrough
            </p>
            <h2
              style={{
                margin: "2px 0 0",
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "22px",
                fontWeight: 700,
                color: "#171310",
              }}
            >
              See ClubVault in action
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close demo"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "999px",
              border: "1px solid rgba(20,17,14,0.12)",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <X size={16} color="#171310" />
          </button>
        </div>

        {/* video area */}
        <div
          style={{
            position: "relative",
            margin: "0 24px",
            aspectRatio: "16 / 9",
            borderRadius: "10px",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, #211c17 0%, #171310 55%, #0f0c0a 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {videoSrc ? (
            <video
              src={videoSrc}
              controls
              autoPlay
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : youtubeId ? (
            <iframe
              title="ClubVault demo"
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
              style={{ width: "100%", height: "100%", border: 0 }}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0.35,
                  backgroundImage:
                    "radial-gradient(circle at 25% 30%, rgba(255,255,255,0.08), transparent 40%), radial-gradient(circle at 75% 70%, rgba(255,255,255,0.06), transparent 45%)",
                }}
              />
              <button
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Pause demo" : "Play demo"}
                style={{
                  width: "68px",
                  height: "68px",
                  borderRadius: "999px",
                  background: "#FAF9F6",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                  transition: "transform 0.15s ease",
                  zIndex: 2,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.06)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                {playing ? (
                  <Pause size={26} color="#171310" fill="#171310" />
                ) : (
                  <Play
                    size={26}
                    color="#171310"
                    fill="#171310"
                    style={{ marginLeft: "3px" }}
                  />
                )}
              </button>

              <div
                style={{
                  position: "absolute",
                  left: "20px",
                  bottom: "20px",
                  background: "rgba(250,249,246,0.94)",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  minWidth: "180px",
                }}
              >
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "8px",
                    background: "#171310",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <BarChart3 size={16} color="#FAF9F6" />
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "9px",
                      letterSpacing: "0.06em",
                      color: "#8a8378",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    FALL BUDGET
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#171310",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    $12,450
                  </p>
                </div>
              </div>

              <div
                style={{
                  position: "absolute",
                  left: "20px",
                  right: "20px",
                  bottom: "0",
                  height: "3px",
                  background: "rgba(255,255,255,0.15)",
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    background: "#FAF9F6",
                    transition: "width 1s linear",
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px 24px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "#6f685d",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {videoSrc || youtubeId
              ? "A quick tour of budgets, spending, and approvals."
              : `${fmt(elapsed)} / ${fmt(DURATION)} — sample video not yet added`}
          </p>
          <button
            onClick={onClose}
            style={{
              background: "#171310",
              color: "#FAF9F6",
              border: "none",
              borderRadius: "8px",
              padding: "9px 18px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes cv-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cv-rise { from { opacity: 0; transform: translateY(12px) scale(0.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </div>
  );
}