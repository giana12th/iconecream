import { THEME } from "../constants/theme";

export function Terms() {
  return (
    <div
      style={{
        padding: "12px 16px",
        fontSize: 11,
        color: THEME.textLight,
        lineHeight: 1.7,
        borderTop: `1px solid ${THEME.border}`,
        marginBottom: 12,
      }}
    >
      <span style={{ fontWeight: 600, color: THEME.text }}>ご利用について</span>
      ：アイコン画像としてご自由にお使いいただけます。画像素材としての販売はご遠慮ください。
    </div>
  );
}
