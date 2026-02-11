interface PreviewProps {
  previewUrl: string;
}

export function Preview({ previewUrl }: PreviewProps) {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
      <div
        style={{
          width: 280,
          height: 280,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow:
            "0 8px 32px rgba(92,75,81,0.12), 0 2px 8px rgba(92,75,81,0.08)",
          transition: "box-shadow 0.3s ease",
        }}
      >
        {previewUrl && (
          <img
            src={previewUrl}
            alt="アイスクリームアイコン プレビュー"
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        )}
      </div>
    </div>
  );
}
