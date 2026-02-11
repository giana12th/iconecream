import { THEME } from "../constants/theme";

interface ColorPickerItemProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export function ColorPickerItem({ label, value, onChange }: ColorPickerItemProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
      <div style={{ position: "relative", width: 48, height: 48, borderRadius: 12, overflow: "hidden" }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: value,
            border: `2px solid ${THEME.border}`,
            borderRadius: 12,
            boxSizing: "border-box",
          }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            opacity: 0,
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            cursor: "pointer",
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
