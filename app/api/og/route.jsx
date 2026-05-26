import { ImageResponse } from "next/og";

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 };

const VERTICAL_STYLES = {
  home: { bg: "#000000", accent: "#AE7E56", fg: "#ffffff", badge: "MyRocky" },
  ed: { bg: "#1a1a1a", accent: "#AE7E56", fg: "#ffffff", badge: "Sexual Health" },
  wl: { bg: "#06291e", accent: "#00A76F", fg: "#ffffff", badge: "Weight Loss" },
  hair: { bg: "#1f1b16", accent: "#AE7E56", fg: "#ffffff", badge: "Hair Loss" },
  "mental-health": { bg: "#1e293b", accent: "#94a3b8", fg: "#ffffff", badge: "Mental Health" },
  skincare: { bg: "#F5F4EF", accent: "#AE7E56", fg: "#1a1a1a", badge: "Skincare" },
  smoking: { bg: "#3b1d09", accent: "#EA580C", fg: "#ffffff", badge: "Quit Smoking" },
  blog: { bg: "#111827", accent: "#AE7E56", fg: "#ffffff", badge: "Article" },
  longevity: { bg: "#1e1b4b", accent: "#a5b4fc", fg: "#ffffff", badge: "Longevity" },
};

function pickStyle(vertical) {
  return VERTICAL_STYLES[vertical] || VERTICAL_STYLES.home;
}

function truncate(input, max) {
  if (!input) return "";
  const text = String(input).trim();
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = truncate(searchParams.get("title") || "MyRocky", 90);
  const subtitle = truncate(searchParams.get("subtitle") || "", 80);
  const vertical = searchParams.get("vertical") || "home";
  const style = pickStyle(vertical);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: style.bg,
          color: style.fg,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "0.04em",
            color: style.accent,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 14,
              height: 14,
              borderRadius: 7,
              background: style.accent,
              marginRight: 14,
            }}
          />
          MYROCKY
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            paddingTop: 32,
            paddingBottom: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: title.length > 50 ? 64 : 80,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                display: "flex",
                fontSize: 32,
                fontWeight: 400,
                marginTop: 28,
                opacity: 0.85,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              opacity: 0.75,
            }}
          >
            myrocky.com
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 24px",
              borderRadius: 999,
              border: `2px solid ${style.accent}`,
              color: style.accent,
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              fontSize: 20,
            }}
          >
            {style.badge}
          </div>
        </div>
      </div>
    ),
    {
      ...SIZE,
      headers: {
        "Cache-Control": "public, immutable, no-transform, max-age=31536000",
      },
    },
  );
}
