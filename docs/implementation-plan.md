# Iconecream 実装計画書

## 前提

本計画書は以下のドキュメントをもとに作成している。

| ドキュメント        | 内容                                                |
| ------------------- | --------------------------------------------------- |
| SPEC.md             | 設計仕様書（機能・技術・画面レイアウト）            |
| component-design.md | コンポーネント設計書（ツリー・props・データフロー） |
| svg画像仕様.md      | SVG画像の構造と色変更対象                           |
| 描画検証用App.tsx   | Canvas描画方式の検証済みコード                      |

### 完了済みの検証事項

- SVGレイヤー構造の分離確認
- Canvas描画方式によるSVG → JPG変換
- ブラウザ互換性テスト（iOS Safari含む）
- OGP画像の作成（Illustrator）
- アイスクリームSVGの作成（Illustrator）

---

## 実装フェーズ

全体を5フェーズに分割する。各フェーズは独立して動作確認可能な単位。

---

### Phase 1: プロジェクトセットアップ

**目的**: 開発環境の構築とプロジェクト骨格の作成

**作業内容**:

1. リポジトリ作成（public / MIT）完了
2. Vite + React + TypeScript プロジェクト初期化（Bun使用）完了
   ```bash
   bun create vite iconecream --template react-ts
   ```
3. ディレクトリ構成の作成
   ```
   src/
   ├── components/
   ├── utils/
   ├── constants/
   ├── assets/
   ├── App.tsx
   └── main.tsx
   ```
4. SVGファイルの配置（`src/assets/icon.svg`）完了
5. Viteの設定確認（SVG raw import が動くこと）
6. `index.html` にOGPメタタグを追加
   - title: `Iconecream`
   - description: `カラーを選ぶだけ。アイスクリームのアイコン画像メーカー`
   - OGP画像の配置（`public/ogp.png`）

**完了条件**: `bun dev` で空のReactアプリが起動する。SVG raw import が動作する。

---

### Phase 2: 定数・ユーティリティの実装

**目的**: ビジネスロジックをUIから独立した形で実装する

**作業内容**:

1. `src/constants/theme.ts` の作成

   ```typescript
   export const THEME = {
     bg: "#FFF5F5",
     main: "#F8A4B8",
     accent: "#A8D8CB",
     text: "#5C4B51",
     textLight: "#8a7680",
     cardBg: "#ffffff",
     border: "#f0e0e4",
   };
   ```

2. `src/constants/presets.ts` の作成

   ```typescript
   export const PRESET_COLORS = [
     { ice: "#61b0e2", bg: "#ac75b0" },
     { ice: "#f7b7c5", bg: "#ffe8a3" },
     { ice: "#a8d8cb", bg: "#f8a4b8" },
     { ice: "#f5d76e", bg: "#7ec8e3" },
     { ice: "#c3aed6", bg: "#ffe5d9" },
   ];

   export const SIZE_PRESETS = [
     { label: "Small", value: 128, desc: "128 x 128 px" },
     { label: "Default", value: 400, desc: "400 x 400 px" },
     { label: "Large", value: 800, desc: "800 x 800 px" },
     { label: "XLarge", value: 1024, desc: "1024 x 1024 px" },
   ];
   ```

3. `src/utils/svg.ts` の作成
   - `replaceSvgColors()`: 検証済みコードを移植
   - `svgToDataUrl()`: base64 data URL 変換

4. `src/utils/download.ts` の作成
   - `svgToJpgBlob()`: 検証済みコードを移植
   - `downloadBlob()`: 検証済みコードを移植

**完了条件**: 各関数が単体で呼び出し可能。型定義が通る。

```sh
bun lint
```

---

### Phase 3: コンポーネント実装

**目的**: UIコンポーネントを設計書通りに実装する

**実装順序**: 依存関係のない末端コンポーネントから順に積み上げる。

#### Step 3-1: 表示のみのコンポーネント（props なし）

| コンポーネント | ファイル     | 内容                                       |
| -------------- | ------------ | ------------------------------------------ |
| Header         | `Header.tsx` | タイトル（グラデーションテキスト）+ 説明文 |
| Terms          | `Terms.tsx`  | 利用規約のインラインテキスト               |
| Footer         | `Footer.tsx` | コピーライト                               |

#### Step 3-2: props 受け取りの子コンポーネント

| コンポーネント  | ファイル              | 主要props                    |
| --------------- | --------------------- | ---------------------------- |
| Preview         | `Preview.tsx`         | `previewUrl: string`         |
| ColorPickerItem | `ColorPickerItem.tsx` | `label`, `value`, `onChange` |
| DownloadButton  | `DownloadButton.tsx`  | `onClick`                    |

#### Step 3-3: コンテナコンポーネント

