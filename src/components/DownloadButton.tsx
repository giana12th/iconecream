import { useState } from "react";
import { THEME } from "../constants/theme";

interface DownloadButtonProps {
  onClick: () => void;
}

export function DownloadButton({ onClick }: DownloadButtonProps) {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "100%",
        padding: "14px 24px",
        fontSize: 15,
        fontWeight: 700,
        color: "#fff",
        background: hover
          ? `linear-gradient(135deg, #e8909e, ${THEME.main})`
          : `linear-gradient(135deg, ${THEME.main}, #e8909e)`,
        border: "none",
        borderRadius: 14,
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: hover
          ? "0 6px 20px rgba(248,164,184,0.4)"
          : "0 4px 12px rgba(248,164,184,0.25)",
        transform: hover ? "translateY(-1px)" : "translateY(0)",
        letterSpacing: "0.02em",
        marginBottom: 20,
      }}
    >
      ダウンロード
    </button>
  );
}
