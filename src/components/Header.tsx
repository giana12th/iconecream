import { THEME } from "../constants/theme";

export function Header() {
  return (
    <div style={{ textAlign: "center", marginBottom: 28 }}>
      <h1
        style={{
          fontSize: 26,
          fontWeight: 800,
          margin: 0,
          letterSpacing: "-0.02em",
          background: `linear-gradient(135deg, ${THEME.main}, #d4789a)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Iconecream
      </h1>
      <p style={{ fontSize: 12, color: THEME.textLight, margin: "6px 0 0" }}>
        カラーを選ぶだけ。アイスクリームのアイコン画像メーカー
      </p>
    </div>
  );
}