| コンポーネント   | ファイル               | 備考                                 |
| ---------------- | ---------------------- | ------------------------------------ |
| ColorPickers     | `ColorPickers.tsx`     | ColorPickerItem x 2 のコンテナ       |
| AdvancedSettings | `AdvancedSettings.tsx` | 内部 state（`open`）を持つ折りたたみ |

#### Step 3-4: App（ルート）

`App.tsx` に全体を統合する。

- state: `iceColor`, `bgColor`, `size`, `previewUrl`
- `useMemo` でプリセットランダム初期化
- `useEffect` でプレビューリアルタイム更新
- `handleDownload` でJPGダウンロード処理（try/catch → `alert("エラーが発生しました")`）
- 検証用App.tsx のロジックを utils 呼び出しに置き換える形で実装

**完了条件**: 全機能が動作する。カラー変更 → プレビュー反映 → JPGダウンロードの一連のフローが通る。

---

### Phase 4: スタイリング・レスポンシブ対応

**目的**: ストロベリーミントテーマの適用とモバイル対応

**作業内容**:

1. 全体レイアウト
   - `maxWidth: 400px` + `margin: 0 auto` でセンタリング
   - `minHeight: 100vh` + `background: THEME.bg`
   - フォント: `'Helvetica Neue', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif`

2. 各コンポーネントのスタイリング
   - Preview: 280x280px 固定、角丸20px、シャドウ
   - ColorPickers: カード風（白背景 + border + border-radius）
   - DownloadButton: グラデーション背景 + ホバーアニメーション
   - AdvancedSettings: 折りたたみの transition
   - サイズプリセットボタン: 選択状態をミントグリーンで表示

3. レスポンシブ確認
   - iPhone SE（375px）〜 デスクトップで崩れないか
   - カラーピッカーのタップ領域が十分か（48x48px以上）

**完了条件**: モックアップ（iconecream-mockup.jsx）と同等の見た目になる。デスクトップで問題なし。

---

### Phase 5: OGP・デプロイ

**目的**: 本番公開

**作業内容**:

1. `index.html` の最終調整

   ```html
   <meta property="og:title" content="Iconecream" />
   <meta
     property="og:description"
     content="カラーを選ぶだけ。アイスクリームのアイコン画像メーカー"
   />
   <meta property="og:image" content="/ogp.png" />
   <meta property="og:type" content="website" />
   <meta name="twitter:card" content="summary_large_image" />
   ```

2. favicon の設定
   public/favicon.svgを使用

3. GitHub Actions ワークフロー作成
   設定済み

4. Vite の `base` 設定（GitHub Pages用）

   ```typescript
   // vite.config.ts
   export default defineConfig({
     base: "/iconecream/", // リポジトリ名に合わせる
     plugins: [react()],
   });
   ```

5. デプロイ後の確認
   - OGP表示確認（SNSデバッガー等）
   - ダウンロード動作確認（PC / iOS / Android）
   - プレビュー表示確認

**完了条件**: GitHub Pages で公開され、全機能が本番環境で動作する。

---

## 実装順序サマリー

```
Phase 1: プロジェクトセットアップ
  │
Phase 2: 定数・ユーティリティ
  │
Phase 3: コンポーネント実装
  ├── Step 3-1: Header, Terms, Footer
  ├── Step 3-2: Preview, ColorPickerItem, DownloadButton
  ├── Step 3-3: ColorPickers, AdvancedSettings
  └── Step 3-4: App 統合
  │
Phase 4: スタイリング・レスポンシブ
  │
Phase 5: OGP・デプロイ
```

---

## 依存ライブラリ

| パッケージ           | 用途                  | 備考                 |
| -------------------- | --------------------- | -------------------- |
| react                | UIフレームワーク      | Viteテンプレート付属 |
| react-dom            | DOM レンダリング      | Viteテンプレート付属 |
| typescript           | 型チェック            | Viteテンプレート付属 |
| vite                 | ビルドツール          |                      |
| @vitejs/plugin-react | Vite React プラグイン |                      |

外部ライブラリの追加なし。SVG → JPG変換はブラウザ標準API（DOMParser, XMLSerializer, Canvas, Blob）のみで実現する。

---

## リスクと対策

| リスク                     | 影響 | 対策                                         |
| -------------------------- | ---- | -------------------------------------------- |
| プリセットカラーの見栄え   | 低   | Phase 3完了後にプレビューで目視確認し調整    |
| input[type=color] のUI差異 | 低   | ブラウザネイティブUIに委ねる。カスタムは不要 |
| GitHub Pages のキャッシュ  | 低   | Viteのハッシュ付きファイル名で対応           |

---

## 備考

- プリセットカラー残り4セットは仮決定済み（component-design.md の提案値）。Phase 3-4 で実際のプレビューを見ながら最終調整する
- スタイリングは inline style で実装する。CSS ライブラリは導入しない
- Phase 3 と Phase 4 は実際には並行して進めても良い（コンポーネント実装時にスタイルも書くため）
