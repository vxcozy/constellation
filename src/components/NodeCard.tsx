"use client";

import { useEffect, useState, useMemo } from "react";
import type { PositionedNode } from "@/lib/layout";
import { edges } from "@/data/graph";

interface NodeCardProps {
  node: PositionedNode | null;
  theme: "dark" | "light";
  isMobile: boolean;
  pinned: boolean;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  center: "Hub",
  project: "Solo Project",
  studio: "Studio",
  "studio-project": "Project",
};

function getConnectionCount(nodeId: string): number {
  return edges.filter((e) => e.source === nodeId || e.target === nodeId).length;
}

function getInitials(label: string): string {
  const words = label.split(/[\s-]+/);
  if (words.length === 1) return label.slice(0, 2).toUpperCase();
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function NodeCard({ node, theme, isMobile, pinned, onClose }: NodeCardProps) {
  const [visible, setVisible] = useState(false);
  const [activeNode, setActiveNode] = useState<PositionedNode | null>(null);
  const [imgError, setImgError] = useState(false);
  const isDark = theme === "dark";

  useEffect(() => {
    if (node) {
      setActiveNode(node);
      setImgError(false);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
      const timeout = setTimeout(() => setActiveNode(null), 200);
      return () => clearTimeout(timeout);
    }
  }, [node]);

  const connectionCount = useMemo(
    () => (activeNode ? getConnectionCount(activeNode.id) : 0),
    [activeNode]
  );

  const n = activeNode;
  if (!n) return null;

  const link = n.url || n.github;
  const linkType = n.github ? "GitHub" : "Website";
  const typeLabel = TYPE_LABELS[n.type] || n.type;

  // Transparent theme colors — glass-like card
  const bg = isDark ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.15)";
  const border = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const text = isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)";
  const textMuted = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
  const textSecondary = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
  const divider = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const tagBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const tagBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const avatarBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const avatarText = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";

  // Shared monospace font stack matching the base UI
  const mono = "var(--font-geist-mono), monospace";

  // Mobile: bottom sheet. Desktop: right sidebar.
  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        maxHeight: "50vh",
        overflowY: "auto",
        transform: visible ? "translateY(0)" : "translateY(100%)",
        opacity: visible ? 1 : 0,
        transition: "transform 200ms ease, opacity 200ms ease",
      }
    : {
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "300px",
        zIndex: 50,
        overflowY: "auto",
        transform: visible ? "translateX(0)" : "translateX(100%)",
        opacity: visible ? 1 : 0,
        transition: "transform 200ms ease, opacity 200ms ease",
      };

  return (
    <div className={pinned ? "pointer-events-auto" : "pointer-events-none"} style={{ ...panelStyle, contain: "layout style" }}>
      <div
        style={{
          position: "relative",
          height: "100%",
          background: bg,
          borderLeft: isMobile ? "none" : `1px solid ${border}`,
          borderTop: isMobile ? `1px solid ${border}` : "none",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          padding: isMobile ? "20px 24px 28px" : "28px 24px",
          display: "flex",
          flexDirection: "column",
          overflowY: pinned ? "auto" : "hidden",
          contain: "layout style",
        }}
      >
        {/* Close button — only visible when pinned */}
        {pinned && (
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: isMobile ? "12px" : "16px",
              right: isMobile ? "16px" : "16px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: text,
              transition: "opacity 150ms",
              opacity: 0.6,
              zIndex: 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
            aria-label="Close card"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="4" x2="20" y2="20" />
              <line x1="20" y1="4" x2="4" y2="20" />
            </svg>
          </button>
        )}

        {/* Avatar + Type badge */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: avatarBg,
              border: `1px solid ${border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {n.image && !imgError ? (
              <img
                src={n.image}
                alt={n.label}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={() => setImgError(true)}
              />
            ) : (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  color: avatarText,
                  fontFamily: mono,
                }}
              >
                {getInitials(n.label)}
              </span>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                fontSize: "8px",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: textMuted,
                fontFamily: mono,
                display: "block",
                marginBottom: "3px",
              }}
            >
              {typeLabel}
            </span>

            <h2
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: text,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                lineHeight: 1.3,
                margin: 0,
                fontFamily: mono,
              }}
            >
              {n.label}
            </h2>
          </div>
        </div>

        {/* Tagline */}
        {n.description && (
          <p
            style={{
              fontSize: "10px",
              lineHeight: 1.5,
              color: textSecondary,
              margin: "0 0 14px 0",
              letterSpacing: "0.04em",
              fontFamily: mono,
            }}
          >
            {n.description}
          </p>
        )}

        {/* Metadata rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "14px" }}>
          {n.role && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span style={{ fontSize: "10px", color: textSecondary, letterSpacing: "0.06em", fontFamily: mono }}>
                {n.role}
              </span>
            </div>
          )}

          {n.period && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span style={{ fontSize: "10px", color: textSecondary, letterSpacing: "0.06em", fontFamily: mono }}>
                {n.period}
              </span>
            </div>
          )}

          {link && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span
                style={{
                  fontSize: "10px",
                  color: textMuted,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.04em",
                  fontFamily: mono,
                }}
              >
                {linkType === "GitHub" ? n.github?.replace("https://github.com/", "") : n.url?.replace(/^https?:\/\/(www\.)?/, "")}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {n.tags && n.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "14px" }}>
            {n.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "8px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  padding: "2px 6px",
                  borderRadius: "2px",
                  background: tagBg,
                  border: `1px solid ${tagBorder}`,
                  color: textMuted,
                  fontFamily: mono,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div style={{ borderTop: `1px solid ${divider}`, margin: "0 0 12px 0" }} />

        {/* Connections */}
        <div style={{ marginBottom: "12px" }}>
          <span
            style={{
              fontSize: "8px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: textMuted,
              fontFamily: mono,
              display: "block",
              marginBottom: "4px",
            }}
          >
            Connections
          </span>
          <span style={{ fontSize: "10px", color: textSecondary, letterSpacing: "0.06em", fontFamily: mono }}>
            {connectionCount} linked node{connectionCount !== 1 ? "s" : ""} in constellation
          </span>
        </div>

        {/* Bio */}
        {n.fullDescription && (
          <>
            <div style={{ borderTop: `1px solid ${divider}`, margin: "0 0 12px 0" }} />
            <div>
              <span
                style={{
                  fontSize: "8px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: textMuted,
                  fontFamily: mono,
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                About
              </span>
              <p
                style={{
                  fontSize: "10px",
                  lineHeight: 1.7,
                  color: textSecondary,
                  margin: 0,
                  letterSpacing: "0.02em",
                  fontFamily: mono,
                }}
              >
                {n.fullDescription}
              </p>
            </div>
          </>
        )}

        {/* Link action */}
        {link && (
          <>
            <div style={{ borderTop: `1px solid ${divider}`, margin: "12px 0 12px 0" }} />
            {pinned ? (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "8px",
                  letterSpacing: "0.1em",
                  color: textMuted,
                  fontFamily: mono,
                  textTransform: "uppercase",
                  textDecoration: "none",
                  transition: "color 150ms",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = text)}
                onMouseLeave={(e) => (e.currentTarget.style.color = textMuted)}
              >
                Visit {linkType === "GitHub" ? "repo" : "site"} ↗
              </a>
            ) : (
              <span
                style={{
                  fontSize: "8px",
                  letterSpacing: "0.1em",
                  color: textMuted,
                  fontFamily: mono,
                  textTransform: "uppercase",
                }}
              >
                Click node to pin card ↗
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
