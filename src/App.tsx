import { useState, useMemo } from "react";
import iconSvgRaw from "./assets/icon.svg?raw";
import { THEME } from "./constants/theme";
import { PRESET_COLORS } from "./constants/presets";
import { replaceSvgColors, svgToDataUrl } from "./utils/svg";
import { svgToJpgBlob, downloadBlob } from "./utils/download";
import { Header } from "./components/Header";
import { Preview } from "./components/Preview";
import { ColorPickers } from "./components/ColorPickers";
import { DownloadButton } from "./components/DownloadButton";
import { AdvancedSettings } from "./components/AdvancedSettings";
import { Terms } from "./components/Terms";
import { Footer } from "./components/Footer";

const initialPreset =
  PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];

export default function App() {
  const [iceColor, setIceColor] = useState(initialPreset.ice);
  const [bgColor, setBgColor] = useState(initialPreset.bg);
  const [size, setSize] = useState(400);

  const previewUrl = useMemo(() => {
    const replaced = replaceSvgColors(iconSvgRaw, iceColor, bgColor);
    return svgToDataUrl(replaced);
  }, [iceColor, bgColor]);

  const handleDownload = async () => {
    try {
      const replaced = replaceSvgColors(iconSvgRaw, iceColor, bgColor);
      const blob = await svgToJpgBlob(replaced, size, size);
      downloadBlob(blob, "iconecream.jpg");
    } catch {
      alert("エラーが発生しました");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: THEME.bg,
        fontFamily:
          "'Helvetica Neue', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif",
        color: THEME.text,
      }}
    >
      <div style={{ maxWidth: 400, margin: "0 auto", padding: "40px 20px 0" }}>
        <Header />
        <Preview previewUrl={previewUrl} />
        <ColorPickers
          iceColor={iceColor}
          bgColor={bgColor}
          onIceColorChange={setIceColor}
          onBgColorChange={setBgColor}
        />
        <DownloadButton onClick={handleDownload} />
        <AdvancedSettings size={size} onSizeChange={setSize} />
        <Terms />
        <Footer />
      </div>
    </div>
  );
}
