import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "LRT City Consumer Community";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoData = await readFile(join(process.cwd(), "public/logo.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#1B2430",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 10,
            backgroundColor: "#C1720F",
          }}
        />
        <img src={logoSrc} width={520} height={382} alt="" />
        <div
          style={{
            marginTop: 28,
            fontSize: 56,
            fontWeight: 600,
            color: "#ffffff",
            letterSpacing: -0.5,
          }}
        >
          LRT City Consumer Community
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 28,
            color: "#C1720F",
            fontFamily: "monospace",
          }}
        >
          LRT City Tebet &middot; ADCP
        </div>
      </div>
    ),
    { ...size },
  );
}
