import { THEME } from "../constants/theme";

interface ColorPickerItemProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export function ColorPickerItem({ label, value, onChange }: ColorPickerItemProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
      <div style={{ position: "relative" }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 48,
            height: 48,
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
            padding: 0,
            background: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 12,
            border: `2px solid ${THEME.border}`,
            pointerEvents: "none",
          }}
        />
      </div>
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: THEME.text,
            marginBottom: 2,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 12,
            color: THEME.textLight,
            fontFamily: "'Courier New', monospace",
          }}
        >
          {value.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
