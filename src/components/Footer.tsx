import { THEME } from "../constants/theme";

export function Footer() {
  return (
    <footer
      style={{
        textAlign: "center",
        padding: "12px 0 24px",
        fontSize: 11,
        color: THEME.textLight,
      }}
    >
      &copy; 2025 Iconecream
    </footer>
  );
}
