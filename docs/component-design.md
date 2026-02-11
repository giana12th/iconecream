# Iconecream コンポーネント設計書

## コンポーネントツリー

```
App
├── Header（タイトル・説明文）
├── Preview（プレビュー表示）
├── ColorPickers
│   ├── ColorPickerItem（アイス色）
│   └── ColorPickerItem（背景色）
├── DownloadButton
├── AdvancedSettings（折りたたみ）
│   └── SizePresetButton × 4
├── Terms（利用規約）
└── Footer
```

---

## ファイル構成

```
src/
├── App.tsx                  # ルート：状態管理・レイアウト
├── components/
│   ├── Header.tsx           # タイトル・説明
│   ├── Preview.tsx          # プレビュー画像表示
│   ├── ColorPickers.tsx     # カラーピッカー2つのコンテナ
│   ├── ColorPickerItem.tsx  # カラーピッカー1つ分
│   ├── DownloadButton.tsx   # ダウンロードボタン
│   ├── AdvancedSettings.tsx # 折りたたみ設定パネル
│   ├── Terms.tsx            # 利用規約
│   └── Footer.tsx           # フッター
├── utils/
│   ├── svg.ts               # replaceSvgColors, svgToDataUrl
│   └── download.ts          # svgToJpgBlob, downloadBlob
├── constants/
│   ├── presets.ts           # PRESET_COLORS, SIZE_PRESETS
│   └── theme.ts             # THEME カラー定数
├── assets/
│   └── icon.svg             # アイスクリームSVG
└── main.tsx                 # エントリーポイント
```

---

## 各コンポーネント詳細

### App（ルート）

状態管理の中心。全ての状態をここで保持し、子コンポーネントへ props で渡す。

| state      | 型     | 初期値             | 説明                     |
| ---------- | ------ | ------------------ | ------------------------ |
| iceColor   | string | プリセットランダム | アイス本体の色（hex）    |
| bgColor    | string | プリセットランダム | 背景色（hex）            |
| size       | number | 400                | ダウンロードサイズ（px） |
| previewUrl | string | ""                 | プレビュー用 data URL    |

**初期化ロジック**: `useMemo` でプリセットからランダム1セットを選択し、`useState` の初期値に使用。

**プレビュー更新**: `useEffect` で `iceColor` / `bgColor` の変更を監視し、`replaceSvgColors` → `svgToDataUrl` でプレビューURLを再生成。

---

### Header

純粋な表示コンポーネント。props なし。

| 要素 | 内容                                                     |
| ---- | -------------------------------------------------------- |
| h1   | "Iconecream"（グラデーションテキスト）                   |
| p    | "カラーを選ぶだけ。アイスクリームのアイコン画像メーカー" |

---

### Preview

| prop       | 型     | 説明                 |
| ---------- | ------ | -------------------- |
| previewUrl | string | 表示するSVG data URL |

280×280px 固定表示。角丸 + シャドウで立体感を出す。ダウンロードサイズとは独立。

---

### ColorPickers

| prop             | 型                      | 説明                     |
| ---------------- | ----------------------- | ------------------------ |
| iceColor         | string                  | 現在のアイス色           |
| bgColor          | string                  | 現在の背景色             |
| onIceColorChange | (color: string) => void | アイス色変更コールバック |
| onBgColorChange  | (color: string) => void | 背景色変更コールバック   |

内部で `ColorPickerItem` を2つ配置するコンテナ。カード風UIで囲む。

---

### ColorPickerItem

| prop     | 型                      | 説明                              |
| -------- | ----------------------- | --------------------------------- |
| label    | string                  | ラベル（"アイスの色" / "背景色"） |
| value    | string                  | 現在の色（hex）                   |
| onChange | (color: string) => void | 変更コールバック                  |

`<input type="color">` + ラベル + hex値表示。

---

### DownloadButton

| prop    | 型         | 説明             |
| ------- | ---------- | ---------------- |
| onClick | () => void | ダウンロード処理 |

ホバーでグラデーション反転 + Y軸移動のマイクロインタラクション。

---

### AdvancedSettings

| prop         | 型                     | 説明                   |
| ------------ | ---------------------- | ---------------------- |
| size         | number                 | 現在選択中のサイズ     |
| onSizeChange | (size: number) => void | サイズ変更コールバック |

