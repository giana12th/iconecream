import { useState } from "react";
import { THEME } from "../constants/theme";
import { SIZE_PRESETS } from "../constants/presets";

interface AdvancedSettingsProps {
  size: number;
  onSizeChange: (size: number) => void;
}

export function AdvancedSettings({ size, onSizeChange }: AdvancedSettingsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        marginBottom: 20,
        borderRadius: 14,
        border: `1px solid ${THEME.border}`,
        overflow: "hidden",
        background: THEME.cardBg,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 600,
          color: THEME.text,
        }}
      >
        <span>詳細設定</span>
        <span
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            fontSize: 11,
          }}
        >
          ▼
        </span>
      </button>
      {open && (
        <div style={{ padding: "0 20px 16px" }}>
          <div style={{ fontSize: 12, color: THEME.textLight, marginBottom: 10 }}>
            画像サイズ
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SIZE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => onSizeChange(preset.value)}
                style={{
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: size === preset.value ? 700 : 500,
                  color: size === preset.value ? "#fff" : THEME.text,
                  background: size === preset.value ? THEME.accent : "transparent",
                  border: `1.5px solid ${size === preset.value ? THEME.accent : THEME.border}`,
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {preset.label}
                <span
                  style={{ display: "block", fontSize: 10, opacity: 0.7, marginTop: 2 }}
                >
                  {preset.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
