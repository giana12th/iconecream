import { useState, useRef, useCallback, useEffect } from "react";
// SVGファイルを文字列として読み込む（Viteのraw importを使用）
import iconSvgRaw from "./assets/icon.svg?raw";

/** SVG文字列内の指定要素の色を置換する */
function replaceSvgColors(
  svgString: string,
  iceColor: string,
  bgColor: string,
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");

  // アイス本体の色を変更
  const icecreamEl = doc.getElementById("icecream");
  if (icecreamEl) {
    icecreamEl.setAttribute("fill", iceColor);
    // CSSクラスのfillを上書きするためstyleも設定
    icecreamEl.style.fill = iceColor;
  }

  // 背景色を変更
  const backgroundEl = doc.getElementById("background");
  if (backgroundEl) {
    backgroundEl.setAttribute("fill", bgColor);
    backgroundEl.style.fill = bgColor;
  }

  return new XMLSerializer().serializeToString(doc.documentElement);
}

/** 色置換済みSVG文字列 → JPG Blob を生成する */
function svgToJpgBlob(
  svgString: string,
  width: number,
  height: number,
  quality: number = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // 1. SVG文字列をbase64エンコード
    const base64 = btoa(unescape(encodeURIComponent(svgString)));
    const dataUrl = `data:image/svg+xml;base64,${base64}`;

    // 2. Imageオブジェクトにロード
    const img = new Image();
    img.onload = () => {
      try {
        // 3. Canvasに描画
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas 2D context not available"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // 4. JPGデータを取得
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

/** JPG Blobをダウンロードする */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const App: React.FC = () => {
  const [iceColor, setIceColor] = useState("#61b0e2"); // SVGデフォルト色
  const [bgColor, setBgColor] = useState("#ac75b0"); // SVGデフォルト色
  const [size, setSize] = useState(400);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const prevUrlRef = useRef<string>("");

  // プレビュー用SVGデータURLを生成
  const updatePreview = useCallback(() => {
    const replaced = replaceSvgColors(iconSvgRaw, iceColor, bgColor);
    const base64 = btoa(unescape(encodeURIComponent(replaced)));
    const url = `data:image/svg+xml;base64,${base64}`;

    // 古いobject URLがあれば解放（今回はdata URLなので不要だが念のため）
    if (prevUrlRef.current && prevUrlRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(prevUrlRef.current);
    }
    prevUrlRef.current = url;
    setPreviewUrl(url);
  }, [iceColor, bgColor]);

  // 色が変わるたびにプレビューを更新
  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  // ダウンロード処理
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
        padding: 24,
        fontFamily: "sans-serif",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: 20 }}>Canvas描画方式 検証</h1>

      {/* プレビュー */}
      <div style={{ marginBottom: 16 }}>
        {previewUrl && (
          <img
            src={previewUrl}
            alt="preview"
            style={{ width: 300, height: 300, borderRadius: 8 }}
          />
        )}
      </div>

      {/* カラーピッカー */}
      <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
        <label>
          アイス色
          <br />
          <input
            type="color"
            value={iceColor}
            onChange={(e) => setIceColor(e.target.value)}
          />
        </label>
        <label>
          背景色
          <br />
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
          />
        </label>
      </div>

      {/* サイズ選択 */}
      <div style={{ marginBottom: 16 }}>
        <label>
          ダウンロードサイズ:{" "}
          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          >
            <option value={128}>128 x 128</option>
            <option value={400}>400 x 400</option>
            <option value={800}>800 x 800</option>
            <option value={1024}>1024 x 1024</option>
          </select>
        </label>
      </div>

      {/* ダウンロード */}
      <button
        onClick={handleDownload}
        style={{ padding: "8px 24px", fontSize: 16 }}
      >
        JPGダウンロード
      </button>
    </div>
  );
};

export default App;