内部で `open` state を持つ。`SIZE_PRESETS` をボタン群で表示。初期状態: 閉じている。

---

### Terms

props なし。インラインテキストで利用規約を表示。

---

### Footer

props なし。コピーライト表示。

---

## ユーティリティ関数

### `svg.ts`

```typescript
/** SVG文字列内の指定要素の色を置換 */
function replaceSvgColors(
    svgString: string,
    iceColor: string,
    bgColor: string,
): string;

/** SVG文字列をbase64 data URLに変換 */
function svgToDataUrl(svgString: string): string;
```

### `download.ts`

```typescript
/** 色置換済みSVG → JPG Blob を Canvas 経由で生成 */
function svgToJpgBlob(
    svgString: string,
    width: number,
    height: number,
    quality?: number,
): Promise<Blob>;

/** Blob をファイルとしてダウンロード */
function downloadBlob(blob: Blob, filename: string): void;
```

---

## 定数

### `presets.ts`

```typescript
const PRESET_COLORS: Array<{ ice: string; bg: string }> = [
    { ice: "#61b0e2", bg: "#ac75b0" }, // ソーダ×パープル
    { ice: "#f7b7c5", bg: "#ffe8a3" }, // ストロベリー×レモン
    { ice: "#a8d8cb", bg: "#f8a4b8" }, // ミント×ピンク
    { ice: "#f5d76e", bg: "#7ec8e3" }, // マンゴー×スカイ
    { ice: "#c3aed6", bg: "#ffe5d9" }, // ラベンダー×ピーチ
];

const SIZE_PRESETS = [
    { label: "Small", value: 128, desc: "128 × 128 px" },
    { label: "Default", value: 400, desc: "400 × 400 px" },
    { label: "Large", value: 800, desc: "800 × 800 px" },
    { label: "XLarge", value: 1024, desc: "1024 × 1024 px" },
];
```

### `theme.ts`

```typescript
const THEME = {
    bg: "#FFF5F5", // ほんのりピンク
    main: "#F8A4B8", // ストロベリーピンク
    accent: "#A8D8CB", // ミントグリーン
    text: "#5C4B51", // ダークブラウン
    textLight: "#8a7680", // サブテキスト
    cardBg: "#ffffff", // カード背景
    border: "#f0e0e4", // ボーダー
};
```

---

## データフロー図

```
  [プリセットからランダム選択]
          ↓
  App (iceColor, bgColor, size)
     ↓ useEffect
  replaceSvgColors() → svgToDataUrl() → previewUrl
          ↓ props
  ┌───────────────────────────────┐
  │  Preview ← previewUrl        │
  │  ColorPickers ← colors + cb  │
  │  DownloadButton ← onClick    │
  │  AdvancedSettings ← size+cb  │
  └───────────────────────────────┘
          ↓ ダウンロード時
  replaceSvgColors() → svgToJpgBlob() → downloadBlob()
```

---

## スタイリング方針

- CSS-in-JS（inline style）を基本とする
    - 理由: コンポーネント数が少なく、CSS Modules や styled-components を入れるまでもない
    - 定数は `theme.ts` に集約して一貫性を保つ
- レスポンシブ: `maxWidth: 400px` + `margin: 0 auto` でモバイルファースト
- アニメーション: ホバー・折りたたみのみ最小限の transition

---

## プリセットカラー（提案）

サイトのストロベリーミントテーマに合う、かわいい組み合わせ5セット。

| #   | 名前                | アイス色  | 背景色    | イメージ              |
| --- | ------------------- | --------- | --------- | --------------------- |
| 1   | ソーダ×パープル     | `#61b0e2` | `#ac75b0` | 既存（SVGデフォルト） |
| 2   | ストロベリー×レモン | `#f7b7c5` | `#ffe8a3` | 甘い暖色系            |
| 3   | ミント×ピンク       | `#a8d8cb` | `#f8a4b8` | サイトテーマカラー    |
| 4   | マンゴー×スカイ     | `#f5d76e` | `#7ec8e3` | トロピカル            |
| 5   | ラベンダー×ピーチ   | `#c3aed6` | `#ffe5d9` | やわらかパステル      |

※ 実装しながら調整可能。モックアップで実際の見た目を確認推奨。
