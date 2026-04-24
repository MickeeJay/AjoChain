import { ImageResponse } from "next/og";

export const runtime = "edge";

const DEFAULT_TITLE = "AjoChain";
const DEFAULT_SUBTITLE = "MiniPay-native rotating savings groups on Celo.";

function truncate(value: string, max = 120) {
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = truncate(searchParams.get("title") ?? DEFAULT_TITLE, 80);
  const subtitle = truncate(searchParams.get("subtitle") ?? DEFAULT_SUBTITLE, 160);

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "linear-gradient(135deg, #f6fff8 0%, #e9fdf3 48%, #def7ff 100%)",
          color: "#03231a",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "64px",
          width: "100%",
        }}
      >
        <div style={{ alignItems: "center", display: "flex", gap: "12px" }}>
          <div
            style={{
              background: "#00a86b",
              borderRadius: "9999px",
              color: "#ffffff",
              display: "flex",
              fontSize: "24px",
              fontWeight: 700,
              height: "56px",
              justifyContent: "center",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              width: "56px",
            }}
          >
            A
          </div>
          <p style={{ color: "#0b4a34", fontSize: "28px", fontWeight: 600, margin: 0 }}>AjoChain</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "960px" }}>
          <h1 style={{ fontSize: "72px", lineHeight: 1.05, margin: 0 }}>{title}</h1>
          <p style={{ color: "#145642", fontSize: "34px", lineHeight: 1.25, margin: 0 }}>{subtitle}</p>
        </div>

        <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
          <p style={{ color: "#0b4a34", fontSize: "28px", margin: 0 }}>Savings circles on Celo</p>
          <p style={{ color: "#0b4a34", fontSize: "26px", margin: 0 }}>minipay-ready</p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}