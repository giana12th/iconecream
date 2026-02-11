import { THEME } from "../constants/theme";
import { ColorPickerItem } from "./ColorPickerItem";

interface ColorPickersProps {
  iceColor: string;
  bgColor: string;
  onIceColorChange: (color: string) => void;
  onBgColorChange: (color: string) => void;
}

export function ColorPickers({
  iceColor,
  bgColor,
  onIceColorChange,
  onBgColorChange,
}: ColorPickersProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        marginBottom: 24,
        padding: "16px 20px",
        background: THEME.cardBg,
        borderRadius: 16,
        border: `1px solid ${THEME.border}`,
      }}
    >
      <ColorPickerItem label="アイスの色" value={iceColor} onChange={onIceColorChange} />
      <ColorPickerItem label="背景色" value={bgColor} onChange={onBgColorChange} />
    </div>
  );
}
