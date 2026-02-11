/** 色置換済みSVG文字列 → JPG Blob を Canvas 経由で生成 */
export function svgToJpgBlob(
  svgString: string,
  width: number,
  height: number,
  quality: number = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const base64 = btoa(unescape(encodeURIComponent(svgString)));
    const dataUrl = `data:image/svg+xml;base64,${base64}`;

    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas 2D context not available"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create blob"));
            }
          },
          "image/jpeg",
          quality,
        );
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("Failed to load SVG as image"));
    img.src = dataUrl;
  });
}

/** Blob をファイルとしてダウンロード */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
